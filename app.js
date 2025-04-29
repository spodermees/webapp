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

    document.getElementById('searchBar').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = ''; // Wis eerdere resultaten

        if (query.length > 0) {
            database.ref('users').once('value')
                .then(snapshot => {
                    const users = snapshot.val();
                    if (users) {
                        Object.entries(users).forEach(([userId, userData]) => {
                            if (userData.username && userData.username.toLowerCase().includes(query)) {
                                // Maak een resultaatkaart
                                const resultCard = document.createElement('div');
                                resultCard.style.display = 'flex';
                                resultCard.style.alignItems = 'center';
                                resultCard.style.padding = '10px';
                                resultCard.style.border = '1px solid #ddd';
                                resultCard.style.borderRadius = '5px';
                                resultCard.style.background = '#fff';
                                resultCard.style.justifyContent = 'space-between';

                                // Profielfoto
                                const profileImg = document.createElement('img');
                                profileImg.src = userData.photoURL || 'https://via.placeholder.com/50';
                                profileImg.alt = 'Profielfoto';
                                profileImg.style.width = '40px';
                                profileImg.style.height = '40px';
                                profileImg.style.borderRadius = '50%';
                                profileImg.style.marginRight = '10px';

                                // Gebruikersnaam
                                const usernameEl = document.createElement('span');
                                usernameEl.textContent = userData.username;
                                usernameEl.style.fontWeight = 'bold';

                                // "+"-knop
                                const addButton = document.createElement('button');
                                addButton.textContent = '+';
                                addButton.style.padding = '5px 10px';
                                addButton.style.border = 'none';
                                addButton.style.borderRadius = '5px';
                                addButton.style.backgroundColor = '#4CAF50';
                                addButton.style.color = '#fff';
                                addButton.style.cursor = 'pointer';

                                // Voeg klikfunctionaliteit toe aan de "+"-knop
                                addButton.addEventListener('click', () => {
                                    addFriend(userId, userData.username);
                                });

                                resultCard.appendChild(profileImg);
                                resultCard.appendChild(usernameEl);
                                resultCard.appendChild(addButton);

                                resultsContainer.appendChild(resultCard);
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Fout bij zoeken naar gebruikers:', error);
                });
        }
    });
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
    database.ref('posts').once('value')
        .then(snapshot => {
            const posts = snapshot.val();
            if (posts) {
                const postsArray = Object.entries(posts)
                    .map(([id, post]) => ({ id, ...post }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

                    // Haal gebruikersinformatie op
                    database.ref('users/' + post.userId).once('value')
                        .then(userSnapshot => {
                            const userData = userSnapshot.val();
                            const username = userData?.username || 'Onbekend';
                            const photoURL = userData?.photoURL || 'https://via.placeholder.com/50';

                            // Profielfoto
                            const profileImg = document.createElement('img');
                            profileImg.src = photoURL;
                            profileImg.alt = 'Profielfoto';
                            profileImg.style.width = '40px';
                            profileImg.style.height = '40px';
                            profileImg.style.borderRadius = '50%';
                            profileImg.style.marginRight = '10px';

                            // Gebruikersnaam
                            const usernameEl = document.createElement('h3');
                            usernameEl.textContent = username;
                            usernameEl.style.display = 'inline-block';
                            usernameEl.style.verticalAlign = 'middle';

                            const userContainer = document.createElement('div');
                            userContainer.style.display = 'flex';
                            userContainer.style.alignItems = 'center';
                            userContainer.appendChild(profileImg);
                            userContainer.appendChild(usernameEl);

                            contentDiv.appendChild(userContainer);

                            // Caption
                            const captionEl = document.createElement('p');
                            captionEl.textContent = post.caption;
                            contentDiv.appendChild(captionEl);

                            // Timestamp
                            const timeEl = document.createElement('div');
                            timeEl.className = 'card-time';
                            timeEl.textContent = formatTime(post.timestamp);
                            contentDiv.appendChild(timeEl);

                            postCard.appendChild(contentDiv);

                            // Voeg de post toe aan de container
                            const container = document.querySelector('.container');
                            container.appendChild(postCard);
                        })
                        .catch(error => {
                            console.error('Fout bij ophalen van gebruikersinformatie:', error);
                        });
                });
            }
        })
        .catch(error => {
            console.error('Fout bij laden van posts:', error);
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

function showHome() {
    hideAllPages();
    document.getElementById('appContent').style.display = 'block'; // Toon de posts-sectie
}

function showProfile() {
    hideAllPages();
    document.getElementById('profilePage').style.display = 'block';

    const userId = auth.currentUser?.uid;
    if (userId) {
        database.ref('users/' + userId).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                document.getElementById('profileUsername').value = userData.username || '';
                document.getElementById('profileEmail').value = userData.email || '';

                if (userData.photoURL) {
                    const preview = document.getElementById('profilePhotoPreview');
                    preview.src = userData.photoURL; // Stel de Base64-afbeelding in als bron
                    preview.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Fout bij ophalen van gebruikersgegevens:', error);
                alert('Kan gebruikersgegevens niet ophalen.');
            });
    }
}

function showSettings() {
    hideAllPages();
    document.getElementById('settingsPage').style.display = 'block';
}

function hideAllPages() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    document.getElementById('appContent').style.display = 'none'; // Verberg de posts-sectie
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('profileUsername').value.trim();
    const userId = auth.currentUser?.uid;
    const file = document.getElementById('profilePhoto').files[0];

    if (!username) {
        alert('Gebruikersnaam mag niet leeg zijn.');
        return;
    }

    let photoData = null;

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            photoData = event.target.result; // Base64-encoded afbeelding
        };
        reader.readAsDataURL(file);
        await new Promise((resolve) => (reader.onloadend = resolve)); // Wacht tot de afbeelding is geladen
    }

    // Update gebruikersgegevens in Firebase
    const updates = { username };
    if (photoData) {
        updates.photoURL = photoData; // Sla de Base64-afbeelding op in de database
    }

    database.ref('users/' + userId).update(updates)
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

document.getElementById('profilePhoto').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('profilePhotoPreview');
            preview.src = event.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

function showFriends() {
    hideAllPages();
    document.getElementById('friendsPage').style.display = 'block';
    loadFriendRequests(); // Laad de vriendschapsverzoeken
    loadFriends(); // Laad de vriendenlijst
}

// Maak de functie globaal beschikbaar
window.showFriends = showFriends;

function addFriend(friendId, friendUsername) {
    const userId = auth.currentUser?.uid;

    if (!userId) {
        alert('Je moet ingelogd zijn om vrienden toe te voegen.');
        return;
    }

    // Haal de gebruikersnaam van de huidige gebruiker op
    database.ref(`users/${userId}`).once('value')
        .then(snapshot => {
            const currentUserData = snapshot.val();
            const currentUsername = currentUserData?.username || 'Onbekend';

            // Sla het vriendschapsverzoek op in de database
            return database.ref(`friendRequests/${friendId}/${userId}`).set({
                username: currentUsername,
                timestamp: new Date().toISOString()
            });
        })
        .then(() => {
            alert(`Vriendschapsverzoek verzonden naar ${friendUsername}!`);
        })
        .catch(error => {
            console.error('Fout bij toevoegen van vriend:', error);
            alert('Er is een fout opgetreden bij het verzenden van het vriendschapsverzoek.');
        });
}

function loadFriendRequests() {
    const userId = auth.currentUser?.uid;

    if (!userId) {
        console.error('Gebruiker is niet ingelogd.');
        return;
    }

    const requestsContainer = document.getElementById('friendRequests');
    requestsContainer.innerHTML = ''; // Wis eerdere verzoeken

    database.ref(`friendRequests/${userId}`).once('value')
        .then(snapshot => {
            const requests = snapshot.val();
            console.log('Vriendschapsverzoeken:', requests);

            if (requests) {
                Object.entries(requests).forEach(([requesterId, requestData]) => {
                    // Maak een kaart voor elk verzoek
                    const requestCard = document.createElement('div');
                    requestCard.style.display = 'flex';
                    requestCard.style.alignItems = 'center';
                    requestCard.style.padding = '10px';
                    requestCard.style.border = '1px solid #ddd';
                    requestCard.style.borderRadius = '5px';
                    requestCard.style.background = '#fff';
                    requestCard.style.justifyContent = 'space-between';

                    // Gebruikersnaam
                    const usernameEl = document.createElement('span');
                    usernameEl.textContent = requestData.username;
                    usernameEl.style.fontWeight = 'bold';

                    // Accept-knop
                    const acceptButton = document.createElement('button');
                    acceptButton.textContent = '✔';
                    acceptButton.style.padding = '5px 10px';
                    acceptButton.style.border = 'none';
                    acceptButton.style.borderRadius = '5px';
                    acceptButton.style.backgroundColor = '#4CAF50';
                    acceptButton.style.color = '#fff';
                    acceptButton.style.cursor = 'pointer';
                    acceptButton.addEventListener('click', () => {
                        acceptFriendRequest(userId, requesterId, requestData.username);
                    });

                    // Decline-knop
                    const declineButton = document.createElement('button');
                    declineButton.textContent = '✖';
                    declineButton.style.padding = '5px 10px';
                    declineButton.style.border = 'none';
                    declineButton.style.borderRadius = '5px';
                    declineButton.style.backgroundColor = '#f44336';
                    declineButton.style.color = '#fff';
                    declineButton.style.cursor = 'pointer';
                    declineButton.addEventListener('click', () => {
                        declineFriendRequest(userId, requesterId);
                    });

                    requestCard.appendChild(usernameEl);
                    requestCard.appendChild(acceptButton);
                    requestCard.appendChild(declineButton);

                    requestsContainer.appendChild(requestCard);
                });
            } else {
                const noRequests = document.createElement('p');
                noRequests.textContent = 'Geen vriendschapsverzoeken.';
                requestsContainer.appendChild(noRequests);
            }
        })
        .catch(error => {
            console.error('Fout bij ophalen van vriendschapsverzoeken:', error);
        });
}

function acceptFriendRequest(userId, requesterId, requesterUsername) {
    // Haal de gebruikersnaam van de huidige gebruiker op
    database.ref(`users/${userId}`).once('value')
        .then(snapshot => {
            const currentUserData = snapshot.val();
            const currentUsername = currentUserData?.username || 'Onbekend';

            // Voeg de vriend toe aan de vriendenlijst van de huidige gebruiker
            return Promise.all([
                database.ref(`friends/${userId}/${requesterId}`).set({
                    username: requesterUsername,
                    timestamp: new Date().toISOString()
                }),
                // Voeg de huidige gebruiker toe aan de vriendenlijst van de requester
                database.ref(`friends/${requesterId}/${userId}`).set({
                    username: currentUsername,
                    timestamp: new Date().toISOString()
                }),
                // Verwijder het verzoek
                database.ref(`friendRequests/${userId}/${requesterId}`).remove()
            ]);
        })
        .then(() => {
            alert('Vriendschapsverzoek geaccepteerd!');
            loadFriendRequests(); // Vernieuw de lijst met verzoeken
            loadFriends(); // Vernieuw de vriendenlijst
        })
        .catch(error => {
            console.error('Fout bij accepteren van vriendschapsverzoek:', error);
            alert('Er is een fout opgetreden bij het accepteren van het vriendschapsverzoek.');
        });
}

function loadFriends() {
    const userId = auth.currentUser?.uid;

    if (!userId) {
        console.error('Gebruiker is niet ingelogd.');
        return;
    }

    const friendsContainer = document.getElementById('friendsList');
    friendsContainer.innerHTML = ''; // Wis eerdere vrienden

    database.ref(`friends/${userId}`).once('value')
        .then(snapshot => {
            const friends = snapshot.val();
            console.log('Vrienden:', friends);

            if (friends) {
                Object.entries(friends).forEach(([friendId, friendData]) => {
                    // Maak een kaart voor elke vriend
                    const friendCard = document.createElement('div');
                    friendCard.style.display = 'flex';
                    friendCard.style.alignItems = 'center';
                    friendCard.style.padding = '10px';
                    friendCard.style.border = '1px solid #ddd';
                    friendCard.style.borderRadius = '5px';
                    friendCard.style.background = '#fff';
                    friendCard.style.justifyContent = 'space-between';

                    // Gebruikersnaam
                    const usernameEl = document.createElement('span');
                    usernameEl.textContent = friendData.username;
                    usernameEl.style.fontWeight = 'bold';

                    // Profielfoto (optioneel, als je deze opslaat)
                    const profileImg = document.createElement('img');
                    profileImg.src = friendData.photoURL || 'https://via.placeholder.com/50';
                    profileImg.alt = 'Profielfoto';
                    profileImg.style.width = '40px';
                    profileImg.style.height = '40px';
                    profileImg.style.borderRadius = '50%';
                    profileImg.style.marginRight = '10px';

                    friendCard.appendChild(profileImg);
                    friendCard.appendChild(usernameEl);

                    friendsContainer.appendChild(friendCard);
                });
            } else {
                const noFriends = document.createElement('p');
                noFriends.textContent = 'Je hebt nog geen vrienden.';
                friendsContainer.appendChild(noFriends);
            }
        })
        .catch(error => {
            console.error('Fout bij ophalen van vriendenlijst:', error);
        });
}