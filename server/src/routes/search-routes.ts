import { Router } from "express";
import {
  searchComposersValidator,
  searchCompositionsValidator,
} from "../validators/search-validators";
import {
  searchComposersValidationErrors,
  searchCompositionsValidationErrors,
} from "../middlewares/validation-error-handler";
import {
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

export default router;
