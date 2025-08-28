import express from "express";
import cors from "cors";
import helmet from "helmet";
import adminRouter from "./Routers/admin.Router.js";
import formRouter from "./Routers/form.Router.js";
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

connection.connect();

const app = express();

app.use(bodyParser.json());
app.use(
  helmet()
);
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "https://devopsinfoane.site",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use("/api/admin", adminRouter);
app.use("/api/mock_form", formRouter);
app.use("/api/candidate", candidateRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
