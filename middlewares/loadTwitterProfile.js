import { TwitterApi } from "twitter-api-v2";
import { decrypt } from "../utils/crypto.js";
import { TwitterAccount } from "../models/index.js";

export async function loadTwitterProfile(req, res, next) {
  res.locals.twitterUser = null;
  if (!req.session.user) return next();
  try {
    const acc = await TwitterAccount.findOne({ where: { userId: req.session.user.id } });
    if (!acc) return next();
    const client = new TwitterApi({
      appKey: decrypt(acc.apiKey),
      appSecret: decrypt(acc.apiSecret),
      accessToken: decrypt(acc.accessToken),
      accessSecret: decrypt(acc.accessSecret)
    });
    const me = await client.v2.me({ "user.fields": "profile_image_url" });
    res.locals.twitterUser = me.data;
  } catch {}
  next();
}
