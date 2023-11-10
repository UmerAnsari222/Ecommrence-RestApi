import mongoose from "mongoose";
import { DB_URL } from "../config";
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database is connected to server");
  })
  .catch(() => console.log("Database is not connected to server"));
