import { Router } from "express";
import { registerUserValidator } from "../validators/account-validators";
import { registerUser } from "../controllers/account-controller";
import { registerUserValidationErrors } from "../middlewares/validation-error-handler";

const router: Router = Router();

router.post(
  "/register",
  registerUserValidator,
  registerUserValidationErrors,
  registerUser
);

export default router;
