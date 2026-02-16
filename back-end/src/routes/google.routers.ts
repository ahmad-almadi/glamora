import GoogleController from "../controllers/google.controller.js";
import { Router } from "express";
const router = Router();
router.post("/", GoogleController);
export default router;
