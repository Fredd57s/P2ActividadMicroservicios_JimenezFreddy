import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Cliente = sequelize.define("Cliente", {
    codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: DataTypes.STRING,
    telefono: DataTypes.STRING
}, {
    tableName: "clientes",
    timestamps: false
});