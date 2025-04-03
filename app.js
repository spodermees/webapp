let videoStream;

// Firebase-configuratie
const firebaseConfig = {
    apiKey: "AIzaSyBGwwEsBMQADESSoTvo0Tsq67-HUl9dfjs",
    authDomain: "sportbuddy-d830f.firebaseapp.com",
    databaseURL: "https://sportbuddy-d830f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sportbuddy-d830f",
    storageBucket: "sportbuddy-d830f.appspot.com",
    messagingSenderId: "392455948044",
    appId: "1:392455948044:web:bacedecd2f7db73d606b29"
};

// Initialiseer Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Camera functies
function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'flex';

    const videoElement = document.getElementById('cameraVideo');

    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    })
    .then((stream) => {
        videoStream = stream;
        videoElement.srcObject = stream;
    })
    .catch((error) => {
        console.error('Camera toegang geweigerd:', error);
        alert('Camera toegang geweigerd. Controleer je instellingen.');
    });
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.style.display = 'none';
    }

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Post functies
function confirmPost(photoData) {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';

    const previewModal = document.createElement('div');
    previewModal.id = 'previewModal';
    previewModal.style.position = 'fixed';
    previewModal.style.top = '0';
    previewModal.style.left = '0';
    previewModal.style.width = '100%';
    previewModal.style.height = '100%';
    previewModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    previewModal.style.zIndex = '1000';
    previewModal.style.display = 'flex';
    previewModal.style.justifyContent = 'center';
    previewModal.style.alignItems = 'center';

    const previewContent = document.createElement('div');
    previewContent.className = 'modal-content';

    const img = document.createElement('img');
    img.src = photoData;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '60vh';
    img.style.borderRadius = '10px';
    previewContent.appendChild(img);

    const captionInput = document.createElement('textarea');
    captionInput.placeholder = 'Wat heb je gedaan?';
    previewContent.appendChild(captionInput);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '10px';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-danger';
    cancelBtn.textContent = 'Annuleren';
    cancelBtn.onclick = () => document.body.removeChild(previewModal);
    buttonContainer.appendChild(cancelBtn);

    const postBtn = document.createElement('button');
    postBtn.className = 'btn-primary';
    postBtn.textContent = 'Posten';
    postBtn.onclick = () => {
        const caption = captionInput.value.trim() || 'Nieuwe sportprestatie!';
        createPost(photoData, caption);
        document.body.removeChild(previewModal);
    };
    buttonContainer.appendChild(postBtn);

    previewContent.appendChild(buttonContainer);
    previewModal.appendChild(previewContent);
    document.body.appendChild(previewModal);
}

function createPost(photoData, caption) {
    const container = document.querySelector('.container');
    const postCard = document.createElement('div');
    postCard.className = 'card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container';

    const img = document.createElement('img');
    img.src = photoData;
    img.alt = 'Sport moment';
    imageContainer.appendChild(img);
    postCard.appendChild(imageContainer);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-content';

    const username = document.createElement('h3');
    username.textContent = 'Jij';
    contentDiv.appendChild(username);

    const captionEl = document.createElement('p');
    captionEl.textContent = caption;
    contentDiv.appendChild(captionEl);

    const timeEl = document.createElement('div');
    timeEl.className = 'card-time';
    timeEl.textContent = 'Zojuist';
    contentDiv.appendChild(timeEl);

    postCard.appendChild(contentDiv);

    const cameraBtn = document.querySelector('.container button');
    if (cameraBtn) {
        cameraBtn.insertAdjacentElement('afterend', postCard);
    } else {
        container.prepend(postCard);
    }

    savePost(photoData, caption);
}

function savePost(photoData, caption) {
    const postId = database.ref().child('posts').push().key;
    const post = {
        photo: photoData,
        caption: caption,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || 'anonymous'
    };

    database.ref('posts/' + postId).set(post)
    .then(() => console.log('Post opgeslagen in Firebase.'))
    .catch(error => console.error('Fout bij opslaan van post:', error));
}

function loadPosts() {
    database.ref('posts').once('value')
    .then(snapshot => {
        const posts = snapshot.val();
        if (posts) {
            const container = document.querySelector('.container');
            Object.entries(posts).forEach(([id, post]) => {
                if (document.getElementById(`post-${id}`)) return;

                const postCard = document.createElement('div');
                postCard.className = 'card';
                postCard.id = `post-${id}`;

                const imageContainer = document.createElement('div');
                imageContainer.className = 'card-image-container';

                const img = document.createElement('img');
                img.src = post.photo;
                img.alt = 'Sport moment';
                imageContainer.appendChild(img);
                postCard.appendChild(imageContainer);

                const contentDiv = document.createElement('div');
                contentDiv.className = 'card-content';

                const username = document.createElement('h3');
                username.textContent = post.userId === auth.currentUser?.uid ? 'Jij' : 'Andere gebruiker';
                contentDiv.appendChild(username);

                const captionEl = document.createElement('p');
                captionEl.textContent = post.caption;
                contentDiv.appendChild(captionEl);

                const timeEl = document.createElement('div');
                timeEl.className = 'card-time';
                timeEl.textContent = formatTime(post.timestamp);
                contentDiv.appendChild(timeEl);

                postCard.appendChild(contentDiv);
                container.appendChild(postCard);
            });
        }
    })
    .catch(error => console.error('Fout bij laden van posts:', error));
}

// Hulp functies
function formatTime(timestamp) {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = now - postDate;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Zojuist';
    if (minutes < 60) return `${minutes} minuten geleden`;
    if (hours < 24) return `${hours} uur geleden`;
    if (days === 1) return 'Gisteren';
    return `${days} dagen geleden`;
}

function registerUser(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        alert('Registratie succesvol!');
        // Optioneel: gebruikersgegevens opslaan in database
        const user = userCredential.user;
        database.ref('users/' + user.uid).set({
            email: user.email,
            createdAt: new Date().toISOString()
        });
    })
    .catch((error) => {
        console.error('Fout bij registratie:', error);
        alert('Registratie mislukt: ' + error.message);
    });
}

function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        console.log("Ingelogde gebruiker:", userCredential.user);
    })
    .catch((error) => {
        console.error('Login error:', error);
        let errorMessage = 'Inloggen mislukt.';
        switch(error.code) {
            case 'auth/wrong-password':
                errorMessage = 'Ongeldig wachtwoord.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Gebruiker niet gevonden.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Netwerkfout. Controleer je internetverbinding.';
                break;
        }
        alert(errorMessage);
    });
}

// Initialisatie
document.addEventListener('DOMContentLoaded', () => {
    // Controleer auth state
    auth.onAuthStateChanged((user) => {
        const loginPopup = document.getElementById('loginPopup');
        if (user) {
            // Gebruiker is ingelogd
            loginPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
            loadPosts();
        } else {
            // Gebruiker is niet ingelogd
            loginPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    // Event listeners
    document.getElementById('captureButton').addEventListener('click', () => {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        confirmPost(photoData);
        closeCameraModal();
    });

    document.getElementById('loginButton').addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            alert('Vul je email en wachtwoord in.');
            return;
        }

        loginUser(email, password);
    });

    document.getElementById('registerButton')?.addEventListener('click', () => {
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        if (!email || !password) {
            alert('Vul je email en wachtwoord in.');
            return;
        }

        registerUser(email, password);
    });
});

// Globale functies
window.openCameraModal = openCameraModal;
window.closeCameraModal = closeCameraModal;