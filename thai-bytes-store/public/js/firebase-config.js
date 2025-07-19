// Replace with your Firebase config
const firebaseConfig = {
  
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
