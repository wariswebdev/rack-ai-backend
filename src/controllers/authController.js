const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "supersecretkey";

// REGISTER (create tenant + user)
exports.register = async (req, res) => {
  const { name, email, password, tenantName } = req.body;

  try {
    // create tenant
    const tenantRes = await pool.query(
      "INSERT INTO tenants(name) VALUES($1) RETURNING *",
      [tenantName]
    );

    const tenant = tenantRes.rows[0];

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const userRes = await pool.query(
      "INSERT INTO users(name, email, password, tenant_id) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, tenant.id]
    );

    res.json(userRes.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = userRes.rows[0];

    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // create token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};