import express from "express";
// eslint-disable-next-line import/no-duplicates
import {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getToursStats,
  getmonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} from "../controllers/tourController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import reviewRouter from "./reviewRoutes.js";

const router = express.Router();

// POST /tour/234fad4/reviwes
// GET /tour/234fad4/reviwes
router.use("/:tourId/reviews", reviewRouter);

// Routes
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getToursStats);
router.route("/monthly-plan/:year").get(protect, restrictTo("admin", "lead-guide", "guide"), getmonthlyPlan);
router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(getDistances);
router.route("/").get(getAllTours).post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

export default router;
