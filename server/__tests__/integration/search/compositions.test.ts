import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as searchController from "../../../src/controllers/search-controllers";
import CompositionModel from "../../../src/models/composition-model";
import { Composition } from "../../../src/interfaces/entities";
import ModelError from "../../../src/errors/model-error";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/composition-model");

beforeAll((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockClear();
});

describe("GET /api/search/compositions tests", (): void => {
  describe("Validation error tests", (): void => {
    test("should output validation errors to console and not call searchCompositions", async (): Promise<void> => {
      const searchCompositionsMock: jest.SpyInstance = jest
        .spyOn(searchController, "searchCompositions")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).get(
        "/api/search/compositions"
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while searching compositions:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Search term must be between 1 and 50 characters.",
        }
      );
      expect(searchCompositionsMock).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Search term must be between 1 and 50 characters.",
          },
        ],
      });
      searchCompositionsMock.mockRestore();
    });
    test("should fail with a missing search term", async (): Promise<void> => {
      const response: SupertestResponse = await request(app).get(
        "/api/search/compositions"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Search term must be between 1 and 50 characters.",
          },
        ],
      });
    });
    test("should fail with an empty search term", async (): Promise<void> => {
      const response: SupertestResponse = await request(app)
        .get("/api/search/compositions")
        .query({ term: "" });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Search term must be between 1 and 50 characters.",
          },
        ],
      });
    });
    test("should fail with a search term that is too long", async (): Promise<void> => {
      const response: SupertestResponse = await request(app)
        .get("/api/search/compositions")
        .query({
          term: "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Search term must be between 1 and 50 characters.",
          },
        ],
      });
    });
  });
  describe("Controller error tests", (): void => {
    test("should fail if composition model fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError(
        "Database error while getting compositions.",
        500
      );
      (CompositionModel.getCompositions as jest.Mock).mockRejectedValue(
        mockError
      );
      const response: SupertestResponse = await request(app)
        .get("/api/search/compositions")
        .query({
          term: "sonata",
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: mockError.message,
      });
    });
  });
  test("should successfully get compositions", async (): Promise<void> => {
    const compositions: Partial<Composition>[] = [
      {
        composition_id: "1",
        composer_id: "1",
        title: "sonata number 2",
      },
    ];
    (CompositionModel.getCompositions as jest.Mock).mockResolvedValue(
      compositions
    );
    const response: SupertestResponse = await request(app)
      .get("/api/search/compositions")
      .query({
        term: "sonata",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      compositions: compositions,
    });
  });
});
