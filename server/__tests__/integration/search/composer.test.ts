import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as searchController from "../../../src/controllers/search-controllers";
import ComposerModel from "../../../src/models/composer-model";
import CompositionModel from "../../../src/models/composition-model";
import ModelError from "../../../src/errors/model-error";
import { Composer, Composition } from "../../../src/interfaces/entities";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/composer-model");
jest.mock("../../../src/models/composition-model");

beforeAll((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockClear();
});

describe("GET /api/search/composer tests", (): void => {
  describe("Error tests", (): void => {
    test("should not call searchComposer and should handle errors", async (): Promise<void> => {
      const searchComposerMock: jest.SpyInstance = jest
        .spyOn(searchController, "searchComposer")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).get(
        "/api/search/composer"
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while getting composer data:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Composer ID must exist.",
        }
      );
      expect(searchComposerMock).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Composer ID must exist.",
          },
        ],
      });
      searchComposerMock.mockRestore();
    });
    describe("Validation error tests", (): void => {
      test("should fail if composer ID does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).get(
          "/api/search/composer"
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Composer ID must exist.",
            },
          ],
        });
      });
      test("should fail if composer ID is not a string", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .get("/api/search/composer")
          .send({
            composerId: 2,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Composer ID must be a string.",
            },
          ],
        });
      });
      test("should fail if composer does not exist", async (): Promise<void> => {
        (ComposerModel.composerExists as jest.Mock).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .get("/api/search/composer")
          .send({
            composerId: "1",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Composer does not exist.",
            },
          ],
        });
      });
    });
    describe("Controller error tests", (): void => {
      beforeAll((): void => {
        (ComposerModel.composerExists as jest.Mock).mockResolvedValue(true);
      });
      test("getComposer fails", async (): Promise<void> => {
        const mockError: ModelError = new ModelError(
          "Composer Model failed.",
          500
        );
        (ComposerModel.getComposer as jest.Mock).mockRejectedValue(mockError);
        const response: SupertestResponse = await request(app)
          .get("/api/search/composer")
          .send({
            composerId: "1",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
      test("getComposerWorks fails", async (): Promise<void> => {
        (ComposerModel.getComposer as jest.Mock).mockResolvedValue({});
        const mockError: ModelError = new ModelError(
          "Composition Model failed.",
          500
        );
        (CompositionModel.getComposerWorks as jest.Mock).mockRejectedValue(
          mockError
        );
        const response: SupertestResponse = await request(app)
          .get("/api/search/composer")
          .send({
            composerId: "1",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
    });
  });
  test("should successfully searchComposer", async (): Promise<void> => {
    (ComposerModel.composerExists as jest.Mock).mockResolvedValue(true);
    const mockComposer: Partial<Composer> = { composer_id: "1" };
    (ComposerModel.getComposer as jest.Mock).mockResolvedValue(mockComposer);
    const mockComposerWorks: Partial<Composition>[] = [
      { composition_id: "1", composer_id: "1" },
      { composition_id: "2", composer_id: "1" },
    ];
    (CompositionModel.getComposerWorks as jest.Mock).mockResolvedValue(
      mockComposerWorks
    );
    const response: SupertestResponse = await request(app)
      .get("/api/search/composer")
      .send({
        composerId: "1",
      });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      composer: mockComposer,
      compositions: mockComposerWorks,
    });
  });
});
