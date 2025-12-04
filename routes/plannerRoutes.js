
import express from "express";
import {
  getPlannerList,
  getPlannerNew,
  postPlannerNew,
  getPlannerView,
  postPlannerUpdate,
  savePlannerItem,
  movePlannerItem,
  deletePlanner,
} from "../controllers/plannerController.js";
import isAuth from "../middleware/isAuth.js";

const router = express.Router();

router.get("/", isAuth, getPlannerList);
router.get("/new", isAuth, getPlannerNew);
router.post("/new", isAuth, postPlannerNew);

router.get("/:id", isAuth, getPlannerView);
router.post("/:id", isAuth, postPlannerUpdate);

router.post("/:id/item", isAuth, savePlannerItem);
router.post("/:id/move", isAuth, movePlannerItem);

router.post("/:id/delete", isAuth, deletePlanner);

export default router;
