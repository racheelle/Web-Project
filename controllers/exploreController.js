import db from "../utils/database.js";

export const getExplore = async (req, res) => {
  try {
    // GET ALL CATEGORIES
    const [categories] = await db.query(`
      SELECT id, name, icon
      FROM categories
      ORDER BY name ASC
    `);

    // GET ALL PLACES (we can filter later)
    const [places] = await db.query(`
      SELECT 
        p.id, p.name, p.price_min, p.price_max, p.rating, 
        p.location, p.main_image,
        c.name AS category
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.rating DESC
    `);

    res.render("explore", {
      pageTitle: "Explore",
      categories,
      places,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user
    });

  } catch (err) {
    console.log("Explore Error:", err);
    res.render("explore", {
      pageTitle: "Explore",
      categories: [],
      places: [],
      errorMessage: "Unable to load explore page.",
      user: req.session.user || null,
      isAuthenticated: !!req.session.user
    });
  }
};
