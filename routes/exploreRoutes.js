import express from "express";
import { getExplore, getCategoryPlaces } from "../controllers/exploreController.js";

const router = express.Router();

// Main explore page with carousels
router.get("/", getExplore);

// "More" page for a single category
router.get("/category/:categoryId", getCategoryPlaces);

export default router;
