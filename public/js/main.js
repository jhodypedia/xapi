function bindAjaxLinks(){
  document.querySelectorAll(".ajax-link").forEach(a=>{
    a.addEventListener("click", async e=>{
      e.preventDefault();
      const url = a.getAttribute("href");
      const res = await fetch(url, { headers:{ "X-Requested-With":"XMLHttpRequest" } });
      const html = await res.text();
      document.getElementById("content").innerHTML = html;
      window.history.pushState({}, "", url);
      bindAjaxForms();
      bindSettingsTwitterButtons();
    });
  });
}
function bindAjaxForms(){
  document.querySelectorAll("form.ajax").forEach(form=>{
    form.addEventListener("submit", async e=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(form.action, {
        method: form.method || "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      Swal.fire({
        icon: json.success ? "success" : "error",
        title: json.success ? "Berhasil" : "Gagal",
        text: json.message || json.error || ""
      });
      if (json.redirect){
        const r = await fetch(json.redirect, { headers: { "X-Requested-With":"XMLHttpRequest" }});
        const h = await r.text();
        document.getElementById("content").innerHTML = h;
        window.history.pushState({}, "", json.redirect);
        bindAjaxForms();
        bindSettingsTwitterButtons();
      }
    });
  });
}
function bindSettingsTwitterButtons(){
  const testBtn = document.getElementById("testBtn");
  const connectBtn = document.getElementById("connectBtn");
  const getData = () => ({
    apiKey: document.getElementById("apiKey")?.value || "",
    apiSecret: document.getElementById("apiSecret")?.value || "",
    accessToken: document.getElementById("accessToken")?.value || "",
    accessSecret: document.getElementById("accessSecret")?.value || ""
  });
  if (testBtn){
    testBtn.onclick = async () => {
      const res = await fetch("/settings/twitter/test", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(getData())
      });
      const j = await res.json();
      Swal.fire({
        icon: j.success ? "success" : "error",
        title: j.success ? "Berhasil Terhubung" : "Gagal Terhubung",
        text: j.success ? `@${j.username} (ID: ${j.id})` : j.error
      });
    };
  }
  if (connectBtn){
    connectBtn.onclick = async () => {
      const res = await fetch("/settings/twitter", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(getData())
      });
      const j = await res.json();
      Swal.fire({
        icon: j.success ? "success" : "error",
        title: j.success ? "Terhubung" : "Gagal",
        text: j.success ? `Akun: @${j.username} tersimpan` : j.error
      }).then(async ()=>{
        if (j.success){
          const r = await fetch("/settings", { headers:{ "X-Requested-With":"XMLHttpRequest" }});
          const h = await r.text();
          document.getElementById("content").innerHTML = h;
          window.history.pushState({}, "", "/settings");
          bindAjaxForms();
          bindSettingsTwitterButtons();
        }
      });
    };
  }
}
window.addEventListener("popstate", async ()=>{
  const res = await fetch(location.pathname, { headers:{ "X-Requested-With":"XMLHttpRequest" }});
  const html = await res.text();
  document.getElementById("content").innerHTML = html;
  bindAjaxForms();
  bindSettingsTwitterButtons();
});
document.addEventListener("DOMContentLoaded", ()=>{
  bindAjaxLinks();
  bindAjaxForms();
  bindSettingsTwitterButtons();
});
