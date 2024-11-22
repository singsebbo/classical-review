import request, { Response as SupertestResponse } from "supertest";
import * as searchController from "../../../src/controllers/search-controllers";
import app from "../../../src/app";
import CompositionModel from "../../../src/models/composition-model";
import ModelError from "../../../src/errors/model-error";
import ReviewModel from "../../../src/models/review-model";
import { Composition, Review } from "../../../src/interfaces/entities";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/composition-model");
jest.mock("../../../src/models/review-model");

beforeAll((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockClear();
});

describe("GET /api/search/composition tests", (): void => {
  const compositionId = "1";
  describe("Error tests", (): void => {
    test("should output validation errors to the console and not call searchComposition", async (): Promise<void> => {
      const searchCompositionMock: jest.SpyInstance = jest
        .spyOn(searchController, "searchComposition")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).get(
        "/api/search/composition"
      );
      expect(searchCompositionMock).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while getting composition data:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Composition ID must exist.",
        }
      );
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Composition ID must exist.",
          },
        ],
      });
      searchCompositionMock.mockRestore();
    });
    describe("Validation errors", (): void => {
      test("should fail with a missing compositionId", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).get(
          "/api/search/composition"
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Composition ID must exist.",
            },
          ],
        });
      });
      test("should fail if composition does not exist", async (): Promise<void> => {
        (CompositionModel.compositionExists as jest.Mock).mockResolvedValue(
          false
        );
        const response: SupertestResponse = await request(app)
          .get("/api/search/composition")
          .query({ compositionId: compositionId });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Composition does not exist.",
            },
          ],
        });
      });
    });
    describe("Controller errors", (): void => {
      beforeAll((): void => {
        (CompositionModel.compositionExists as jest.Mock).mockResolvedValue(
          true
        );
      });
      test("should fail if getComposition fails", async (): Promise<void> => {
        const mockError: ModelError = new ModelError("Database error", 500);
        (CompositionModel.getComposition as jest.Mock).mockRejectedValue(
          mockError
        );
        const response: SupertestResponse = await request(app)
          .get("/api/search/composition")
          .query({ compositionId: compositionId });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
      test("should fail if getCompositionReviews fails", async (): Promise<void> => {
        (CompositionModel.getComposition as jest.Mock).mockResolvedValue(
          undefined
        );
        const mockError: ModelError = new ModelError("Database error", 500);
        (ReviewModel.getCompositionReviews as jest.Mock).mockRejectedValue(
          mockError
        );
        const response: SupertestResponse = await request(app)
          .get("/api/search/composition")
          .query({ compositionId: compositionId });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
    });
  });
  test("should successfully send response", async (): Promise<void> => {
    (CompositionModel.compositionExists as jest.Mock).mockResolvedValue(true);
    const mockComposition: Partial<Composition> = { composition_id: "1" };
    (CompositionModel.getComposition as jest.Mock).mockResolvedValue(
      mockComposition
    );
    const mockReviews: Partial<Review>[] = [
      { review_id: "1" },
      { review_id: "2" },
    ];
    (ReviewModel.getCompositionReviews as jest.Mock).mockResolvedValue(
      mockReviews
    );
    const response: SupertestResponse = await request(app)
      .get("/api/search/composition")
      .query({ compositionId: compositionId });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      composition: mockComposition,
      reviews: mockReviews,
    });
  });
});
