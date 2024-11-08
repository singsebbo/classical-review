import { Router } from "express";
import {
  loginValidator,
  logoutValidator,
  refreshValidator,
  registerUserValidator,
  verifyEmailValidator,
} from "../validators/account-validators";
import {
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
  verifyUser,
} from "../controllers/account-controller";
import {
  loginUserValidationErrors,
  logoutValidationErrors,
  refreshValidationErrors,
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

router.post(
  "/refresh",
  refreshValidator,
  refreshValidationErrors,
  refreshTokens
);

export default router;
