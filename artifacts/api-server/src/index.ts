import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3000";
const port = rawPort === "passenger" || Number.isNaN(Number(rawPort)) ? (rawPort === "passenger" ? 3000 : rawPort) : Number(rawPort);

app.listen(port as any, () => {
  logger.info({ port }, "Server listening");
});
