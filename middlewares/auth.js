const { isTokenValid } = require("../utils/jwt");

const authenticateToken = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.sendStatus(401);
    }

    const payload = isTokenValid({ token });

    req.user = {
      email: payload.email,
      username: payload.username,
      id: payload.userId,
    };

    next();
  } catch (err) {
    next(err);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(401);
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
