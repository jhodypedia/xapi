import fetch from "node-fetch";
import { Config } from "../models/Config.js";

export async function injectRecaptchaSite(req, res, next) {
  const site = (await Config.findOne({ where: { key: "recaptcha_site" } }))?.value || "";
  res.locals.recaptchaSite = site;
  next();
}

export async function verifyRecaptcha(req, res, next) {
  const secret = (await Config.findOne({ where: { key: "recaptcha_secret" } }))?.value;
  if (!secret) return next(); // jika belum di-set, lewati
  const token = req.body["g-recaptcha-response"];
  if (!token) return res.status(400).send("Captcha wajib");
  const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token })
  });
  const data = await resp.json();
  if (data.success) return next();
  return res.status(400).send("Captcha salah");
}
