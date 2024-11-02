import { Pool } from "pg";
import { DATABASE_URL } from "./config";

const pool: Pool = new Pool({
  connectionString: DATABASE_URL,
});

export default pool;
