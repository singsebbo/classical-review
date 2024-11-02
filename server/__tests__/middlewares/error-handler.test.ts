import { Request, Response, NextFunction } from "express";
import errorHandler from "../../src/middlewares/error-handler";
import ModelError from "../../src/errors/model-error";
import { ValidationError } from "express-validator";

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
  const validationErrors: Partial<ValidationError>[] = [
    { type: "field", msg: "Invalid username" },
    { type: "field", msg: "Password is required" },
  ];
  errorHandler(
    validationErrors as ValidationError[],
    req as Request,
    res as Response,
    next
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    "A validation error has occurred:\n",
    validationErrors[0]
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    "A validation error has occurred:\n",
    validationErrors[1]
  );
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: validationErrors.map((validationError) => ({
      type: validationError.type,
      message: validationError.msg,
    })),
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

test("should handle generic error", (): void => {
  const error: Error = new Error("Generic error");
  error.stack = "Error stack trace";
  errorHandler(error, req as Request, res as Response, next);
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    "An unexpected error has occurred:\n",
    error.stack
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    2,
    "Error details:\n:",
    error
  );
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "An unexpected error occured",
  });
});
