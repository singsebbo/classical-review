import { Router } from "express";
import {
  searchComposersValidator,
  searchComposerValidator,
  searchCompositionsValidator,
  searchCompositionValidator,
  searchUserValidator,
} from "../validators/search-validators";
import {
  searchComposersValidationErrors,
  searchComposerValidationErrors,
  searchCompositionsValidationErrors,
  searchCompositionValidationErrors,
  searchUserValidationErrors,
} from "../middlewares/validation-error-handler";
import {
  searchComposer,
  searchComposers,
  searchComposition,
  searchCompositions,
  searchUser,
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

router.get(
  "/composition",
  searchCompositionValidator,
  searchCompositionValidationErrors,
  searchComposition
);

router.get(
  "/user",
  searchUserValidator,
  searchUserValidationErrors,
  searchUser
);

export default router;
