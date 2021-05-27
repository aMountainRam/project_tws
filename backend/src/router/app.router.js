import {Router} from "express";
import authController from "../controller/auth.controller.js";

const router = new Router();
router.post("/auth",authController.auth)

export default router;