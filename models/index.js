import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT }
);

export const User = sequelize.define("User", {
  username: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  passwordHash: DataTypes.TEXT,
  phone: DataTypes.STRING,
  role: { type: DataTypes.STRING, defaultValue: "user" } // user | admin | suspended
}, { timestamps: true });

export const Schedule = sequelize.define("Schedule", {
  userId: DataTypes.INTEGER,
  text: DataTypes.TEXT,
  intervalHours: DataTypes.INTEGER, // null = sekali
  nextRun: DataTypes.DATE,
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

export const Config = sequelize.define("Config", {
  key: { type: DataTypes.STRING, unique: true },
  value: DataTypes.TEXT
}, { timestamps: true });

export const TwitterAccount = sequelize.define("TwitterAccount", {
  apiKey: DataTypes.TEXT,
  apiSecret: DataTypes.TEXT,
  accessToken: DataTypes.TEXT,
  accessSecret: DataTypes.TEXT
}, { timestamps: true });

export const Notification = sequelize.define("Notification", {
  title: DataTypes.STRING,
  message: DataTypes.TEXT,
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

export const LoginLog = sequelize.define("LoginLog", {
  ip: DataTypes.STRING,
  country: DataTypes.STRING,
  city: DataTypes.STRING,
  browser: DataTypes.STRING,
  os: DataTypes.STRING,
  device: DataTypes.STRING,
  suspicious: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

export const TweetLog = sequelize.define("TweetLog", {
  text: DataTypes.TEXT,
  tweetId: DataTypes.STRING,
  ok: DataTypes.BOOLEAN,
  error: DataTypes.TEXT
}, { timestamps: true });

// relations
User.hasOne(TwitterAccount, { foreignKey: "userId" });
TwitterAccount.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

User.hasMany(LoginLog, { foreignKey: "userId" });
LoginLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(TweetLog, { foreignKey: "userId" });
TweetLog.belongsTo(User, { foreignKey: "userId" });
