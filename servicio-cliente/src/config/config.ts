import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const databaseConfig = {
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5433)
};