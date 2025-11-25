import express from "express";

const router = express.Router();

// Admin dashboard homepage
router.get("/", (req, res) => {
  res.render("admin/dashboard", { pageTitle: "Admin Dashboard" });
});

export default router;
