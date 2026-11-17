import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const downloadBtn = document.getElementById("downloadBtn");
const versionEl = document.getElementById("publicVersion");
const notesEl = document.getElementById("publicNotes");

onSnapshot(doc(db, "settings", "app"), (snapshot) => {
  const data = snapshot.data() || {};
  const url = typeof data.downloadUrl === "string" ? data.downloadUrl.trim() : "";
  if (versionEl) versionEl.textContent = data.version || "غير محدد";
  if (notesEl) notesEl.textContent = data.releaseNotes || "لا توجد ملاحظات إصدار.";
  if (downloadBtn) {
    if (url && /^https:\/\//i.test(url)) {
      downloadBtn.href = url;
      downloadBtn.target = "_blank";
      downloadBtn.rel = "noopener noreferrer";
      downloadBtn.removeAttribute("aria-disabled");
      downloadBtn.classList.remove("disabled");
    } else {
      downloadBtn.href = "#contact";
      downloadBtn.setAttribute("aria-disabled", "true");
      downloadBtn.classList.add("disabled");
      downloadBtn.title = "رابط التحميل لم يتم نشره بعد";
    }
  }
}, (error) => {
  console.error("Could not load public release settings:", error);
  if (versionEl) versionEl.textContent = "غير متاح حاليًا";
  if (notesEl) notesEl.textContent = "تعذر تحميل بيانات الإصدار.";
});
