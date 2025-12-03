import express from "express";
import {
  getAdminDashboard,
  getPlacesList,
  getAddPlace,
  postAddPlace,
  getEditPlace,
  postEditPlace,
  postDeletePlace        // ← Added
  
} from "../controllers/adminController.js";

import isAdmin from "../middleware/isAdmin.js";
import {
  getContactMessages,
  markMessageRead,
  markMessageUnread,
  deleteMessage
} from "../controllers/adminController.js";


import { upload } from "../utils/upload.js";

const router = express.Router();



// Dashboard
router.get("/", isAdmin, getAdminDashboard);

// View contact messages
router.get("/messages", isAdmin, getContactMessages);

// Contact messages
router.get("/messages", isAdmin, getContactMessages);

// Message actions
router.post("/messages/read/:id", isAdmin, markMessageRead);
router.post("/messages/unread/:id", isAdmin, markMessageUnread);
router.post("/messages/delete/:id", isAdmin, deleteMessage);


// Places list
router.get("/places", isAdmin, getPlacesList);

// Add Place (GET)
router.get("/places/add", isAdmin, getAddPlace);

// Add Place (POST)
router.post(
  "/places/add",
  isAdmin,
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  postAddPlace
);

// Edit Place (GET)
router.get("/places/edit/:id", isAdmin, getEditPlace);

// Edit Place (POST)
router.post(
  "/places/edit/:id",
  isAdmin,
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  postEditPlace
);

// Delete Place
router.post("/places/delete/:id", isAdmin, postDeletePlace);

export default router;
