import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode";

let sock = null;
let qrString = null;
let isConnecting = false;

export async function initWhatsApp() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(process.env.WA_STORE || "./wa_store");
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version, auth: state, printQRInTerminal: false,
      syncFullHistory: false, emitOwnEvents: false, markOnlineOnConnect: false
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
      if (qr) qrString = qr;         // untuk ditampilkan di frontend
      if (connection === "open") qrString = null;
      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;
        if (shouldReconnect) setTimeout(initWhatsApp, 2000); // auto reconnect
      }
    });
  } catch (e) {
    console.error("WA init error:", e?.message || e);
    setTimeout(initWhatsApp, 3000);
  } finally {
    isConnecting = false;
  }
}

export async function getWAQrBase64() {
  if (!qrString) return null;
  return await qrcode.toDataURL(qrString);
}

export async function sendWA(jidOrPhone, message) {
  try {
    if (!sock) throw new Error("WA not connected");
    let jid = jidOrPhone;
    if (/^\d+$/.test(jidOrPhone)) jid = jidOrPhone + "@s.whatsapp.net";
    await sock.sendMessage(jid, { text: message });
    return true;
  } catch (e) {
    console.error("sendWA error:", e?.message || e);
    return false;
  }
}
