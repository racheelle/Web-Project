import express from "express";
import {
  getAdminDashboard,

  getContactMessages,
  markMessageRead,
  markMessageUnread,
  deleteMessage,

  getAdmins,
  getAddAdmin,
  postAddAdmin,
  getEditAdmin,
  postEditAdmin,
  deleteAdmin,


  getPlacesList,
  getAddPlace,
  postAddPlace,
  getEditPlace,
  postEditPlace,
  postDeletePlace
} from "../controllers/adminController.js";

import isAdmin from "../middleware/isAdmin.js";
import { upload } from "../utils/upload.js";

const router = express.Router();

router.get("/", isAdmin, getAdminDashboard);

router.get("/messages", isAdmin, getContactMessages);
router.post("/messages/read/:id", isAdmin, markMessageRead);
router.post("/messages/unread/:id", isAdmin, markMessageUnread);
router.post("/messages/delete/:id", isAdmin, deleteMessage);

router.get("/admins", isAdmin, getAdmins);
router.get("/admins/add", isAdmin, getAddAdmin);
router.post("/admins/add", isAdmin, postAddAdmin);
router.get("/admins/edit/:id", isAdmin, getEditAdmin);
router.post("/admins/edit/:id", isAdmin, postEditAdmin);
router.post("/admins/delete/:id", isAdmin, deleteAdmin);

router.get("/places", isAdmin, getPlacesList);
router.get("/places/add", isAdmin, getAddPlace);

router.post(
  "/places/add",
  isAdmin,
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  postAddPlace
);

router.get("/places/edit/:id", isAdmin, getEditPlace);

router.post(
  "/places/edit/:id",
  isAdmin,
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  postEditPlace
);

router.post("/places/delete/:id", isAdmin, postDeletePlace);

export default router;
