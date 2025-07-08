import { Router } from "express";
import {
  changeReviewValidator,
  deleteReviewValidator,
  likeReviewValidator,
  makeReviewValidator,
  unlikeReviewValidator,
} from "../validators/review-validators";
import {
  changeReviewValidationErrors,
  deleteReviewValidationErrors,
  likeReviewValidationErrors,
  makeReviewValidationErrors,
  unlikeReviewValidationErrors,
} from "../middlewares/validation-error-handler";
import {
  changeReview,
  deleteReview,
  likeReview,
  makeReview,
  unlikeReview,
} from "../controllers/review-controller";
import { bearerTokenValidator } from "../validators/authentication-validators";
import {
  changeReviewAuthenticationError,
  deleteReviewAuthenticationError,
  likeReviewAuthenticationError,
  makeReviewAuthenticationError,
  unlikeReviewAuthenticationError,
} from "../middlewares/authentication-error-handler";

const router: Router = Router();

router.post(
  "/reviews",
  bearerTokenValidator,
  makeReviewAuthenticationError,
  makeReviewValidator,
  makeReviewValidationErrors,
  makeReview
);

router.delete(
  "/reviews",
  bearerTokenValidator,
  deleteReviewAuthenticationError,
  deleteReviewValidator,
  deleteReviewValidationErrors,
  deleteReview
);

router.put(
  "/reviews",
  bearerTokenValidator,
  changeReviewAuthenticationError,
  changeReviewValidator,
  changeReviewValidationErrors,
  changeReview
);

router.post(
  "/likes",
  bearerTokenValidator,
  likeReviewAuthenticationError,
  likeReviewValidator,
  likeReviewValidationErrors,
  likeReview
);

router.delete(
  "/likes",
  bearerTokenValidator,
  unlikeReviewAuthenticationError,
  unlikeReviewValidator,
  unlikeReviewValidationErrors,
  unlikeReview
);

export default router;
