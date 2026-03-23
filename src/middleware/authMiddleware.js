const jwt = require("jsonwebtoken");

const SECRET = "supersecretkey";

module.exports = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded; // contains userId + tenantId

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};