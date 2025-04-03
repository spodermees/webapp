let videoStream;

// Firebase-configuratie
// const firebaseConfig = {
//     apiKey: "AIzaSyBGwwEsBMQADESSoTvo0Tsq67-HUl9dfjs",
//     authDomain: "sportbuddy-d830f.firebaseapp.com",
//     databaseURL: "https://sportbuddy-d830f-default-rtdb.europe-west1.firebasedatabase.app",
//     projectId: "sportbuddy-d830f",
//     storageBucket: "sportbuddy-d830f.appspot.com",
//     messagingSenderId: "392455948044",
//     appId: "1:392455948044:web:bacedecd2f7db73d606b29"
// };

// Initialiseer Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM elementen
const loginPopup = document.getElementById('loginPopup');
const loginForm = loginPopup.querySelector('form');
const loginEmail = document.getElementById('loginEmailPopup');
const loginPassword = document.getElementById('loginPasswordPopup');
const appContent = document.querySelector('.container');
const navbar = document.querySelector('.navbar');

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
    closeCameraModal();
    
    const previewModal = document.getElementById('previewModal');
    const previewImage = document.getElementById('previewImage');
    const postCaption = document.getElementById('postCaption');
    const confirmPostBtn = document.getElementById('confirmPost');
    
    previewImage.src = photoData;
    postCaption.value = '';
    
    // Verwijder oude event listeners
    const newConfirmPostBtn = confirmPostBtn.cloneNode(true);
    confirmPostBtn.parentNode.replaceChild(newConfirmPostBtn, confirmPostBtn);
    
    newConfirmPostBtn.onclick = () => {
        const caption = postCaption.value.trim() || 'Nieuwe sportprestatie!';
        createPost(photoData, caption);
        closePreviewModal();
    };
    
    previewModal.style.display = 'flex';
}

function closePreviewModal() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
    }
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

    // Voeg toe na de camera knop
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

// Authenticatie functies
function loginUser(email, password) {
    const loginButton = loginForm.querySelector('button');
    const originalText = loginButton.textContent;
    
    loginButton.disabled = true;
    loginButton.textContent = 'Inloggen...';

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        console.log("Ingelogd als:", userCredential.user.email);
        // Geen refresh nodig, onAuthStateChanged handelt de UI update
    })
    .catch((error) => {
        console.error('Login error:', error);
        loginButton.disabled = false;
        loginButton.textContent = originalText;
        
        let errorMessage = 'Inloggen mislukt.';
        switch(error.code) {
            case 'auth/wrong-password':
                errorMessage = 'Ongeldig wachtwoord';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Gebruiker niet gevonden';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Netwerkfout. Controleer je internetverbinding.';
                break;
        }
        alert(errorMessage);
    });
}

function handleAuthState(user) {
    if (user) {
        console.log('User is ingelogd:', user.email);
        loginPopup.style.display = 'none';
        appContent.style.display = 'block';
        navbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
        loadPosts();
    } else {
        console.log('User is niet ingelogd');
        loginPopup.style.display = 'flex';
        appContent.style.display = 'none';
        navbar.style.display = 'none';
        document.body.style.overflow = 'hidden';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuratie
    const firebaseConfig = {
        apiKey: "AIzaSyBGwwEsBMQADESSoTvo0Tsq67-HUl9dfjs",
        authDomain: "sportbuddy-d830f.firebaseapp.com",
        databaseURL: "https://sportbuddy-d830f-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "sportbuddy-d830f",
        storageBucket: "sportbuddy-d830f.appspot.com",
        messagingSenderId: "392455948044",
        appId: "1:392455948044:web:bacedecd2f7db73d606b29"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();
    
    // Rest van je code...
    // Auth state observer
    auth.onAuthStateChanged(handleAuthState);

    // Login form submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        if (!email || !password) {
            alert('Vul email en wachtwoord in');
            return;
        }
        
        loginUser(email, password);
    });

    // Camera capture
    document.getElementById('captureButton').addEventListener('click', () => {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        confirmPost(photoData);
    });

    // Preview modal cancel
    document.querySelector('#previewModal .btn-danger').addEventListener('click', closePreviewModal);
});

// Globale functies
window.openCameraModal = openCameraModal;
window.closeCameraModal = closeCameraModal;