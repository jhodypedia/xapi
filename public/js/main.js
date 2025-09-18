// Ripple
document.addEventListener("mousedown", (e) => {
  const t = e.target.closest(".ripple");
  if (!t) return;
  const rect = t.getBoundingClientRect();
  t.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  t.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
});

// Toast
function toast(icon, title, text) {
  Swal.fire({ icon, title, text, timer: 2000, showConfirmButton: false });
}

// Helper fetch
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// Twitter form
function readTwitterForm() {
  return {
    apiKey: document.getElementById("apiKey")?.value.trim(),
    apiSecret: document.getElementById("apiSecret")?.value.trim(),
    accessToken: document.getElementById("accessToken")?.value.trim(),
    accessSecret: document.getElementById("accessSecret")?.value.trim()
  };
}

const testBtn = document.getElementById("testBtn");
const connectBtn = document.getElementById("connectBtn");

if (testBtn) {
  testBtn.addEventListener("click", async () => {
    const payload = readTwitterForm();
    if (Object.values(payload).some(v => !v)) return toast("error", "Gagal", "Semua field wajib diisi");
    const r = await postJSON("/settings/twitter/test", payload);
    if (r.ok) toast("success", "Berhasil", `Terhubung @${r.username}`);
    else Swal.fire({ icon: "error", title: "Gagal Terhubung", text: r.error || "Unknown error" });
  });
}

if (connectBtn) {
  connectBtn.addEventListener("click", async () => {
    const payload = readTwitterForm();
    if (Object.values(payload).some(v => !v)) return toast("error", "Gagal", "Semua field wajib diisi");
    const r = await postJSON("/settings/twitter", payload);
    if (r.ok) Swal.fire({ icon: "success", title: "Tersimpan", text: `Terhubung @${r.username}` }).then(()=>location.reload());
    else Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: r.error || "Unknown error" });
  });
}
