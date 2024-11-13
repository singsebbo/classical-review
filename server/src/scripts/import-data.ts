import axios, { AxiosResponse } from "axios";
import database from "../database";

/**
 * Gets all composers and compositions from OpenOpus API.
 * @returns A promise that resolves to void.
 */
async function fetchOpenOpusData(): Promise<void> {
  try {
    const response: AxiosResponse = await axios.get(
      "https://api.openopus.org/work/dump.json"
    );
    return response.data.composers;
  } catch (error: unknown) {
    console.error("Error fetching data from OpenOpus", error);
  }
}

async function insertData(): Promise<void> {
  try {
    /**
     * @todo Get composer data
     * @todo Insert composer into database, returning composerId
     * @todo Insert works into database given composerId
     */
  } catch (error: unknown) {}
}
