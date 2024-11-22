import { Router } from "express";
import { makeReviewValidator } from "../validators/review-validators";
import { makeReviewValidationErrors } from "../middlewares/validation-error-handler";
import { makeReview } from "../controllers/review-controller";

const router: Router = Router();

router.post(
  "/make-review",
  makeReviewValidator,
  makeReviewValidationErrors,
  makeReview
);

export default router;
