import express from "express";
const router = express.Router();

// GET — Login
router.get("/login", (req, res) => {
  res.render("auth/login", { pageTitle: "Login" });
});

// GET — Signup
router.get("/signup", (req, res) => {
  res.render("auth/signup", { pageTitle: "Sign Up" });
});

// POST — Login
router.post("/login", (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res.render("auth/login", {
      pageTitle: "Login",
      errorMessage: "Please fill all fields."
    });
  }

  res.redirect("/");
});

// POST — Signup
router.post("/signup", (req, res) => {
  const { name, email, username } = req.body;

  if (!name || !email || !username) {
    return res.render("auth/signup", {
      pageTitle: "Sign Up",
      errorMessage: "Please fill all fields."
    });
  }

  res.redirect("/login");
});

export default router;
