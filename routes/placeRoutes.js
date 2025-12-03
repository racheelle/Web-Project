import express from "express";
import { getPlaceDetails } from "../controllers/placeController.js";

const router = express.Router();

// Dynamic place details
router.get("/:id", getPlaceDetails);

export default router;

