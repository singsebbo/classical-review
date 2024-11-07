import { Router } from "express";
import {
  loginValidator,
  registerUserValidator,
  verifyEmailValidator,
} from "../validators/account-validators";
import {
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/account-controller";
import {
  loginUserValidationErrors,
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

router.post("/login", loginValidator, loginUserValidationErrors, loginUser);

export default router;
