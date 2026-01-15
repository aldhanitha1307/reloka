// ==== FIREBASE CONFIG ====
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

// ==== SIGN UP HANDLER ====
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nipeg = document.getElementById("nipeg").value.trim();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const pass2 = document.getElementById("confirmPassword").value.trim();
  const errorBox = document.getElementById("errorMessage");

  errorBox.classList.add("hidden");

  // === VALIDASI PASSWORD ===
  if (pass !== pass2) {
    errorBox.textContent = "Password tidak sama!";
    errorBox.classList.remove("hidden");
    return;
  }

  try {
    // === 1. BUAT AKUN AUTH ===
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      pass,
    );
    const user = userCredential.user;

    // === 2. TENTUKAN ROLE MENGGUNAKAN RBAC ===
    const role = isAdmin(nipeg) ? "admin" : "user";

    // === 3. SIMPAN DATA USER KE FIRESTORE ===
    await db.collection("users").doc(user.uid).set({
      nipeg: nipeg,
      email: email,
      role: role,
      createdAt: new Date(),
    });

    alert("Akun berhasil dibuat!");
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      errorBox.textContent = "Email sudah digunakan!";
    } else if (error.code === "auth/invalid-email") {
      errorBox.textContent = "Format email salah!";
    } else if (error.code === "auth/weak-password") {
      errorBox.textContent = "Password terlalu lemah!";
    } else {
      errorBox.textContent = "Gagal mendaftar: " + error.message;
    }

    errorBox.classList.remove("hidden");
  }
});
