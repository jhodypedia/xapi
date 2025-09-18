import bcrypt from "bcryptjs";
import { User } from "./models/index.js";

export async function seedQuickAdmin(req, res) {
  const exists = await User.findOne({ where: { email: "admin@example.com" } });
  if (exists) return res.send("Admin sudah ada.");
  const hash = await bcrypt.hash("admin123", 10);
  await User.create({
    username: "admin",
    email: "pansastore86@gmail.com",
    passwordHash: hash,
    role: "admin",
    phone: "62812xxxxxxx"
  });
  res.send("✅ Admin dibuat: pansastore86@gmail.com / admin123");
}
