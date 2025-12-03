import db from "../utils/database.js";

export const getHome = async (req, res) => {
  try {
    // STATIC HIGHLIGHTS (from your design)
    const highlights = [
      {
        title: "Taste and Tradition",
        description:
          "Savor Zahle’s renowned wines and authentic Lebanese cuisine that celebrates centuries of culinary heritage.",
        icon: "/icons/taste.png",
      },
      {
        title: "History and Culture",
        description:
          "Discover charming old churches, riverside promenades, and landmarks that narrate the story of the Bekaa’s vibrant past.",
        icon: "/icons/history.png",
      },
      {
        title: "Scenic Escapes",
        description:
          "Enjoy breathtaking mountain views, lush vineyards, and peaceful riverside spots perfect for a relaxing getaway.",
        icon: "/icons/scenic.png",
      },
    ];

    // ⭐ TOP RATED PLACES
    const [popularPlaces] = await db.execute(`
      SELECT id, name, price_min, price_max, rating, location, main_image
      FROM places
      ORDER BY rating DESC
      LIMIT 6
    `);

    // ⭐ LATEST REVIEWS (new schema)
    const [reviews] = await db.execute(`
      SELECT 
        r.comment, 
        r.rating, 
        u.username AS reviewer,
        u.country
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // ⭐ RENDER HOME PAGE
    res.render("index", {
      pageTitle: "Home",
      highlights,
      popularPlaces,
      reviews,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
      errorMessage: null,
    });

  } catch (error) {
    console.error("Home Controller Error:", error);

    res.render("index", {
      pageTitle: "Home",
      highlights: [],
      popularPlaces: [],
      reviews: [],
      user: req.session.user || null,
      isAuthenticated: !!req.session.user,
      errorMessage: "Could not load homepage data.",
    });
  }
};



export const getAbout = async (req, res) => {
  res.render("about", {
    pageTitle: "About",
    user: req.session.user,
    isAuthenticated: !!req.session.user,
  });
};
