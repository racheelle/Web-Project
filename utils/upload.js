import multer from "multer";
import path from "path";
import rootDir from "./path.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(rootDir, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(null, false);
}

export const upload = multer({
  storage,
  fileFilter,
});
