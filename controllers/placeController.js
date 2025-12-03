import db from "../utils/database.js";

export const getPlaceDetails = async (req, res) => {
  try {
    const placeId = req.params.id;

    // Fetch place info
    const [placeResult] = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM places p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [placeId]
    );

    if (placeResult.length === 0) {
      return res.status(404).render("404", { pageTitle: "Place Not Found" });
    }

    const place = placeResult[0];

    // Fetch additional images
    const [images] = await db.query(
      `SELECT image_path 
       FROM place_images 
       WHERE place_id = ?`,
      [placeId]
    );

    // Fetch reviews for this place
    const [reviews] = await db.query(
      `SELECT r.rating, r.comment, r.created_at,
              u.username AS reviewer
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.place_id = ?
       ORDER BY r.created_at DESC`,
      [placeId]
    );

    res.render("place-details", {
      pageTitle: place.name,
      place,
      images,
      reviews,
      user: req.session.user || null,
      isAuthenticated: !!req.session.user
    });
  } catch (error) {
    console.error("Place Details Error:", error);
    res.status(500).render("404", { pageTitle: "Error loading place" });
  }
};
