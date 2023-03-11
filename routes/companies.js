const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

// Root route to list all companies.
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM companies");
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

// Add companies.
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let code = slugify(name);
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// Return specific company.
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query("SELECT * FROM companies WHERE code = $1", [
      id,
    ]);
    const invoicesResult = await db.query(
      "SELECT id FROM invoices WHERE comp_code=$1",
      [id]
    );
    let company = results.rows[0];
    let invoices = invoicesResult.rows;
    company.invoices = invoices.map((inv) => inv.id);
    if (results.rows.length === 0) {
      return res.status(404).send("That company can't be found.");
    }
    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

// Update company.
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const results = await db.query(
      "UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4 RETURNING code, name, description",
      [code, name, description, id]
    );
    if (results.rows.length === 0) {
      return res.status(404).send("That company can't be found.");
    }
    return res.json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
