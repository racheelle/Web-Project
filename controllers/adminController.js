import db from "../utils/database.js";
import fs from "fs";
import path from "path";
import rootDir from "../utils/path.js";

/* ==============================================================
   DASHBOARD
================================================================= */
export const getAdminDashboard = async (req, res) => {
  res.render("admin/dashboard", {
    pageTitle: "Admin Dashboard",
    user: req.session.user,
    isAuthenticated: true,
  });
};


/* ==============================================================
   CONTACT MESSAGES (ADMIN VIEW)
================================================================= */
export const getContactMessages = async (req, res) => {
  try {
    const [messages] = await db.query(`
      SELECT id, fname, lname, email, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `);

    res.render("admin/contact-messages", {
      pageTitle: "Contact Messages",
      messages,
      user: req.session.user,
      isAuthenticated: true
    });

  } catch (err) {
    console.log("CONTACT MESSAGES ERROR:", err);
    res.status(500).send("Error loading messages");
  }
};


/* MARK AS READ */
export const markMessageRead = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [id]);
    res.redirect("/admin/messages");
  } catch (err) {
    console.log("READ ERROR:", err);
    res.status(500).send("Error marking message as read");
  }
};

/* MARK AS UNREAD */
export const markMessageUnread = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("UPDATE contact_messages SET is_read = 0 WHERE id = ?", [id]);
    res.redirect("/admin/messages");
  } catch (err) {
    console.log("UNREAD ERROR:", err);
    res.status(500).send("Error marking message as unread");
  }
};

/* DELETE MESSAGE */
export const deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);
    res.redirect("/admin/messages");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).send("Error deleting message");
  }
};



/* ==============================================================
   PLACES LIST
================================================================= */
export const getPlacesList = async (req, res) => {
  const [places] = await db.query(`
    SELECT p.id, p.name, c.name AS category
    FROM places p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `);

  res.render("admin/places-list", {
    pageTitle: "Manage Places",
    places,
    user: req.session.user,
    isAuthenticated: true,
  });
};

/* ==============================================================
   ADD PLACE — (GET)
================================================================= */
export const getAddPlace = async (req, res) => {
  const [categories] = await db.query(`SELECT * FROM categories`);
  res.render("admin/add-place", {
    pageTitle: "Add Place",
    categories,
    user: req.session.user,
    isAuthenticated: true,
  });
};

/* ==============================================================
   ADD PLACE — (POST)
================================================================= */
export const postAddPlace = async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      price_min,
      price_max,
      location,
      days_available
    } = req.body;

    // Convert checkboxes → string
    const daysList = Array.isArray(days_available)
      ? days_available.join(",")
      : days_available || "";

    // Main image
    const mainImage = req.files["main_image"]
      ? req.files["main_image"][0].filename
      : null;

    // Insert into DB
    const [result] = await db.query(
      `INSERT INTO places 
      (name, category_id, description, price_min, price_max, rating, location, days_available, owner_id, main_image)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        name,
        category_id,
        description,
        price_min || null,
        price_max || null,
        location || null,
        daysList,
        req.session.user.id,
        mainImage
      ]
    );

    const placeId = result.insertId;

    // Gallery images
    if (req.files["images"]) {
      for (let img of req.files["images"]) {
        await db.query(
          `INSERT INTO place_images (place_id, image_path)
           VALUES (?, ?)`,
          [placeId, img.filename]
        );
      }
    }

    res.redirect("/admin/places");

  } catch (error) {
    console.log("Add place error:", error);
    res.status(500).send("Error adding place");
  }
};

/* ==============================================================
   EDIT PLACE — (GET)
================================================================= */
export const getEditPlace = async (req, res) => {
  try {
    const placeId = req.params.id;

    // Fetch place
    const [[place]] = await db.execute(
      "SELECT * FROM places WHERE id = ?",
      [placeId]
    );

    if (!place) return res.redirect("/admin/places");

    // Fetch gallery
    const [gallery] = await db.execute(
      "SELECT * FROM place_images WHERE place_id = ?",
      [placeId]
    );

    // Fetch categories
    const [categories] = await db.execute("SELECT id, name FROM categories");

    // Convert "Mon,Tue" → ["Mon","Tue"]
    const selectedDays = place.days_available
      ? place.days_available.split(",")
      : [];

    res.render("admin/editPlace", {
      pageTitle: "Edit Place",
      place,
      gallery,
      categories,
      selectedDays,
      user: req.session.user,
      isAuthenticated: true
    });

  } catch (err) {
    console.log(err);
    res.redirect("/admin/places");
  }
};

/* ==============================================================
   EDIT PLACE — (POST)
================================================================= */
export const postEditPlace = async (req, res) => {
  try {
    const placeId = req.params.id;

    const {
      name,
      category_id,
      description,
      location,
      price_min,
      price_max,
      existing_main_image
    } = req.body;

    // Convert days array → string
    const daysList = Array.isArray(req.body.days)
      ? req.body.days.join(",")
      : "";

    let mainImage = existing_main_image;

    // If new main image uploaded → replace
    if (req.files.main_image) {
      mainImage = req.files.main_image[0].filename;
    }

    // UPDATE main place data
    await db.execute(
      `UPDATE places 
       SET name=?, category_id=?, description=?, location=?, price_min=?, price_max=?, days_available=?, main_image=?
       WHERE id=?`,
      [
        name,
        category_id,
        description,
        location,
        price_min,
        price_max,
        daysList,
        mainImage,
        placeId
      ]
    );

    // INSERT gallery images if any
    if (req.files.images) {
      for (let img of req.files.images) {
        await db.execute(
          "INSERT INTO place_images (place_id, image_path) VALUES (?, ?)",
          [placeId, img.filename]
        );
      }
    }

    res.redirect("/admin/places");

  } catch (err) {
    console.log(err);
    res.redirect(`/admin/places/edit/${req.params.id}`);
  }
};



/* ==============================================================
   DELETE PLACE
================================================================= */
export const postDeletePlace = async (req, res) => {
  try {
    const placeId = req.params.id;

    // Get all images (main + gallery)
    const [[place]] = await db.execute(
      "SELECT main_image FROM places WHERE id = ?",
      [placeId]
    );

    const [gallery] = await db.execute(
      "SELECT image_path FROM place_images WHERE place_id = ?",
      [placeId]
    );

    // Delete main image file
    if (place?.main_image) {
      const imagePath = path.join(rootDir, "public", "uploads", place.main_image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    // Delete gallery image files
    for (let g of gallery) {
      const galPath = path.join(rootDir, "public", "uploads", g.image_path);
      if (fs.existsSync(galPath)) fs.unlinkSync(galPath);
    }

    // Delete gallery records
    await db.execute(
      "DELETE FROM place_images WHERE place_id = ?",
      [placeId]
    );

    // Delete place itself
    await db.execute(
      "DELETE FROM places WHERE id = ?",
      [placeId]
    );

    res.redirect("/admin/places");

  } catch (err) {
    console.log("Delete error:", err);
    res.redirect("/admin/places");
  }
};
