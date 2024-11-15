import { Router } from "express";
import { searchComposersValidator } from "../validators/search-validators";
import { searchComposersValidationErrors } from "../middlewares/validation-error-handler";
import { searchComposers } from "../controllers/search-controllers";

const router: Router = Router();

router.get(
  "/composers",
  searchComposersValidator,
  searchComposersValidationErrors,
  searchComposers
);

export default router;
