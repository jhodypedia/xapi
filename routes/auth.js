import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { setAlert } from "../utils/flash.js";
import { redirectIfLoggedIn } from "../middlewares/auth.js";
import { captureLoginLog } from "../middlewares/securityLog.js";
import { injectRecaptchaSite, verifyRecaptcha } from "../middlewares/recaptcha.js";

const router = express.Router();

router.get("/login", redirectIfLoggedIn, injectRecaptchaSite, (req, res) => {
  res.render("login", { hideLayout: true, title: "Login", error: null, recaptchaSite: res.locals.recaptchaSite });
});

router.post("/login", verifyRecaptcha, async (req, res) => {
  const { email, password, remember } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    setAlert(req, "error", "Login Gagal", "Email tidak ditemukan");
    return res.redirect("/login");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    setAlert(req, "error", "Login Gagal", "Password salah");
    return res.redirect("/login");
  }
  if (user.role === "suspended") {
    setAlert(req, "error", "Akun Ditangguhkan", "Hubungi admin.");
    return res.redirect("/login");
  }

  req.session.user = { id: user.id, email: user.email, role: user.role };
  if (remember) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
  else req.session.cookie.expires = false;

  const suspicious = await captureLoginLog(req, user.id);
  setAlert(
    req,
    suspicious ? "warning" : "success",
    suspicious ? "Login Mencurigakan" : "Login Berhasil",
    suspicious ? "Kami mendeteksi perangkat/lokasi berbeda." : "Selamat datang kembali!"
  );

  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

export default router;
