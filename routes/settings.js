import express from "express";
import bcrypt from "bcryptjs";
import { requireLogin } from "../middlewares/auth.js";
import { User, TwitterAccount } from "../models/index.js";
import { encrypt } from "../utils/crypto.js";
import { normalizePhone } from "../utils/phone.js";
import { TwitterApi } from "twitter-api-v2";

const router = express.Router();

router.get("/settings", requireLogin, async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  const tw = await TwitterAccount.findOne({ where: { userId: user.id } });
  const twitterStatus = tw ? "Connected ✅" : "Not Connected ❌";
  res.render("settings", { title: "Settings", user, twitter: tw, twitterStatus, error:null, success:null });
});

router.post("/settings/profile", requireLogin, async (req, res) => {
  const { username, email, phone } = req.body;
  await User.update({ username, email, phone: normalizePhone(phone) }, { where: { id: req.session.user.id } });
  res.redirect("/settings");
});

router.post("/settings/change-password", requireLogin, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findByPk(req.session.user.id);
  const match = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!match) return res.render("settings", { title:"Settings", user, twitter:null, twitterStatus:"-", error:"Password lama salah", success:null });
  if (newPassword !== confirmPassword) return res.render("settings", { title:"Settings", user, twitter:null, twitterStatus:"-", error:"Konfirmasi tidak sama", success:null });
  const hash = await bcrypt.hash(newPassword, 10);
  await User.update({ passwordHash: hash }, { where: { id: user.id } });
  res.render("settings", { title:"Settings", user, twitter:null, twitterStatus:"-", error:null, success:"Password berhasil diganti" });
});

router.post("/settings/twitter/test", requireLogin, async (req, res) => {
  const { apiKey, apiSecret, accessToken, accessSecret } = req.body;
  try {
    const client = new TwitterApi({ appKey: apiKey, appSecret, accessToken, accessSecret });
    const me = await client.v2.me();
    return res.json({ success: true, username: me.data.username, id: me.data.id });
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
});

router.post("/settings/twitter", requireLogin, async (req, res) => {
  const { apiKey, apiSecret, accessToken, accessSecret } = req.body;
  try {
    const client = new TwitterApi({ appKey: apiKey, appSecret, accessToken, accessSecret });
    const me = await client.v2.me(); // validate
    await TwitterAccount.upsert({
      userId: req.session.user.id,
      apiKey: encrypt(apiKey),
      apiSecret: encrypt(apiSecret),
      accessToken: encrypt(accessToken),
      accessSecret: encrypt(accessSecret)
    });
    return res.json({ success: true, username: me.data.username });
  } catch (e) {
    return res.json({ success: false, error: e.message });
  }
});

export default router;
