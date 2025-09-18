export function normalizePhone(phone) {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  return d;
}
