import database from "../../../src/database";
import ModelError from "../../../src/errors/model-error";
import ComposerModel from "../../../src/models/composer-model";

jest.mock("../../../src/database");

describe("insertComposer tests", (): void => {
  const name = "Wolfgang Amadeus Mozart";
  const birthDate = "1756-01-27";
  const deathDate = "1791-12-05";
  test("should fail if query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(
      ComposerModel.insertComposer(name, birthDate, deathDate)
    ).rejects.toThrow(
      new ModelError("Error while inserting composer into database", 500)
    );
  });
  test("should fail if no rows were affected", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      ComposerModel.insertComposer(name, birthDate, deathDate)
    ).rejects.toThrow(
      new ModelError("No rows affected while inserting composer", 500)
    );
  });
  test("should successfully return the composer", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ name: name, birth_date: birthDate, death_date: deathDate }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      ComposerModel.insertComposer(name, birthDate, deathDate)
    ).resolves.toEqual(mockResult.rows[0]);
  });
});
