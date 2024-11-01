import { Router } from "express";
import { registerUser } from "../controllers/account-controller";

const router: Router = Router();

router.post("/register", registerUser);

export default router;
