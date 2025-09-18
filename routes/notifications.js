import express from "express";
import { requireLogin } from "../middlewares/auth.js";
import { Notification } from "../models/index.js";

const router = express.Router();

router.get("/notifications", requireLogin, async (req, res) => {
  const items = await Notification.findAll({
    where: { userId: req.session.user.id },
    order: [["createdAt", "DESC"]],
    limit: 100
  });
  if (req.headers["x-requested-with"] === "XMLHttpRequest")
    return res.render("notifications", { title:"Notifications", items, layout:false });
  res.render("notifications", { title:"Notifications", items });
});

export default router;
