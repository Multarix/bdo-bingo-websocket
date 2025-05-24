import fs from "fs";

fs.copyFileSync("./client/index.html", "./dist/client/index.html");
fs.copyFileSync("./client/styles.css", "./dist/client/styles.css");

fs.copyFileSync("./admin/index.html", "./dist/admin/index.html");
fs.copyFileSync("./admin/styles.css", "./dist/admin/styles.css");
