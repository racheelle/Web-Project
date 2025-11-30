import express from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session"; //npm install express-mysql-session
import path from "path";
// i'll ignore the import dotenv from "dotenv";

import rootDir from "./utils/path.js";
import db from "./utils/database.js";

import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore({}, db);

app.set("view engine", "ejs");
app.set("views", path.join(rootDir, "views"));

app.use(express.static(path.join(rootDir, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "mySuperSecretKey123",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

app.use("/", mainRoutes);
app.use("/", authRoutes);
app.use("/planner", plannerRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/contact", contactRoutes);

app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

app.listen(8000, "localhost", () =>
  console.log("Server running on http://localhost:8000")
);
