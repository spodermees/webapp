// Check if Firebase is available
if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded. Check script loading order.');
} else {
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
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();

    // Declare variables
    let videoStream;

    // DOM elements
    const loginPopup = document.getElementById('loginPopup');
    const loginForm = loginPopup.querySelector('form');
    const loginEmail = document.getElementById('loginEmailPopup');
    const loginPassword = document.getElementById('loginPasswordPopup');
    const appContent = document.querySelector('.container');
    const navbar = document.querySelector('.navbar');

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
            console.error('Camera access denied:', error);
            alert('Camera access denied. Check your settings.');
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

    // Post functions
    function confirmPost(photoData) {
        closeCameraModal();
        
        const previewModal = document.getElementById('previewModal');
        const previewImage = document.getElementById('previewImage');
        const postCaption = document.getElementById('postCaption');
        const confirmPostBtn = document.getElementById('confirmPost');
        
        previewImage.src = photoData;
        postCaption.value = '';
        
        // Remove old event listeners
        const newConfirmPostBtn = confirmPostBtn.cloneNode(true);
        confirmPostBtn.parentNode.replaceChild(newConfirmPostBtn, confirmPostBtn);
        
        newConfirmPostBtn.onclick = () => {
            const caption = postCaption.value.trim() || 'New sports achievement!';
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
        img.alt = 'Sports moment';
        imageContainer.appendChild(img);
        postCard.appendChild(imageContainer);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const username = document.createElement('h3');
        username.textContent = 'You';
        contentDiv.appendChild(username);

        const captionEl = document.createElement('p');
        captionEl.textContent = caption;
        contentDiv.appendChild(captionEl);

        const timeEl = document.createElement('div');
        timeEl.className = 'card-time';
        timeEl.textContent = 'Just now';
        contentDiv.appendChild(timeEl);

        // Add after camera button
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
        .then(() => console.log('Post saved to Firebase.'))
        .catch(error => console.error('Error saving post:', error));
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
                    img.alt = 'Sports moment';
                    imageContainer.appendChild(img);
                    postCard.appendChild(imageContainer);

                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'card-content';

                    const username = document.createElement('h3');
                    username.textContent = post.userId === auth.currentUser?.uid ? 'You' : 'Other user';
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
        .catch(error => console.error('Error loading posts:', error));
    }

    // Helper functions
    function formatTime(timestamp) {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diff = now - postDate;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    // Authentication functions
    function loginUser(email, password) {
        const loginButton = loginForm.querySelector('button');
        const originalText = loginButton.textContent;
        
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';

        auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Logged in as:", userCredential.user.email);
        })
        .catch((error) => {
            console.error('Login error:', error);
            loginButton.disabled = false;
            loginButton.textContent = originalText;
            
            let errorMessage = 'Login failed.';
            switch(error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Invalid password';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'User not found';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Check your connection.';
                    break;
            }
            alert(errorMessage);
        });
    }

    function handleAuthState(user) {
        if (user) {
            console.log('User is logged in:', user.email);
            loginPopup.style.display = 'none';
            appContent.style.display = 'block';
            navbar.style.display = 'flex';
            document.body.style.overflow = 'auto';
            loadPosts();
        } else {
            console.log('User is logged out');
            loginPopup.style.display = 'flex';
            appContent.style.display = 'none';
            navbar.style.display = 'none';
            document.body.style.overflow = 'hidden';
        }
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        // Auth state observer
        auth.onAuthStateChanged(handleAuthState);

        // Login form submit
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();
            const password = loginPassword.value.trim();
            
            if (!email || !password) {
                alert('Please enter email and password');
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

    // Global functions
    window.openCameraModal = openCameraModal;
    window.closeCameraModal = closeCameraModal;
}