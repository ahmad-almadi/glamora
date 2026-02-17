import { Router } from "express";
import signupController from "../controllers/signup.controller.js"
const router = Router();

router.post("/", signupController);

export default router;