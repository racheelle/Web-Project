import db from "../utils/database.js";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get categories
    const [categories] = await db.query("SELECT * FROM categories");

    // Get places
    const [places] = await db.query(`
      SELECT p.id, p.name, p.main_image, p.category_id, c.name AS category
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.render("explore", {
      pageTitle: "Explore Zahle",
      categories,
      places,        // ⭐ SEND places to EJS
      user: req.session.user,
      isAuthenticated: !!req.session.user
    });

  } catch (error) {
    console.log("Explore page error:", error);
    res.status(500).send("Error loading explore page");
  }
});

export default router;
