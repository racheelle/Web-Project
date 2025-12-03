import express from "express";
import { getHome } from "../controllers/mainController.js";

const router = express.Router();

router.get("/", getHome);

router.get("/about", (req, res) =>
  res.render("about", { pageTitle: "About" })
);


export default router;
