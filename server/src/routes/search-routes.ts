import { Router } from "express";
import {
  searchComposersValidator,
  searchComposerValidator,
  searchCompositionsValidator,
} from "../validators/search-validators";
import {
  searchComposersValidationErrors,
  searchComposerValidationErrors,
  searchCompositionsValidationErrors,
} from "../middlewares/validation-error-handler";
import {
  searchComposer,
  searchComposers,
  searchCompositions,
} from "../controllers/search-controllers";

const router: Router = Router();

router.get(
  "/composers",
  searchComposersValidator,
  searchComposersValidationErrors,
  searchComposers
);

router.get(
  "/compositions",
  searchCompositionsValidator,
  searchCompositionsValidationErrors,
  searchCompositions
);

router.get(
  "/composer",
  searchComposerValidator,
  searchComposerValidationErrors,
  searchComposer
);

export default router;
