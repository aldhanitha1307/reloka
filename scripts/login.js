const firebaseConfig = {
  apiKey: "AIzaSyBC93SMRfjJzhZyQz65MnW4YcYjEpbVe4Q",
  authDomain: "trackify-1672d.firebaseapp.com",
  projectId: "trackify-1672d",
  storageBucket: "trackify-1672d.firebasestorage.app",
  messagingSenderId: "691845221808",
  appId: "1:691845221808:web:5d8db9a0a0346789a95a75",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const submitBtn = form.querySelector(".btn-login");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nipeg = document.getElementById("nipeg").value.trim();
  const password = document.getElementById("password").value;

  if (!nipeg || !password) {
    return showError("NIPEG dan Password wajib diisi");
  }

  loading(true);

  try {
    // ❗ 1) CEK APAKAH INI PEGAWAI
    const pegawaiDoc = await db.collection("pegawai").doc(nipeg).get();

    if (pegawaiDoc.exists) {
      const email = pegawaiDoc.data().Email;

      if (!email) {
        loading(false);
        return showError("Email pegawai tidak tersedia.");
      }

      // 🔑 Login pegawai
      await auth.signInWithEmailAndPassword(email, password);
      localStorage.setItem("NIPEG", nipeg);
      window.location.href = "home.html";
      return;
    }

    // ❗ 2) PEGAWAI TIDAK ADA → CEK APAKAH DIA DEVELOPER/ADMIN
    const users = await db
      .collection("users")
      .where("nipeg", "==", nipeg)
      .get();

    if (!users.empty) {
      const userData = users.docs[0].data();

      // 🔑 Login developer/admin langsung pakai email mereka sendiri
      await auth.signInWithEmailAndPassword(userData.email, password);
      localStorage.setItem("NIPEG", nipeg);
      window.location.href = "home.html";
      return;
    }

    // ❌ Bukan pegawai dan bukan user terdaftar → gagal
    loading(false);
    return showError("NIPEG tidak ditemukan di pegawai atau users");
  } catch (err) {
    console.error(err);
    loading(false);
    return showError("Password salah atau akun tidak valid.");
  }
});

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
}

function loading(state) {
  submitBtn.disabled = state;
  spinner.classList.toggle("hidden", !state);
  btnText.textContent = state ? "Loading..." : "Login";
}
