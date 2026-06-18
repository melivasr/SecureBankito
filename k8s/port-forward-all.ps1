$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$services = @(
    @{ Name = 'iam-service';          LocalPort = 3001; RemotePort = 3001; Label = 'IAM Service' },
    @{ Name = 'corebancario-service'; LocalPort = 3002; RemotePort = 3002; Label = 'Core Bancario' },
    @{ Name = 'inversiones-service';  LocalPort = 3003; RemotePort = 3003; Label = 'Inversiones' }
)

foreach ($service in $services) {
    $command = "kubectl port-forward svc/$($service.Name) -n securebankito $($service.LocalPort):$($service.RemotePort)"
    Start-Process powershell -ArgumentList @('-NoExit', '-Command', $command)
}

Write-Host 'Port-forwards started in separate PowerShell windows.'
Write-Host 'Keep those windows open while testing with Postman.'
Write-Host ''
Write-Host 'Use these URLs:'
Write-Host '  IAM Service:      http://127.0.0.1:3001/health'
Write-Host '  Core Bancario:    http://127.0.0.1:3002/health'
Write-Host '  Inversiones:      http://127.0.0.1:3003/health'
