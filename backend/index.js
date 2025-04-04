import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { fileURLToPath } from "url";
import authRoutes from "./Routes/authRoutes.js";
import eventRoutes from "./Routes/eventRoutes.js";
import teamRoutes from "./Routes/teamRoutes.js";
import { databaseConnection } from "./Helpers/dbConnection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

app.use(cors());

const __filename = fileURLToPath(import.meta.url);

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Project is running on PORT 5000 successfully");
});

app.use("/", authRoutes);
app.use("/events", eventRoutes);
app.use("/teams", teamRoutes);

server.listen(PORT, () => {
  databaseConnection().then(() => {
    const currentDate = new Date();
    console.log(`Server running on ${PORT}`);
  });
});
