import { Request, Response, NextFunction } from "express";
import errorHandler from "../../../src/middlewares/error-handler";
import ModelError from "../../../src/errors/model-error";
import ValidatorError, {
  ValidationErrorDetail,
} from "../../../src/errors/validator-error";
import EmailError from "../../../src/errors/email-error";

let req: Partial<Request>;
let res: Partial<Response>;
let next: NextFunction;
let consoleErrorSpy: jest.SpyInstance;

// Resets the response and console error spy
beforeEach(() => {
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation((): void => {});
});

// Resets accumulated information and restores original implementation
afterEach(() => {
  consoleErrorSpy.mockRestore();
});

test("should handle validation errors", (): void => {
  const errorMessage = "Error while validating input";
  const validationErrorDetail: ValidationErrorDetail[] = [
    { type: "field", message: "Invalid username" },
    { type: "field", message: "Password is required" },
  ];
  const validatorError: ValidatorError = new ValidatorError(
    errorMessage,
    validationErrorDetail
  );
  validatorError.stack = "Error stack";
  errorHandler(validatorError, req as Request, res as Response, next);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    `${errorMessage}:\n`,
    validatorError.stack
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    "Validation error:\n",
    validationErrorDetail[0]
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    3,
    "Validation error:\n",
    validationErrorDetail[1]
  );
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: validationErrorDetail,
  });
});

test("should handle database model errors", (): void => {
  const modelError: ModelError = new ModelError("Database error", 500, {
    context: "test context",
  });
  modelError.stack = "Error stack trace";
  errorHandler(modelError, req as Request, res as Response, next);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    "A database model error has occurred:\n",
    modelError.stack
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    "Error details:\n",
    modelError
  );
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: modelError.message,
  });
});

test("should handle email errors", (): void => {
  const emailError: EmailError = new EmailError(
    "Email error",
    "Verification",
    "testuser@domain.com"
  );
  emailError.stack = "Error stack trace";
  errorHandler(emailError, req as Request, res as Response, next);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    `${emailError.message}:\n`,
    emailError.stack
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    "Error details:\n",
    emailError
  );
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: emailError.message,
  });
});

test("should handle generic error", (): void => {
  const error: Error = new Error("Generic error");
  error.stack = "Error stack trace";
  errorHandler(error, req as Request, res as Response, next);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    "An unexpected error has occurred:\n",
    error.stack
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "Error details:\n", error);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "An unexpected error occured",
  });
});
