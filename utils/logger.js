import fs from "fs";
import path from "path";

const logPath = path.join(process.cwd(), "logs.txt");

export const logToFile = (message) => {
  const logData = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, logData, "utf8");
};
