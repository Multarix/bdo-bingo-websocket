import fs from "fs";

fs.copyFileSync("./client/index.html", "./dist/client/index.html");
fs.copyFileSync("./client/styles.css", "./dist/client/styles.css");
