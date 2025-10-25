import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

console.log("Olá!");

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
