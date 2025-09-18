import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settings.js";
import tweetsRoutes from "./routes/tweets.js";
import notificationsRoutes from "./routes/notifications.js";
import loginLogsRoutes from "./routes/loginLogs.js";
import adminRoutes from "./routes/admin.js";
import scheduleRoutes from "./routes/schedule.js";
import { loadTwitterProfile } from "./middlewares/loadTwitterProfile.js";
import { getAlert } from "./utils/flash.js";
import { initWhatsApp } from "./services/whatsapp.js";
import { runScheduler } from "./services/scheduler.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// EJS + Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// inject locals
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.alert = getAlert(req) || null;
  res.locals.sessionUser = req.session.user || null;
  res.locals.hideLayout = false;
  next();
});

// topbar: twitter avatar
app.use(loadTwitterProfile);

// routes
app.use(authRoutes);
app.use(settingsRoutes);
app.use(tweetsRoutes);
app.use(notificationsRoutes);
app.use(loginLogsRoutes);
app.use(adminRoutes);
app.use(scheduleRoutes);

// home
app.get("/", (req, res) => res.redirect("/dashboard"));

// seed admin cepat (opsional)
import { seedQuickAdmin } from "./seed.js";
app.get("/seed-admin", seedQuickAdmin);

const PORT = process.env.PORT || 3000;
await sequelize.sync();

// WhatsApp init (auto-reconnect)
initWhatsApp();

// Scheduler worker (cek tiap menit)
setInterval(runScheduler, 60 * 1000);

app.listen(PORT, () => console.log(`✅ Server running http://localhost:${PORT}`));
