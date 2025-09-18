export function setAlert(req, type, title, message) {
  req.session.alert = { type, title, message };
}
export function getAlert(req) {
  const a = req.session.alert;
  req.session.alert = null;
  return a;
}
