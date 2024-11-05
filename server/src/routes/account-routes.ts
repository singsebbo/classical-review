import { Router } from "express";
import {
  registerUserValidator,
  verifyEmailValidator,
} from "../validators/account-validators";
import { registerUser, verifyUser } from "../controllers/account-controller";
import {
  registerUserValidationErrors,
  verifyEmailValidationErrors,
} from "../middlewares/validation-error-handler";

const router: Router = Router();

router.post(
  "/register",
  registerUserValidator,
  registerUserValidationErrors,
  registerUser
);

router.put(
  "/verify-email",
  verifyEmailValidator,
  verifyEmailValidationErrors,
  verifyUser
);

export default router;
