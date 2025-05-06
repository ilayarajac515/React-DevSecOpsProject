import express from "express";
import cors from "cors";
import helmet from "helmet";
import adminRouter from "./Routers/admin.Router.js";
import formRouter from "./Routers/form.router.js";
import candidateRouter from "./Routers/candidate.router.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

export const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Mysql Connected");
  }
});

const app = express();

app.use(bodyParser.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
  })
);

app.use("/api/admin", adminRouter);
app.use("/api/mock_form", formRouter);
app.use("/api/users", candidateRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
