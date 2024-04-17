import { existsSync, mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { v4 as uuid } from "uuid";

// Get the directory path of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

const dirCodes = join(__dirname, "codes");

if (!existsSync(dirCodes)) {
  mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, content) => {
  const jobId = uuid();
  const filename = `${jobId}.${format}`;
  const filepath = join(dirCodes, filename);
  await writeFileSync(filepath, content);
  return filepath;
};

export default generateFile;
