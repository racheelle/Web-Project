import express from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";

// Routes
import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(
  session({
    secret: "mySuperSecretKey123", //secret value
    resave: false,
    saveUninitialized: true,
  })
);

// Make session user available in EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/", mainRoutes);
app.use("/", authRoutes);
app.use("/planner", plannerRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/contact", contactRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

app.listen(8000, "localhost", () =>
  console.log(`Server running on http://localhost:8000`)
);
