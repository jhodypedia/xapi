// ==================================================
// Main.js - Frontend Interactions (SPA feel)
// ==================================================

// ------------------ Ripple effect ------------------
document.addEventListener("mousedown", (e) => {
  const t = e.target.closest(".ripple");
  if (!t) return;
  const rect = t.getBoundingClientRect();
  t.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  t.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
});

// ------------------ SweetAlert2 Toast --------------
function toast(icon, title, text) {
  Swal.fire({
    icon,
    title,
    text,
    timer: 2200,
    showConfirmButton: false,
    toast: true,
    position: "top-end"
  });
}

// ------------------ Helper AJAX --------------------
async function postJSON(url, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  } catch (e) {
    console.error("postJSON error:", e);
    return { ok: false, error: "Network error" };
  }
}

// ------------------ Twitter Settings ---------------
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
    if (Object.values(payload).some((v) => !v))
      return toast("error", "Gagal", "Semua field wajib diisi");
    const r = await postJSON("/settings/twitter/test", payload);
    if (r.success) toast("success", "Berhasil", `Terhubung @${r.username}`);
    else Swal.fire({ icon: "error", title: "Gagal", text: r.error || "Error" });
  });
}

if (connectBtn) {
  connectBtn.addEventListener("click", async () => {
    const payload = readTwitterForm();
    if (Object.values(payload).some((v) => !v))
      return toast("error", "Gagal", "Semua field wajib diisi");
    const r = await postJSON("/settings/twitter", payload);
    if (r.success)
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: `Terhubung @${r.username}`
      }).then(() => location.reload());
    else Swal.fire({ icon: "error", title: "Gagal", text: r.error || "Error" });
  });
}

// ------------------ Admin Settings -----------------
async function handleAdminForm(formId, endpoint, successMsg) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const r = await postJSON(endpoint, data);
    if (r.ok) toast("success", "Berhasil", successMsg || "Tersimpan");
    else Swal.fire({ icon: "error", title: "Error", text: r.error || "Gagal" });
  });
}

// reCAPTCHA
handleAdminForm("recaptchaForm", "/admin/settings/recaptcha", "reCAPTCHA disimpan");
// Scheduler
handleAdminForm("schedulerForm", "/admin/settings/scheduler", "Scheduler diperbarui");
// WhatsApp
handleAdminForm("waForm", "/admin/settings/wa", "Nomor WA disimpan");
// TOS
handleAdminForm("tosForm", "/admin/settings/tos", "TOS diperbarui");

// ------------------ SPA-like Navigation ------------
document.querySelectorAll(".ajax-link").forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = link.getAttribute("href");
    if (!url) return;
    try {
      const res = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
      const html = await res.text();
      document.getElementById("content").innerHTML = html;
      history.pushState({}, "", url);
    } catch (e) {
      console.error("AJAX nav error:", e);
    }
  });
});

window.addEventListener("popstate", async () => {
  const url = location.pathname;
  try {
    const res = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    const html = await res.text();
    document.getElementById("content").innerHTML = html;
  } catch (e) {
    console.error("popstate error:", e);
  }
});

// ------------------ Utility: Copy to Clipboard -----
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast("success", "Disalin", "Teks sudah disalin");
  });
}
window.copyText = copyText;

// ------------------ Utility: Confirm Action --------
function confirmAction(message, callback) {
  Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal"
  }).then((r) => {
    if (r.isConfirmed) callback();
  });
}
window.confirmAction = confirmAction;
