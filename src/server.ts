import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
