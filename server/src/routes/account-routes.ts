import { Router } from "express";
import {
  loginValidator,
  logoutValidator,
  registerUserValidator,
  verifyEmailValidator,
} from "../validators/account-validators";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
} from "../controllers/account-controller";
import {
  loginUserValidationErrors,
  logoutValidationErrors,
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

router.post("/logout", logoutValidator, logoutValidationErrors, logoutUser);

export default router;
