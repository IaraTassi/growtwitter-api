import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "dev"}` });

import app from "./app";

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(
    `🌍 Servidor rodando na porta ${porta} no ambiente ${
      process.env.NODE_ENV || "dev"
    }`
  );
});
