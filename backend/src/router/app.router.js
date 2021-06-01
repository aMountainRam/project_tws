import { Router } from "express";
import authController from "../controller/auth.controller.js";
import userController from "../controller/user.controller.js";

const router = new Router();
// Authentication/Authorization
router.post("/auth", authController.auth);
router.post("/auth/token/login", authController.login);
router.get("/auth/token/refresh", authController.refreshTokens);
router.get("/auth/logout", authController.logout);

// User
router.post("/users/create", userController.createUser);

export default router;
