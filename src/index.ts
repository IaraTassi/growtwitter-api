import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
