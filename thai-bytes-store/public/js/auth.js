// js/auth.js

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ Logged in as", user.email);
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "index.html"; // ✅ Redirect after login
  }
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Firebase handles redirection above
    })
    .catch((error) => {
      alert("❌ " + error.message);
    });
});
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => alert("Login successful!"))
        .catch(error => alert(error.message));
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => alert("Signup successful!"))
        .catch(error => alert(error.message));
    });
  }
});
