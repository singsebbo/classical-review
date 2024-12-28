import { Router } from "express";
import {
  deleteReviewValidator,
  makeReviewValidator,
} from "../validators/review-validators";
import {
  deleteReviewValidationErrors,
  makeReviewValidationErrors,
} from "../middlewares/validation-error-handler";
import { deleteReview, makeReview } from "../controllers/review-controller";
import { bearerTokenValidator } from "../validators/authentication-validators";
import {
  deleteReviewAuthenticationError,
  makeReviewAuthenticationError,
} from "../middlewares/authentication-error-handler";

const router: Router = Router();

router.post(
  "/make-review",
  bearerTokenValidator,
  makeReviewAuthenticationError,
  makeReviewValidator,
  makeReviewValidationErrors,
  makeReview
);

router.delete(
  "/delete-review",
  bearerTokenValidator,
  deleteReviewAuthenticationError,
  deleteReviewValidator,
  deleteReviewValidationErrors,
  deleteReview
);

export default router;
