import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as searchController from "../../../src/controllers/search-controllers";

let consoleErrorSpy: jest.SpyInstance;

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
  });
});
