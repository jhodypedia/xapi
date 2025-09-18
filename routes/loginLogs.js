import express from "express";
import { requireLogin } from "../middlewares/auth.js";
import { LoginLog } from "../models/index.js";

const router = express.Router();

router.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});

router.get("/my-login-logs", requireLogin, async (req, res) => {
  const logs = await LoginLog.findAll({
    where: { userId: req.session.user.id },
    order: [["createdAt", "DESC"]],
    limit: 50
  });
  if (req.headers["x-requested-with"] === "XMLHttpRequest")
    return res.render("user_login_logs", { title:"Login Logs", logs, layout:false });
  res.render("user_login_logs", { title:"Login Logs", logs });
});

export default router;
