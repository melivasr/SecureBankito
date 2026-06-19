$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Assert-LastExit {
    param([string]$Step)
    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed (exit code $LASTEXITCODE)."
    }
}

function Test-MinikubeReady {
    $status = minikube -p minikube status 2>$null | Out-String
    if ($LASTEXITCODE -ne 0) { return $false }

    return ($status -match 'kubelet:\s+Running' -and $status -match 'apiserver:\s+Running')
}

function Test-KubernetesApiReady {
    kubectl --request-timeout=5s cluster-info | Out-Null
    return ($LASTEXITCODE -eq 0)
}

function Reset-MinikubeProfile {
    Write-Host 'Resetting minikube profile and starting a clean cluster...'
    minikube delete -p minikube
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Minikube delete returned a non-zero exit code, continuing with a fresh start attempt.'
    }

    minikube start -p minikube --driver=docker
    Assert-LastExit 'minikube start after reset'
}

function Ensure-Docker {
    docker info | Out-Null
    if ($LASTEXITCODE -eq 0) { return }

    $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path $dockerDesktop) {
        Write-Host 'Docker engine is down. Trying to launch Docker Desktop...'
        Start-Process $dockerDesktop
    }

    $maxAttempts = 24
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 5
        docker info | Out-Null
        if ($LASTEXITCODE -eq 0) { return }
        Write-Host "Waiting for Docker engine... attempt $attempt of $maxAttempts"
    }

    throw 'Docker is not running. Open Docker Desktop, wait for "Engine running", then run the script again.'
}

function Ensure-Minikube {
    if (-not (Test-MinikubeReady)) {
        Write-Host 'Minikube is not running. Starting minikube profile...'
        minikube start -p minikube --driver=docker
    }

    $maxAttempts = 24
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        if (Test-MinikubeReady -and Test-KubernetesApiReady) { return }
        Write-Host "Waiting for Kubernetes API... attempt $attempt of $maxAttempts"
        Start-Sleep -Seconds 5
    }

    Reset-MinikubeProfile

    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        if (Test-MinikubeReady -and Test-KubernetesApiReady) { return }
        Write-Host "Waiting for Kubernetes API after reset... attempt $attempt of $maxAttempts"
        Start-Sleep -Seconds 5
    }

    throw 'Kubernetes API is unreachable. Run "minikube -p minikube start" and try again.'
}

# ─── PREFLIGHT ────────────────────────────────────────────────────────────────

Ensure-Docker
Ensure-Minikube

# ─── BUILD & LOAD IMAGES ─────────────────────────────────────────────────────

$imageTag = 'dev-{0}' -f (Get-Date -Format 'yyyyMMddHHmmss')

$services = @(
    @{ Name = 'iam-service';          Container = 'iam-service';          Path = 'iam-service';          Tag = "securebankito/iam-service:$imageTag" },
    @{ Name = 'corebancario-service'; Container = 'corebancario-service'; Path = 'corebancario-service'; Tag = "securebankito/corebancario-service:$imageTag" },
    @{ Name = 'inversiones-service';  Container = 'inversiones-service';  Path = 'inversiones-service';  Tag = "securebankito/inversiones-service:$imageTag" }
)

Write-Host ''
Write-Host 'Building service images...'
foreach ($service in $services) {
    Write-Host "  -> $($service.Name)"
    docker build -t $service.Tag (Join-Path $repoRoot $service.Path)
    Assert-LastExit "docker build ($($service.Name))"

    $latestTag = "securebankito/$($service.Container):latest"
    docker tag $service.Tag $latestTag
    Assert-LastExit "docker tag ($($service.Name) latest)"

    # Load into Minikube's internal registry so imagePullPolicy: Never works
    minikube -p minikube image load $service.Tag
    Assert-LastExit "minikube image load ($($service.Name))"
    minikube -p minikube image load $latestTag
    Assert-LastExit "minikube image load ($($service.Name) latest)"
}

# ─── APPLY MANIFESTS ─────────────────────────────────────────────────────────

Write-Host ''
Write-Host 'Applying Kubernetes manifests...'

# Namespace first
kubectl apply -f (Join-Path $repoRoot 'k8s\common\namespace.yaml')
Assert-LastExit 'kubectl apply namespace'

# ConfigMaps + Secrets, then DBs, then Apps — one folder at a time to control order
foreach ($domain in @('iam-service', 'corebancario-service', 'inversiones-service')) {
    Write-Host "  -- $domain"
    $domainPath = Join-Path $repoRoot "k8s\$domain"

    kubectl apply -f (Join-Path $domainPath 'configmap-secret.yaml')
    Assert-LastExit "kubectl apply configmap-secret ($domain)"

    kubectl apply -f (Join-Path $domainPath 'db-deployment.yaml')
    Assert-LastExit "kubectl apply db-deployment ($domain)"

    kubectl apply -f (Join-Path $domainPath 'app-deployment.yaml')
    Assert-LastExit "kubectl apply app-deployment ($domain)"
}

# ─── WAIT FOR DATABASES ──────────────────────────────────────────────────────

Write-Host ''
Write-Host 'Waiting for database pods to be ready...'
kubectl rollout status deployment/iam-postgres         -n securebankito --timeout=120s
Assert-LastExit 'iam-postgres rollout'
kubectl rollout status deployment/core-postgres        -n securebankito --timeout=120s
Assert-LastExit 'core-postgres rollout'
kubectl rollout status deployment/inversiones-postgres -n securebankito --timeout=120s
Assert-LastExit 'inversiones-postgres rollout'

# ─── UPDATE IMAGE TAGS ON DEPLOYMENTS ────────────────────────────────────────

Write-Host ''
Write-Host 'Updating deployments to the new image tags...'
foreach ($service in $services) {
    kubectl set image "deployment/$($service.Name)" "$($service.Container)=$($service.Tag)" -n securebankito
    Assert-LastExit "set image $($service.Name)"
}

# ─── WAIT FOR SERVICES ───────────────────────────────────────────────────────

Write-Host ''
Write-Host 'Waiting for service rollouts...'
kubectl rollout status deployment/iam-service          -n securebankito --timeout=120s
Assert-LastExit 'iam-service rollout'
kubectl rollout status deployment/corebancario-service -n securebankito --timeout=120s
Assert-LastExit 'corebancario-service rollout'
kubectl rollout status deployment/inversiones-service  -n securebankito --timeout=120s
Assert-LastExit 'inversiones-service rollout'

# --- RUN SEEDS ----------------------------------------------------------------

Write-Host ''
Write-Host 'Running database seeds inside service pods...'
$seedCommands = @(
    @{ Name = 'iam-service' },
    @{ Name = 'corebancario-service' },
    @{ Name = 'inversiones-service' }
)

foreach ($seed in $seedCommands) {
    kubectl exec -n securebankito "deployment/$($seed.Name)" -- node db/seed.js
    Assert-LastExit "seed $($seed.Name)"
}

# ─── DONE ─────────────────────────────────────────────────────────────────────

Write-Host ''
Write-Host 'Done. Current pods:'
kubectl get pods -n securebankito -o wide

Write-Host ''
Write-Host 'Opening local port-forwards for Postman...'
& (Join-Path $PSScriptRoot 'port-forward-all.ps1')

Write-Host ''
Write-Host 'System ready for local tests.'
