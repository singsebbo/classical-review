import app from "./app";
import { PORT } from "./config";

// Ensures the port always exists
const port = PORT || 3000;

app.listen(port, (): void => {
  console.log(`The server is running on port ${port}`);
});
