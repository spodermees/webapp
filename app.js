let videoStream;

// Firebase-configuratie
const firebaseConfig = {
    apiKey: "AIzaSyBGwwEsBMQADESSoTvo0Tsq67-HUl9dfjs",
    authDomain: "sportbuddy-d830f.firebaseapp.com",
    databaseURL: "https://sportbuddy-d830f-default-rtdb.europe-west1.firebasedatabase.app/", // Correcte URL
    projectId: "sportbuddy-d830f",
    storageBucket: "sportbuddy-d830f.appspot.com",
    messagingSenderId: "392455948044",
    appId: "1:392455948044:web:bacedecd2f7db73d606b29"
};

// Initialiseer Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Camera functies
function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'flex';

    const videoElement = document.getElementById('cameraVideo');
    
    // Stop eventuele bestaande stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }

    // Probeer eerst achterkant camera
    const constraints = {
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { exact: "environment" }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            videoStream = stream;
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
            };
        })
        .catch((error) => {
            console.log('Achterkant camera niet beschikbaar, probeer voorkant:', error);
            
            // Probeer met voorkant camera
            constraints.video.facingMode = { exact: "user" };
            return navigator.mediaDevices.getUserMedia(constraints);
        })
        .then((stream) => {
            videoStream = stream;
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
            };
        })
        .catch((error) => {
            console.error('Geen camera toegang:', error);
            alert('Kon geen camera starten. Controleer toestemmingen en probeer opnieuw.');
            closeCameraModal();
        });
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Post functies
function confirmPost(photoData) {
    closeCameraModal();

    const previewModal = document.createElement('div');
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
    img.style.objectFit = 'contain';
    img.style.borderRadius = '10px';
    previewContent.appendChild(img);

    const captionInput = document.createElement('textarea');
    captionInput.placeholder = 'Wat heb je gedaan?';
    previewContent.appendChild(captionInput);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

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

    // Afbeelding container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container';
    
    const img = document.createElement('img');
    img.src = photoData;
    img.alt = 'Sport moment';
    imageContainer.appendChild(img);
    postCard.appendChild(imageContainer);

    // Content
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

    // Voeg toe na de camera knop
    const cameraBtn = document.querySelector('.container button');
    if (cameraBtn) {
        cameraBtn.insertAdjacentElement('afterend', postCard);
    } else {
        container.prepend(postCard);
    }

    savePost(photoData, caption);
}

// Opslag functies
function savePost(photoData, caption) {
    const postId = firebase.database().ref().child('posts').push().key;
    const post = {
        photo: photoData,
        caption: caption,
        timestamp: new Date().toISOString()
    };

    firebase.database().ref('posts/' + postId).set(post)
        .then(() => {
            console.log('Post opgeslagen in Firebase.');
        })
        .catch(error => {
            console.error('Fout bij opslaan van post:', error);
        });
}

function loadPosts() {
    firebase.database().ref('posts').once('value')
        .then(snapshot => {
            const posts = snapshot.val();
            if (posts) {
                const container = document.querySelector('.container');
                Object.values(posts).forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.className = 'card';

                    // Afbeelding
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'card-image-container';

                    const img = document.createElement('img');
                    img.src = post.photo;
                    img.alt = 'Sport moment';
                    imageContainer.appendChild(img);
                    postCard.appendChild(imageContainer);

                    // Content
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'card-content';

                    const username = document.createElement('h3');
                    username.textContent = 'Jij';
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
        .catch(error => {
            console.error('Fout bij laden van posts:', error);
        });
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

function clearPhotos() {
    if (confirm('Weet je zeker dat je alle posts wilt verwijderen?')) {
        localStorage.removeItem('sportbuddy_posts');
        document.querySelectorAll('.container .card').forEach(card => {
            if (!card.querySelector('h3') || 
                !['David Martinez', 'Jessica Moore', 'Matt Johnson'].includes(card.querySelector('h3').textContent)) {
                card.remove();
            }
        });
    }
}

function registerUser(email, password) {
    const userId = email.replace('.', '_'); // Firebase ondersteunt geen punten in sleutels
    firebase.database().ref('users/' + userId).set({
        email: email,
        password: password // In productie moet je wachtwoorden hashen!
    }).then(() => {
        alert('Registratie succesvol!');
    }).catch(error => {
        console.error('Fout bij registratie:', error);
    });
}

function loginUser(email, password) {
    const userId = email.replace('.', '_');
    firebase.database().ref('users/' + userId).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.password === password) {
                    alert('Inloggen succesvol!');
                    localStorage.setItem('loggedInUser', email);
                    showApp();
                } else {
                    alert('Ongeldig wachtwoord.');
                }
            } else {
                alert('Gebruiker niet gevonden.');
            }
        })
        .catch(error => {
            console.error('Fout bij inloggen:', error);
        });
}

// Initialisatie
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    
    document.getElementById('captureButton').addEventListener('click', () => {
        const video = document.getElementById('cameraVideo');
        
        if (video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            confirmPost(photoData);
        } else {
            alert('Camera is nog niet klaar. Wacht even en probeer opnieuw.');
        }
    });
});

window.openCameraModal = openCameraModal;