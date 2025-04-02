let videoStream;

// Functies voor camera
function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'flex';

    const videoElement = document.getElementById('cameraVideo');

    navigator.mediaDevices.getUserMedia({ video: true })
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
    modal.style.display = 'none';

    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}

// Post bevestiging en creatie
function confirmPost(photoData) {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';

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
    previewContent.style.background = '#fff';
    previewContent.style.padding = '20px';
    previewContent.style.borderRadius = '10px';
    previewContent.style.width = '90%';
    previewContent.style.maxWidth = '400px';

    function confirmPost(photoData) {
        // ... bestaande code ...

        const img = document.createElement('img');
        img.src = photoData;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';

        // Mobiel vs desktop instellingen
        if (window.innerWidth >= 768) {
            img.style.maxHeight = '400px';
            img.style.objectFit = 'scale-down';
        } else {
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';
        }

        previewContent.appendChild(img);

        // ... rest van de functie ...
    }

    const captionInput = document.createElement('textarea');
    captionInput.placeholder = 'Wat heb je gedaan?';
    captionInput.style.width = '100%';
    captionInput.style.margin = '10px 0';
    captionInput.style.padding = '10px';
    captionInput.style.border = '1px solid #ddd';
    captionInput.style.borderRadius = '5px';
    captionInput.style.minHeight = '60px';
    previewContent.appendChild(captionInput);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuleren';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.background = '#ff4444';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '5px';
    cancelBtn.onclick = () => document.body.removeChild(previewModal);
    buttonContainer.appendChild(cancelBtn);

    const postBtn = document.createElement('button');
    postBtn.textContent = 'Posten';
    postBtn.style.padding = '10px 20px';
    postBtn.style.background = '#4CAF50';
    postBtn.style.color = 'white';
    postBtn.style.border = 'none';
    postBtn.style.borderRadius = '5px';
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

    const img = document.createElement('img');
    img.src = photoData;
    img.alt = 'Sport moment';
    postCard.appendChild(img);

    const username = document.createElement('h3');
    username.textContent = 'Jij';
    postCard.appendChild(username);

    const captionEl = document.createElement('p');
    captionEl.textContent = caption;
    postCard.appendChild(captionEl);

    // Voeg toe na de camera knop
    const cameraBtn = document.querySelector('.container button');
    if (cameraBtn) {
        cameraBtn.insertAdjacentElement('afterend', postCard);
    } else {
        container.prepend(postCard);
    }

    savePost(photoData, caption);
}

// Opslaan en laden van posts
function savePost(photoData, caption) {
    let posts = JSON.parse(localStorage.getItem('sportbuddy_posts')) || [];
    posts.unshift({ photo: photoData, caption: caption });
    localStorage.setItem('sportbuddy_posts', JSON.stringify(posts));
}

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('sportbuddy_posts')) || [];
    const container = document.querySelector('.container');

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'card';

        const img = document.createElement('img');
        img.src = post.photo;
        img.alt = 'Opgeslagen sport moment';
        postCard.appendChild(img);

        const username = document.createElement('h3');
        username.textContent = 'Jij';
        postCard.appendChild(username);

        const captionEl = document.createElement('p');
        captionEl.textContent = post.caption;
        postCard.appendChild(captionEl);

        const cameraBtn = document.querySelector('.container button');
        if (cameraBtn) {
            cameraBtn.insertAdjacentElement('afterend', postCard);
        } else {
            container.prepend(postCard);
        }
    });
}

// Verwijder posts
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();

    document.getElementById('captureButton').addEventListener('click', () => {
        const video = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoData = canvas.toDataURL('image/jpeg', 0.8); // Compressie kwaliteit
        confirmPost(photoData);
        closeCameraModal();
    });
});

console.log("app.js is geladen");   