import express from "express";
import {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

// Login
router.get("/login", getLogin);
router.post("/login", postLogin);

// Signup
router.get("/signup", getSignup);
router.post("/signup", postSignup);

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


export default router;
