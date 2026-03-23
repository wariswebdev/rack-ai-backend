const pool = require("../config/db");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  const { name, price } = req.body;
  const tenantId = req.user.tenantId;

  try {
    const result = await pool.query(
      "INSERT INTO products(name, price, tenant_id) VALUES($1,$2,$3) RETURNING *",
      [name, price, tenantId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

// GET PRODUCTS
exports.getProducts = async (req, res) => {
  const tenantId = req.user.tenantId;

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE tenant_id=$1",
      [tenantId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};