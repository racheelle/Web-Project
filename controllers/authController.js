import bcrypt from "bcrypt";
import db from "../utils/database.js";

const SALT_ROUNDS = 10;

/* ===========================
      GET LOGIN PAGE
   =========================== */
export const getLogin = (req, res) => {
  if (req.session.user) return res.redirect("/");

  res.render("auth/login", {
    pageTitle: "Login",
    errorMessage: null,
  });
};

/* ===========================
      GET SIGNUP PAGE
   =========================== */
export const getSignup = (req, res) => {
  if (req.session.user) return res.redirect("/");

  res.render("auth/signup", {
    pageTitle: "Sign Up",
    errorMessage: null,
  });
};

/* ===========================
         POST SIGNUP
   =========================== */
export const postSignup = async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).render("auth/signup", {
      pageTitle: "Sign Up",
      errorMessage: "Please fill in all fields.",
    });
  }

  try {
    // Check if email or username already exists
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).render("auth/signup", {
        pageTitle: "Sign Up",
        errorMessage: "Email or username already in use.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)",
      [name, email, username, hashedPassword]
    );

    // ===========================
    //      AUTO LOGIN AFTER SIGNUP
    // ===========================
    req.session.user = {
      id: result.insertId,
      name,
      email,
      username,
      role: "user",
    };

    return req.session.save(() => {
      res.redirect("/");
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).render("auth/signup", {
      pageTitle: "Sign Up",
      errorMessage: "Something went wrong. Please try again.",
    });
  }
};

/* ===========================
         POST LOGIN
   =========================== */
export const postLogin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).render("auth/login", {
      pageTitle: "Login",
      errorMessage: "Please fill in all fields.",
    });
  }

  try {
    // Find user by email OR username
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).render("auth/login", {
        pageTitle: "Login",
        errorMessage: "Invalid credentials.",
      });
    }

    const user = rows[0];

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render("auth/login", {
        pageTitle: "Login",
        errorMessage: "Invalid credentials.",
      });
    }

    // Save session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return req.session.save(() => {
      res.redirect("/");
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).render("auth/login", {
      pageTitle: "Login",
      errorMessage: "Something went wrong. Please try again.",
    });
  }
};

/* ===========================
           LOGOUT
   =========================== */
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
