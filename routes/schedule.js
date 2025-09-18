import express from "express";
import { requireLogin } from "../middlewares/auth.js";
import { Schedule } from "../models/Schedule.js";

const router = express.Router();

router.get("/schedule", requireLogin, async (req, res) => {
  const tasks = await Schedule.findAll({ where: { userId: req.session.user.id }, order:[["createdAt","DESC"]] });
  res.render("schedule", { title: "Scheduler", tasks });
});

router.post("/schedule", requireLogin, async (req, res) => {
  const { text, intervalHours } = req.body;
  await Schedule.create({
    userId: req.session.user.id,
    text,
    intervalHours: intervalHours || null,
    nextRun: new Date(Date.now() + 60 * 1000)
  });
  res.redirect("/schedule");
});

export default router;
