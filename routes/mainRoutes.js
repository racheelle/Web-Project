import express from "express";
import { getHome } from "../controllers/mainController.js";

const router = express.Router();

router.get("/", getHome);

router.get("/about", (req, res) =>
  res.render("about", { pageTitle: "About" })
);
router.get("/explore", (req, res) =>
  res.render("explore", { pageTitle: "Explore" })
);
router.get("/contact", (req, res) =>
  res.render("contact", { pageTitle: "Contact" })
);

export default router;
