import express from "express";
import { requireLogin, isAdmin } from "../middlewares/auth.js";
import { User, LoginLog, Notification, TweetLog } from "../models/index.js";
import { Config } from "../models/Config.js";
import { getWAQrBase64 } from "../services/whatsapp.js";

const router = express.Router();

router.get("/admin", requireLogin, isAdmin, async (req, res) => {
  const totalUsers = await User.count();
  const totalTweets = await TweetLog.count();
  const suspiciousLogins = await LoginLog.count({ where: { suspicious: true } });
  res.render("admin/dashboard", { title:"Admin Dashboard", totalUsers, totalTweets, suspiciousLogins });
});

router.get("/admin/users", requireLogin, isAdmin, async (req, res) => {
  const users = await User.findAll({ order: [["createdAt","DESC"]] });
  res.render("admin/users", { title:"Manage Users", users });
});

router.post("/admin/users/:id/suspend", requireLogin, isAdmin, async (req, res) => {
  await User.update({ role:"suspended" }, { where: { id: req.params.id } });
  res.redirect("/admin/users");
});

router.get("/admin/notifications", requireLogin, isAdmin, async (req, res) => {
  const notes = await Notification.findAll({ order: [["createdAt","DESC"]], limit:100 });
  res.render("admin/notifications", { title:"All Notifications", notes });
});

router.get("/admin/logins", requireLogin, isAdmin, async (req, res) => {
  const logs = await LoginLog.findAll({ order: [["createdAt","DESC"]], limit:100 });
  res.render("admin/logins", { title:"Login Logs", logs });
});

router.get("/admin/tweets", requireLogin, isAdmin, async (req, res) => {
  const logs = await TweetLog.findAll({ order: [["createdAt","DESC"]], limit:100 });
  res.render("admin/tweets", { title:"Tweet Logs", logs });
});

// Admin Settings: reCAPTCHA keys
router.get("/admin/settings", requireLogin, isAdmin, async (req, res) => {
  const siteKey = (await Config.findOne({ where: { key: "recaptcha_site" } }))?.value || "";
  const secret = (await Config.findOne({ where: { key: "recaptcha_secret" } }))?.value || "";
  res.render("admin/settings", { title: "Admin Settings", siteKey, secret });
});
router.post("/admin/settings", requireLogin, isAdmin, async (req, res) => {
  const { siteKey, secret } = req.body;
  await Config.upsert({ key: "recaptcha_site", value: siteKey });
  await Config.upsert({ key: "recaptcha_secret", value: secret });
  res.redirect("/admin/settings");
});

// WhatsApp connect: QR di frontend
router.get("/admin/wa-connect", requireLogin, isAdmin, async (req, res) => {
  const qrBase64 = await getWAQrBase64();
  res.render("admin/wa_connect", { title: "WhatsApp Connect", qrBase64 });
});

export default router;
