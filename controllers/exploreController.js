import db from "../utils/database.js";

const CATEGORY_ORDER = [
  "Restaurants",
  "Local Shops",
  "Historical Landmarks",
  "Hotels & Resorts",
  "Upcoming Events",
];

export const getExplore = async (req, res) => {
  try {
    // 1) Load all categories once
    const [allCategories] = await db.query(
      "SELECT id, name, icon FROM categories"
    );

    // 2) Keep only our 5 main categories and sort in the desired order
    const categories = CATEGORY_ORDER
      .map((name) => allCategories.find((c) => c.name === name))
      .filter(Boolean); // if one is missing, it won't break

    // 3) For each category, fetch up to 5 places (carousel items)
    const placesByCategory = {};

    for (const cat of categories) {
      const [places] = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.price_min,
          p.price_max,
          p.rating,
          p.location,
          p.main_image,
          p.days_available
        FROM places p
        WHERE p.category_id = ?
        ORDER BY p.rating DESC, p.id DESC
        LIMIT 5
        `,
        [cat.id]
      );
      placesByCategory[cat.id] = places;
    }

    res.render("explore", {
      pageTitle: "Explore",
      categories,
      placesByCategory,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  } catch (err) {
    console.error("Explore Error:", err);
    res.render("explore", {
      pageTitle: "Explore",
      categories: [],
      placesByCategory: {},
      errorMessage: "Unable to load explore page.",
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  }
};

export const getCategoryPlaces = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    // 1) Get category info
    const [[category]] = await db.query(
      "SELECT id, name, icon FROM categories WHERE id = ?",
      [categoryId]
    );

    if (!category) {
      return res.status(404).render("404", {
        pageTitle: "Category Not Found",
        user: req.session.user || null,
        isAuthenticated: !!req.session.user,
      });
    }

    // 2) Get ALL places for this category ("More" page)
    const [places] = await db.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price_min,
        p.price_max,
        p.rating,
        p.location,
        p.main_image,
        p.days_available
      FROM places p
      WHERE p.category_id = ?
      ORDER BY p.rating DESC, p.id DESC
      `,
      [categoryId]
    );

    res.render("explore-category", {
      pageTitle: category.name,
      category,
      places,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  } catch (err) {
    console.error("Category Explore Error:", err);
    res.status(500).render("404", {
      pageTitle: "Error loading category",
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
    });
  }
};
