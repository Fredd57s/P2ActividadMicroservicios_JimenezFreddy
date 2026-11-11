import { Sequelize } from "sequelize";
import { databaseConfig } from "./config";

const { name, username, password, host, port } = databaseConfig;

if (!name || !username || !password) {
    throw new Error("Revisar vairables de entorno");
}

export const sequelize = new Sequelize(name, username, password, {
    host,
    port,
    dialect: "postgres"
});