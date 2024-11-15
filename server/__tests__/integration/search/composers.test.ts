import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as searchController from "../../../src/controllers/search-controllers";
import ModelError from "../../../src/errors/model-error";
import ComposerModel from "../../../src/models/composer-model";
import { Composer } from "../../../src/interfaces/entities";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/composer-model");

beforeAll((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockClear();
});

describe("GET /api/search/composers tests", (): void => {
  describe("Validation error tests", (): void => {
    test("should output validation errors to console and not call searchComposers", async (): Promise<void> => {
      const searchComposersMock: jest.SpyInstance = jest
        .spyOn(searchController, "searchComposers")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).get(
        "/api/search/composers"
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while searching composers:\n",
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
      expect(searchComposersMock).not.toHaveBeenCalled();
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
      searchComposersMock.mockRestore();
    });
    test("should fail with a missing search term", async (): Promise<void> => {
      const response: SupertestResponse = await request(app).get(
        "/api/search/composers"
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
        .get("/api/search/composers")
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
        .get("/api/search/composers")
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
    test("should fail if composer model fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError(
        "Database error while getting composers.",
        500
      );
      (ComposerModel.getComposers as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .get("/api/search/composers")
        .query({
          term: "Bach",
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: mockError.message,
      });
    });
  });
  test("should successfully get composers", async (): Promise<void> => {
    const composers: Partial<Composer>[] = [
      {
        composer_id: "1",
        name: "Bach",
        date_of_death: null,
        image_url: null,
      },
    ];
    (ComposerModel.getComposers as jest.Mock).mockResolvedValue(composers);
    const response: SupertestResponse = await request(app)
      .get("/api/search/composers")
      .query({
        term: "Bach",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      composers: composers,
    });
  });
});
