import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.config";
import { errorHandler } from "./middlewares/error.handler.middleware";
import userRoutes from "./routes/user.router";
import tweetRoutes from "./routes/tweet.router";
import likeRoutes from "./routes/like.router";
import followRoutes from "./routes/follow.router";

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use("/api/users", userRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/follows", followRoutes);
app.use(errorHandler);

export default app;
