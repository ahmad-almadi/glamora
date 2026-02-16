import { Router } from "express";
import signupController from "../controllers/signup.controller.js"
import signupGoogleController from "../controllers/google.controller.js"
 const router = Router();

 router.post("/",signupController);
 router.post("/google",signupGoogleController);
 export default router;