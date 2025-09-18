import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Config = sequelize.define("Config", {
  key: { type: DataTypes.STRING, unique: true },
  value: DataTypes.TEXT
}, { timestamps: true });
