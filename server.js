import express from "express";

const app = express();
import { APP_PORT } from "./config";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import path from "path";
require("./db/database");

global.appRoot = path.resolve(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));
app.use("/api", routes);

app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}`));
