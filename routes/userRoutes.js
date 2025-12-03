import express from "express";
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from "../controllers/userController.js";
import {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.patch("/updateMyPassword", protect, updatePassword);

router.get("/me", getMe, getUser);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
