import express from "express";
import {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/login", getLogin);
router.post("/login", postLogin);

router.get("/signup", getSignup);
router.post("/signup", postSignup);

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


export default router;
