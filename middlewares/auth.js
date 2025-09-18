export function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role === "suspended") return res.status(403).send("Account suspended");
  next();
}
export function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) return res.redirect("/dashboard");
  next();
}
export function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}
