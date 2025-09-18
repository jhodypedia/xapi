import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Schedule = sequelize.define("Schedule", {
  userId: DataTypes.INTEGER,
  text: DataTypes.TEXT,
  intervalHours: DataTypes.INTEGER, // null = sekali
  nextRun: DataTypes.DATE,
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });
