import express from "express";
import { requireLogin } from "../middlewares/auth.js";
import { TwitterAccount, TweetLog, User } from "../models/index.js";
import { decrypt } from "../utils/crypto.js";
import { TwitterApi } from "twitter-api-v2";
import { sendWA } from "../services/whatsapp.js";

const router = express.Router();

async function twClient(userId) {
  const acc = await TwitterAccount.findOne({ where: { userId } });
  if (!acc) throw new Error("Twitter belum dihubungkan");
  return new TwitterApi({
    appKey: decrypt(acc.apiKey),
    appSecret: decrypt(acc.apiSecret),
    accessToken: decrypt(acc.accessToken),
    accessSecret: decrypt(acc.accessSecret)
  });
}

router.get("/tweets", requireLogin, async (req, res) => {
  try {
    const client = await twClient(req.session.user.id);
    const me = await client.v2.me();
    const tl = await client.v2.userTimeline(me.data.id, {
      max_results: 20,
      "tweet.fields": "created_at,public_metrics"
    });
    const tweets = tl.data?.data || [];
    if (req.headers["x-requested-with"] === "XMLHttpRequest")
      return res.render("tweets", { title:"My Tweets", tweets, layout:false });
    res.render("tweets", { title:"My Tweets", tweets });
  } catch (e) {
    res.render("tweets", { title:"My Tweets", tweets:[], error: e.message });
  }
});

router.post("/tweets", requireLogin, async (req, res) => {
  const { text } = req.body;
  try {
    const client = await twClient(req.session.user.id);
    const t = await client.v2.tweet(text);
    await TweetLog.create({ userId: req.session.user.id, text, tweetId: t.data.id, ok: true });

    // WA notif
    const user = await User.findByPk(req.session.user.id);
    if (user?.phone) {
      await sendWA(user.phone, `✅ Tweet berhasil diposting.\nID: ${t.data.id}\nWaktu: ${new Date().toLocaleString()}\nIsi: ${text.slice(0,200)}`);
    }

    return res.json({ success:true, message:"Tweet berhasil diposting", redirect:"/tweets" });
  } catch (e) {
    await TweetLog.create({ userId: req.session.user.id, text, ok:false, error:e.message });
    return res.json({ success:false, message:e.message });
  }
});

export default router;
