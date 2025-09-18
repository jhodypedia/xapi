import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import { LoginLog, User } from "../models/index.js";
import { sendWA } from "../services/whatsapp.js";

export async function captureLoginLog(req, userId) {
  try {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
    const geo = geoip.lookup(ip) || {};
    const ua = new UAParser(req.headers["user-agent"]).getResult();

    const last = await LoginLog.findOne({ where: { userId }, order: [["createdAt", "DESC"]] });
    let suspicious = false;
    if (last) {
      if (last.ip !== ip || last.city !== geo.city || last.device !== (ua.device.model || "Desktop")) suspicious = true;
    }
    const log = await LoginLog.create({
      userId, ip,
      country: geo.country || "Unknown",
      city: geo.city || "Unknown",
      browser: ua.browser.name,
      os: ua.os.name,
      device: ua.device.model || "Desktop",
      suspicious
    });

    // WA notif untuk suspicious
    if (suspicious) {
      const user = await User.findByPk(userId);
      if (user?.phone) {
        await sendWA(user.phone, `⚠️ Login mencurigakan terdeteksi.\nIP: ${log.ip}\nLokasi: ${log.city || '-'}, ${log.country || '-'}\nPerangkat: ${log.device}\nWaktu: ${new Date(log.createdAt).toLocaleString()}`);
      }
    }
    return suspicious;
  } catch { return false; }
}
