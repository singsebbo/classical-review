import { Router } from "express";
import {
  loginValidator,
  logoutValidator,
  refreshValidator,
  registerUserValidator,
  verifyEmailValidator,
} from "../validators/account-validators";
import {
  getInfo,
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
import { bearerTokenValidator } from "../validators/authentication-validators";
import { accountInfoAuthenticationError } from "../middlewares/authentication-error-handler";

const router: Router = Router();

router.post(
  "/users",
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

router.post("/sessions", loginValidator, loginUserValidationErrors, loginUser);

router.delete("/sessions", logoutValidator, logoutValidationErrors, logoutUser);

router.post(
  "/refresh-tokens",
  refreshValidator,
  refreshValidationErrors,
  refreshTokens
);

router.get(
  "/info",
  bearerTokenValidator,
  accountInfoAuthenticationError,
  getInfo
);

export default router;
