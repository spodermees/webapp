// Firebase configuration
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

// Global variables
let videoStream;

// DOM elements
const loginPopup = document.getElementById('loginPopup');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('email'); // Correct ID
const loginPassword = document.getElementById('password'); // Correct ID
const appContent = document.getElementById('appContent');
const navbar = document.querySelector('.navbar');
const container = document.querySelector('.container');

// Initialize the app
function initApp() {
    // Set up auth state observer
    auth.onAuthStateChanged(handleAuthState);
    
    // Set up event listeners
    setupEventListeners();
}

function handleAuthState(user) {
    if (user) {
        // User is signed in
        console.log("User is logged in:", user.email);
        loginPopup.style.display = 'none';
        appContent.style.display = 'block';
        navbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
        
        // Load posts
        loadPosts();
    } else {
        // User is signed out
        console.log("User is logged out");
        loginPopup.style.display = 'flex';
        appContent.style.display = 'none';
        navbar.style.display = 'none';
        document.body.style.overflow = 'hidden';
    }
}

function setupEventListeners() {
    // Login form
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

    // Registratieformulier
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        if (!username || !email || !password) {
            alert("Vul alle velden in.");
            return;
        }

        registerUser(username, email, password);
    });

    // Camera button
    document.querySelector('.container button').addEventListener('click', openCameraModal);
    
    // Capture button
    document.getElementById('captureButton').addEventListener('click', capturePhoto);
    
    // Preview modal buttons
    document.getElementById('confirmPost').addEventListener('click', () => {
        const caption = document.getElementById('postCaption').value.trim() || 'Nieuwe sportprestatie!';
        const photoData = document.getElementById('previewImage').src;
        createPost(photoData, caption);
        closePreviewModal();
    });
    
    document.querySelector('#previewModal .btn-danger').addEventListener('click', closePreviewModal);
}

function loginUser(email, password) {
    const loginButton = loginForm.querySelector('button[type="submit"]'); // Dynamisch de knop selecteren
    const originalText = loginButton.textContent;

    loginButton.disabled = true;
    loginButton.textContent = 'Inloggen...';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login successful - handled by auth state observer
        })
        .catch((error) => {
            console.error('Login error:', error);
            loginButton.disabled = false;
            loginButton.textContent = originalText;

            let errorMessage = 'Inloggen mislukt.';
            switch (error.code) {
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

function registerUser(username, email, password) {
    const registerButton = document.getElementById('registerButton');
    const originalText = registerButton.textContent;

    registerButton.disabled = true;
    registerButton.textContent = 'Registreren...';

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Sla extra gebruikersinformatie op in de database
            return database.ref('users/' + user.uid).set({
                username: username,
                email: email,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            alert('Account succesvol aangemaakt!');
            document.getElementById('registerPopup').style.display = 'none';
            document.getElementById('loginPopup').style.display = 'flex';
        })
        .catch((error) => {
            console.error('Registratiefout:', error);
            alert('Registratie mislukt: ' + error.message);
        })
        .finally(() => {
            registerButton.disabled = false;
            registerButton.textContent = originalText;
        });
}

// Camera functions
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

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    showPreview(photoData);
}

function showPreview(photoData) {
    closeCameraModal();
    
    const previewModal = document.getElementById('previewModal');
    const previewImage = document.getElementById('previewImage');
    const postCaption = document.getElementById('postCaption');
    
    previewImage.src = photoData;
    postCaption.value = '';
    previewModal.style.display = 'flex';
}

function closePreviewModal() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
    }
}

// Post functions
function createPost(photoData, caption) {
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

    // Haal de gebruikersnaam van de huidige gebruiker op
    database.ref('users/' + auth.currentUser?.uid).once('value')
        .then(userSnapshot => {
            const username = userSnapshot.val()?.username || 'Jij';
            const usernameEl = document.createElement('h3');
            usernameEl.textContent = username;
            contentDiv.appendChild(usernameEl);

            const captionEl = document.createElement('p');
            captionEl.textContent = caption;
            contentDiv.appendChild(captionEl);

            const timeEl = document.createElement('div');
            timeEl.className = 'card-time';
            timeEl.textContent = 'Zojuist';
            contentDiv.appendChild(timeEl);

            postCard.appendChild(contentDiv);

            // Voeg de nieuwe post bovenaan de container toe
            container.prepend(postCard);

            // Sla de post op in Firebase
            savePost(photoData, caption);
        })
        .catch(error => {
            console.error('Fout bij ophalen van gebruikersnaam:', error);
        });
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
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Posts laden...';
    loadingIndicator.style.textAlign = 'center';
    container.appendChild(loadingIndicator);

    database.ref('posts').once('value')
        .then(snapshot => {
            loadingIndicator.remove(); // Verwijder de laadindicator
            const posts = snapshot.val();
            if (posts) {
                // Clear existing posts (keep only the example post)
                const cards = document.querySelectorAll('.card');
                cards.forEach(card => {
                    const username = card.querySelector('h3');
                    if (!username || username.textContent !== 'David Martinez') {
                        card.remove();
                    }
                });

                // Convert posts object to array and sort by timestamp (newest first)
                const postsArray = Object.entries(posts)
                    .map(([id, post]) => ({ id, ...post }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                // Add posts from Firebase
                postsArray.forEach(post => {
                    if (document.getElementById(`post-${post.id}`)) return;

                    const postCard = document.createElement('div');
                    postCard.className = 'card';
                    postCard.id = `post-${post.id}`;

                    // Image container
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'card-image-container';
                    const img = document.createElement('img');
                    img.src = post.photo;
                    img.alt = 'Sport moment';
                    imageContainer.appendChild(img);
                    postCard.appendChild(imageContainer);

                    // Content container
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'card-content';

                    // Fetch username from Firebase
                    database.ref('users/' + post.userId).once('value')
                        .then(userSnapshot => {
                            const username = userSnapshot.val()?.username || 'Onbekend';
                            const usernameEl = document.createElement('h3');
                            usernameEl.textContent = post.userId === auth.currentUser?.uid ? 'Jij' : username;
                            contentDiv.appendChild(usernameEl);

                            const captionEl = document.createElement('p');
                            captionEl.textContent = post.caption;
                            contentDiv.appendChild(captionEl);

                            const timeEl = document.createElement('div');
                            timeEl.className = 'card-time';
                            timeEl.textContent = formatTime(post.timestamp);
                            contentDiv.appendChild(timeEl);

                            postCard.appendChild(contentDiv);

                            // Insert after the camera button (before any other posts)
                            const cameraBtn = document.querySelector('.container button');
                            if (cameraBtn && cameraBtn.nextElementSibling) {
                                cameraBtn.nextElementSibling.before(postCard);
                            } else {
                                container.appendChild(postCard);
                            }
                        });
                });
            }
        })
        .catch(error => {
            loadingIndicator.remove(); // Verwijder de laadindicator bij een fout
            console.error('Fout bij laden van posts:', error);
            alert('Fout bij het laden van posts. Probeer de pagina te verversen.');
        });
}

// Helper function
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global functions
window.openCameraModal = openCameraModal;
window.closeCameraModal = closeCameraModal;

function showProfile() {
    const profilePage = document.getElementById('profilePage');
    const appContent = document.getElementById('appContent');

    // Verberg de hoofdinhoud en toon de profielpagina
    appContent.style.display = 'none';
    profilePage.style.display = 'block';

    // Haal gebruikersgegevens op uit Firebase
    const userId = auth.currentUser?.uid;
    if (userId) {
        database.ref('users/' + userId).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                document.getElementById('profileUsername').value = userData.username || '';
                document.getElementById('profileEmail').value = userData.email || '';
            })
            .catch(error => {
                console.error('Fout bij ophalen van gebruikersgegevens:', error);
                alert('Kan gebruikersgegevens niet ophalen.');
            });
    }
}

document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('profileUsername').value.trim();
    const userId = auth.currentUser?.uid;

    if (!username) {
        alert('Gebruikersnaam mag niet leeg zijn.');
        return;
    }

    // Update gebruikersnaam in Firebase
    database.ref('users/' + userId).update({ username })
        .then(() => {
            alert('Profiel succesvol bijgewerkt!');
        })
        .catch(error => {
            console.error('Fout bij bijwerken van profiel:', error);
            alert('Kan profiel niet bijwerken.');
        });
});

function logout() {
    auth.signOut()
        .then(() => {
            alert('Je bent uitgelogd.');
            location.reload(); // Herlaad de pagina om terug te keren naar de login
        })
        .catch(error => {
            console.error('Fout bij uitloggen:', error);
        });
}