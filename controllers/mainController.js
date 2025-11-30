import db from "../utils/database.js";

export const getHome = async (req, res) => {
  try {
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

    const [popularPlaces] = await db.execute(
      "SELECT id, name, price_min, price_max, rating, location, main_image FROM places ORDER BY rating DESC LIMIT 6"
    );

    const [reviews] = await db.execute(
      `SELECT r.comment, r.rating, u.name, u.country
       FROM reviews r 
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    res.render("index", {
      pageTitle: "Home",
      highlights,
      popularPlaces,
      reviews,
    });
  } catch (error) {
    console.log(error);
    res.render("index", {
      pageTitle: "Home",
      highlights: [],
      popularPlaces: [],
      reviews: [],
      errorMessage: "Could not load homepage data.",
    });
  }
};
