import { Router } from "express";
import { makeReviewValidator } from "../validators/review-validators";
import { makeReviewValidationErrors } from "../middlewares/validation-error-handler";
import { makeReview } from "../controllers/review-controller";
import { bearerTokenValidator } from "../validators/authentication-validators";
import { makeReviewAuthenticationError } from "../middlewares/authentication-error-handler";

const router: Router = Router();

router.use(bearerTokenValidator);

router.post(
  "/make-review",
  makeReviewAuthenticationError,
  makeReviewValidator,
  makeReviewValidationErrors,
  makeReview
);

export default router;
