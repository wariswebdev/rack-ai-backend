import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  const { name, email, password, tenantName } = req.body;

  try {
    const tenantRes = await pool.query(
      "INSERT INTO tenants(name) VALUES($1) RETURNING *",
      [tenantName]
    );

    const tenant = tenantRes.rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRes = await pool.query(
      "INSERT INTO users(name, email, password, tenant_id) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, tenant.id]
    );

    res.json(userRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
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