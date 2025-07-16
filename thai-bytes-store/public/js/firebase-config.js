// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBw2hTfX-ABycqQy_iFsg-_m5HFhJe3KNk",
  authDomain: "thaibytes-store.firebaseapp.com",
  projectId: "thaibytes-store.firebaseapp.com",
  storageBucket: "thaibytes-store.firebasestorage.app",
  messagingSenderId: "941782779939",
  appId: "1:941782779939:web:df3ddcfa6a1964713b4996"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
<script>
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('authLinks').style.display = 'none';
    document.getElementById('profileSection').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email;
  } else {
    document.getElementById('authLinks').style.display = 'flex';
    document.getElementById('profileSection').style.display = 'none';
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}
</script>
