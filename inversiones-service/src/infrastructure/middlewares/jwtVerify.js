const jwt = require('jsonwebtoken');

function jwtVerify(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'TOKEN_MISSING', message: 'Authorization header requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.sub,
      username: decoded.username,
      clearance: decoded.clearance,
      integrity: decoded.integrity,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'TOKEN_INVALID_OR_EXPIRED', message: 'Token invalido o expirado' });
  }
}

module.exports = jwtVerify;
