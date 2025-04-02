let videoStream;

function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'flex';

    const videoElement = document.getElementById('cameraVideo');

    // Vraag toegang tot de camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            videoStream = stream;
            videoElement.srcObject = stream;
        })
        .catch((error) => {
            console.error('Camera toegang geweigerd of niet beschikbaar:', error);
            alert('Kan geen toegang krijgen tot de camera. Controleer je instellingen.');
        });
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';

    // Stop de camera
    if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
    }
}

function confirmPost(photoData) {
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';

    // Maak een preview modal
    const previewModal = document.createElement('div');
    previewModal.style.position = 'fixed';
    previewModal.style.top = '0';
    previewModal.style.left = '0';
    previewModal.style.width = '100%';
    previewModal.style.height = '100%';
    previewModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    previewModal.style.zIndex = '1000';
    previewModal.style.display = 'flex';
    previewModal.style.justifyContent = 'center';
    previewModal.style.alignItems = 'center';

    const previewContent = document.createElement('div');
    previewContent.style.background = '#fff';
    previewContent.style.padding = '20px';
    previewContent.style.borderRadius = '10px';
    previewContent.style.textAlign = 'center';
    previewContent.style.width = '90%';
    previewContent.style.maxWidth = '400px';

    // Voeg de foto toe
    const img = document.createElement('img');
    img.src = photoData;
    img.alt = 'Preview van de foto';
    img.style.width = '100%';
    img.style.borderRadius = '10px';
    previewContent.appendChild(img);

    // Voeg caption input toe
    const captionInput = document.createElement('textarea');
    captionInput.placeholder = 'Voeg een beschrijving toe...';
    captionInput.style.width = '100%';
    captionInput.style.marginTop = '10px';
    captionInput.style.padding = '10px';
    captionInput.style.borderRadius = '5px';
    captionInput.style.border = '1px solid #ccc';
    previewContent.appendChild(captionInput);

    // Voeg post button toe
    const postButton = document.createElement('button');
    postButton.textContent = 'Posten';
    postButton.style.padding = '10px 20px';
    postButton.style.marginTop = '10px';
    postButton.style.cursor = 'pointer';
    postButton.style.backgroundColor = '#28a745';
    postButton.style.color = '#fff';
    postButton.style.border = 'none';
    postButton.style.borderRadius = '5px';
    postButton.onclick = () => {
        const caption = captionInput.value || 'Geen beschrijving';
        createPost(photoData, caption);
        document.body.removeChild(previewModal);
    };
    previewContent.appendChild(postButton);

    // Voeg cancel button toe
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuleren';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.marginLeft = '10px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.backgroundColor = 'red';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.onclick = () => {
        document.body.removeChild(previewModal);
    };
    previewContent.appendChild(cancelButton);

    previewModal.appendChild(previewContent);
    document.body.appendChild(previewModal);
}

function createPost(photoData, caption) {
    const container = document.querySelector('.container');
    const postCard = document.createElement('div');
    postCard.classList.add('card');

    // Voeg de foto toe
    const img = document.createElement('img');
    img.src = photoData;
    img.alt = 'Gemaakte foto';
    img.style.width = '100%';
    img.style.borderRadius = '10px';
    postCard.appendChild(img);

    // Voeg de gebruikersnaam toe
    const username = document.createElement('h3');
    username.textContent = 'Jouw Profiel';
    postCard.appendChild(username);

    // Voeg de caption toe
    const captionElement = document.createElement('p');
    captionElement.textContent = caption;
    postCard.appendChild(captionElement);

    // Voeg de post toe na de startknop maar boven andere posts
    const startButton = document.querySelector('.container button');
    if (startButton) {
        startButton.insertAdjacentElement('afterend', postCard);
    } else {
        container.prepend(postCard);
    }

    // Sla de post op
    savePost(photoData, caption);
}

function savePost(photoData, caption) {
    const savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    savedPosts.unshift({ photo: photoData, caption: caption }); // Voeg toe aan begin van array
    localStorage.setItem('posts', JSON.stringify(savedPosts));
}

function loadSavedPosts() {
    const savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    const container = document.querySelector('.container');

    savedPosts.forEach((post) => {
        const postCard = document.createElement('div');
        postCard.classList.add('card');

        // Voeg de foto toe
        const img = document.createElement('img');
        img.src = post.photo;
        img.alt = 'Opgeslagen foto';
        img.style.width = '100%';
        img.style.borderRadius = '10px';
        postCard.appendChild(img);

        // Voeg de gebruikersnaam toe
        const username = document.createElement('h3');
        username.textContent = 'Jouw Profiel';
        postCard.appendChild(username);

        // Voeg de caption toe
        const captionElement = document.createElement('p');
        captionElement.textContent = post.caption;
        postCard.appendChild(captionElement);

        // Voeg de post toe na de startknop maar boven andere posts
        const startButton = document.querySelector('.container button');
        if (startButton) {
            startButton.insertAdjacentElement('afterend', postCard);
        } else {
            container.prepend(postCard);
        }
    });
}

function clearPhotos() {
    if (confirm("Weet je zeker dat je alle posts wilt verwijderen?")) {
        // Verwijder alle posts uit de container
        const container = document.querySelector('.container');
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            // Behoud alleen de eerste drie voorbeeld-cards en de camera button
            if (!card.querySelector('h3') || 
                !['David Martinez', 'Jessica Moore', 'Matt Johnson'].includes(card.querySelector('h3').textContent)) {
                card.remove();
            }
        });

        // Verwijder de posts uit LocalStorage
        localStorage.removeItem('posts');

        alert('Alle posts zijn verwijderd.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedPosts();
    
    document.getElementById('captureButton').addEventListener('click', () => {
        const videoElement = document.getElementById('cameraVideo');
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const photoData = canvas.toDataURL('image/png');
        confirmPost(photoData);
        closeCameraModal();
    });
});

console.log("app.js is geladen.");