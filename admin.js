import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const ADMIN_EMAIL = "0xmousv@proton.me";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const loginForm = document.getElementById("loginForm");
const editor = document.getElementById("editor");
const statusEl = document.getElementById("status");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const urlInput = document.getElementById("downloadUrl");
const versionInput = document.getElementById("version");
const notesInput = document.getElementById("releaseNotes");
const saveBtn = document.getElementById("saveBtn");

function status(message, error=false) {
  statusEl.textContent = message;
  statusEl.style.color = error ? "#bd4b4b" : "#4d9b78";
}

function isAllowed(user) {
  return !!user && (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

onAuthStateChanged(auth, async (user) => {
  if (user && isAllowed(user)) {
    loginForm.classList.add("hidden");
    editor.classList.remove("hidden");
    try {
      const snap = await getDoc(doc(db, "settings", "app"));
      if (snap.exists()) {
        const data = snap.data();
        urlInput.value = data.downloadUrl || "";
        versionInput.value = data.version || "";
        notesInput.value = data.releaseNotes || "";
      }
      status("تم تسجيل الدخول. يمكنك تعديل بيانات الإصدار.");
    } catch (e) {
      status("تعذر قراءة الإعدادات: " + e.message, true);
    }
  } else {
    editor.classList.add("hidden");
    loginForm.classList.remove("hidden");
    if (user) {
      await signOut(auth);
      status("هذا الحساب غير مصرح له بالدخول.", true);
    }
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  status("جارٍ تسجيل الدخول...");
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    passwordInput.value = "";
  } catch (e) {
    status("فشل تسجيل الدخول. راجع البريد وكلمة المرور وإعدادات Firebase. (" + e.code + ")", true);
  }
});

saveBtn.addEventListener("click", async () => {
  const downloadUrl = urlInput.value.trim();
  const version = versionInput.value.trim();
  const releaseNotes = notesInput.value.trim();
  if (!/^https:\/\//i.test(downloadUrl)) {
    status("أدخل رابط تحميل صحيح يبدأ بـ https://", true);
    return;
  }
  if (!version) {
    status("اكتب رقم الإصدار أولاً.", true);
    return;
  }
  if (!isAllowed(auth.currentUser)) {
    status("الحساب الحالي غير مصرح له بالنشر.", true);
    return;
  }
  saveBtn.disabled = true;
  status("جارٍ حفظ التحديث...");
  try {
    await setDoc(doc(db, "settings", "app"), {
      downloadUrl, version, releaseNotes, updatedAt: serverTimestamp()
    }, { merge: true });
    status("تم حفظ بيانات الإصدار. رابط التحميل بالموقع العام سيتحدث تلقائيًا.");
  } catch (e) {
    status("فشل الحفظ: " + e.message, true);
  } finally {
    saveBtn.disabled = false;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  status("تم تسجيل الخروج.");
});
