import { Router } from "express";
import authController from "../controller/auth.controller.js";
import userController from "../controller/user.controller.js";

const router = new Router();
// Authentication/Authorization
router.post("/auth", authController.auth);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.post("/auth/refresh", authController.refreshTokens);

// User
router.post("/users/create", userController.createUser);

export default router;
