import express from "express";
import { getContact, postContact } from "../controllers/contactController.js";

const router = express.Router();

// REMOVED the extra "/contact" here
router.get("/", getContact);
router.post("/", postContact);

export default router;
