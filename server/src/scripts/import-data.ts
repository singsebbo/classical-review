import axios, { AxiosResponse } from "axios";
import { Composer, OpenOpusComposer } from "../interfaces/entities";
import ComposerModel from "../models/composer-model";
import CompositionModel from "../models/composition-model";

/**
 * Gets all composers and compositions from OpenOpus API.
 * @returns A promise that resolves to the OpenOpusComposers.
 */
async function fetchOpenOpusData(): Promise<OpenOpusComposer[]> {
  try {
    console.log("Fetching Open Opus data...");
    const response: AxiosResponse = await axios.get<OpenOpusComposer>(
      "https://api.openopus.org/work/dump.json"
    );
    console.log("Fetched data:", response.data.composers);
    return response.data.composers;
  } catch (error: unknown) {
    console.error("Error fetching data from OpenOpus", error);
    throw new Error("Error while fetching data.");
  }
}

/**
 * Inserts the data of a composer and their works into the database.
 * @param {OpenOpusComposer} c Inserts data into database given a composer.
 */
async function insertData(c: OpenOpusComposer): Promise<void> {
  try {
    const composer: Composer = await ComposerModel.insertComposer(
      c.complete_name,
      c.birth,
      c.death
    );
    for (const work of c.works) {
      await CompositionModel.insertComposition(
        composer.composer_id,
        work.title,
        work.subtitle,
        work.genre
      );
    }
  } catch (error: unknown) {
    console.error("Error while inserting data", error);
    throw new Error("Database error while inserting data.");
  }
}

/**
 * Main function that fetches and inserts the data.
 */
(async function main() {
  try {
    const allComposers: OpenOpusComposer[] = await fetchOpenOpusData();
    for (const composer of allComposers) {
      await insertData(composer);
    }
  } catch (error: unknown) {
    console.error("Error in main function", error);
  }
})();
