import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./config/cors.config";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

const porta = process.env.PORT;
app.listen(porta, () => {
  console.log(`O servidor está executando na porta ${porta}`);
});
