// executePy.js

import { exec } from "child_process";

const executePy = (filepath) => {
  return new Promise((resolve, reject) => {
    exec(
      `python "${filepath}"`, // Enclose filepath in quotes
      (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
        } else if (stderr) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      }
    );
  });
};

export default executePy;


