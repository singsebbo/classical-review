import { Router } from "express";
import {
  changeReviewValidator,
  deleteReviewValidator,
  makeReviewValidator,
} from "../validators/review-validators";
import {
  changeReviewValidationErrors,
  deleteReviewValidationErrors,
  makeReviewValidationErrors,
} from "../middlewares/validation-error-handler";
import {
  changeReview,
  deleteReview,
  makeReview,
} from "../controllers/review-controller";
import { bearerTokenValidator } from "../validators/authentication-validators";
import {
  changeReviewAuthenticationError,
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

router.put(
  "/change-review",
  bearerTokenValidator,
  changeReviewAuthenticationError,
  changeReviewValidator,
  changeReviewValidationErrors,
  changeReview
);

export default router;
