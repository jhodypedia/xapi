import { TwitterAccount, User } from "../models/index.js";
import { decrypt } from "../utils/crypto.js";
import { TwitterApi } from "twitter-api-v2";

export async function loadTwitterProfile(req, res, next) {
  res.locals.twitterUser = null;

  try {
    if (!req.session.user) return next();

    // ambil user dari DB
    const user = await User.findByPk(req.session.user.id);

    // cari apakah sudah ada akun twitter di DB
    const acc = await TwitterAccount.findOne({ where: { userId: user.id } });

    if (acc) {
      try {
        // koneksi ke Twitter API
        const client = new TwitterApi({
          appKey: decrypt(acc.apiKey),
          appSecret: decrypt(acc.apiSecret),
          accessToken: decrypt(acc.accessToken),
          accessSecret: decrypt(acc.accessSecret)
        });

        const me = await client.v2.me({ "user.fields": "profile_image_url,username" });
        res.locals.twitterUser = {
          username: me.data.username,
          profile_image_url: me.data.profile_image_url
        };
      } catch (err) {
        console.error("Twitter API error:", err.message);
      }
    }

    // fallback kalau twitterUser masih null
    if (!res.locals.twitterUser) {
      res.locals.twitterUser = {
        username: user.username || user.email.split("@")[0],
        profile_image_url: "/img/default-avatar.png" // siapkan gambar default di /public/img
      };
    }

  } catch (err) {
    console.error("loadTwitterProfile error:", err.message);
  }

  next();
}
