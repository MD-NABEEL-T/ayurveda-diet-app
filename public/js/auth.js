// public/js/auth.js
// -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyCCD3TMUeU2OSpFW5NZfwCIdCzS6hfB6Gg",
  authDomain: "ayurveda-diet-app-f53c4.firebaseapp.com",
  projectId: "ayurveda-diet-app-f53c4",
  storageBucket: "ayurveda-diet-app-f53c4.firebasestorage.app",
  messagingSenderId: "507595710796",
  appId: "1:507595710796:web:910bb68a5f71ab6a98afe9",
  measurementId: "G-25TVFSNJ48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ----- UI toggle -----
const container = document.getElementById('container');
document.getElementById('register')?.addEventListener('click', () => container.classList.add("active"));
document.getElementById('login')?.addEventListener('click', () => container.classList.remove("active"));

// ----- Helper functions -----
function saveUserLocally(user) {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify({
    uid: user.uid,
    name: user.displayName || null,
    email: user.email || null,
    photoURL: user.photoURL || null
  }));
}
function redirectToDashboard() {
  window.location.href = "dashboard.html";
}
function getErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use": return "This email is already registered.";
    case "auth/invalid-email": return "Invalid email format.";
    case "auth/user-not-found": return "No account found with this email.";
    case "auth/wrong-password": return "Incorrect password.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/invalid-credential": return "Invalid email or password.";
    default: return "Something went wrong. Try again.";
  }
}

// ----- Auto redirect if already logged in -----
onAuthStateChanged(auth, (user) => {
  if (user) {
    saveUserLocally(user);
    if (!window.location.pathname.endsWith("dashboard.html")) {
      redirectToDashboard();
    }
  } else {
    localStorage.removeItem("user");
  }
});

// ----- Google Sign In -----
["googleLoginUp", "googleLoginIn"].forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      saveUserLocally(result.user);
      redirectToDashboard();
    } catch (err) {
      alert("Google login failed: " + getErrorMessage(err));
    }
  });
});

// ----- Email / Password Sign Up -----
document.getElementById("signupBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName")?.value || "";
  const email = document.getElementById("signupEmail")?.value;
  const password = document.getElementById("signupPassword")?.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    saveUserLocally(userCredential.user);
    redirectToDashboard();
  } catch (err) {
    alert("Signup failed: " + getErrorMessage(err));
  }
});

// ----- Email / Password Sign In -----
document.getElementById("signinBtn")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signinEmail")?.value;
  const password = document.getElementById("signinPassword")?.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    saveUserLocally(userCredential.user);
    redirectToDashboard();
  } catch (err) {
    alert("Signin failed: " + getErrorMessage(err));
  }
});

// ----- Logout -----
export async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
    window.location.href = "index.html";
  } catch (err) {
    alert("Logout failed: " + getErrorMessage(err));
  }
}
