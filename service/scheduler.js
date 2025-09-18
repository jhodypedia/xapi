import { Schedule, TweetLog, TwitterAccount, User } from "../models/index.js";
import { decrypt } from "../utils/crypto.js";
import { TwitterApi } from "twitter-api-v2";
import { Op } from "sequelize";
import { sendWA } from "./whatsapp.js";

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

export async function runScheduler() {
  const now = new Date();
  const tasks = await Schedule.findAll({ where: { active: true, nextRun: { [Op.lte]: now } } });
  for (const task of tasks) {
    try {
      const client = await twClient(task.userId);
      const t = await client.v2.tweet(task.text);
      await TweetLog.create({ userId: task.userId, text: task.text, tweetId: t.data.id, ok: true });

      // WA notif sukses
      const user = await User.findByPk(task.userId);
      if (user?.phone) {
        await sendWA(user.phone, `✅ Tweet terjadwal berhasil diposting.\nID: ${t.data.id}\nWaktu: ${new Date().toLocaleString()}\nIsi: ${task.text.slice(0,200)}`);
      }

      if (task.intervalHours) {
        task.nextRun = new Date(Date.now() + task.intervalHours * 3600 * 1000);
        await task.save();
      } else {
        task.active = false;
        await task.save();
      }
    } catch (e) {
      await TweetLog.create({ userId: task.userId, text: task.text, ok: false, error: e.message });
    }
  }
}
