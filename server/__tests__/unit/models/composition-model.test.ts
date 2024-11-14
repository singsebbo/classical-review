import database from "../../../src/database";
import ModelError from "../../../src/errors/model-error";
import CompositionModel from "../../../src/models/composition-model";

jest.mock("../../../src/database");

describe("insertComposition tests", (): void => {
  const composer_id = "adalk39pajfdfja9efaofj";
  const title = "The me-be song";
  const subtitle = "Silly";
  const genre = "Lullaby";
  const args: [string, string, string, string] = [
    composer_id,
    title,
    subtitle,
    genre,
  ];
  test("should fail if query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database query failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(CompositionModel.insertComposition(...args)).rejects.toThrow(
      new ModelError("Database error while inserting composition.", 500)
    );
  });
  test("should fail if now rows were affected", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(CompositionModel.insertComposition(...args)).rejects.toThrow(
      new ModelError("No rows affected while inserting composition.", 500)
    );
  });
  test("should successfully return the composition", async (): Promise<void> => {
    const mockResult: { rowCount: number; rows: any[] } = {
      rowCount: 1,
      rows: [
        {
          composition_id: "923u40293sfjkl",
          composer_id,
          title,
          subtitle,
          genre,
        },
      ],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(CompositionModel.insertComposition(...args)).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});
