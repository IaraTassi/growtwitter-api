import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        resetTestDB() {
          console.log("Resetando banco de testes...");
          // aqui você coloca a lógica para limpar o banco
          // ex: deletar todas as tabelas ou usar prisma migrate reset
          return null;
        },
      });
    },
  },
});
