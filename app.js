let videoStream;

// Controleer of de browser notificaties ondersteunt
function notifyUser() {
    if (!("Notification" in window)) {
        alert("Deze browser ondersteunt geen notificaties.");
        return;
    }

    // Vraag toestemming voor notificaties
    if (Notification.permission === "granted") {
        // Toon een notificatie
        new Notification("Hallo! Dit is een notificatie van je PWA.");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification("Hallo! Dit is een notificatie van je PWA.");
            }
        });
    } else {
        alert("Notificaties zijn geblokkeerd. Schakel ze in via de browserinstellingen.");
    }
}

// Start de camera en toon de videostream
function startCamera() {
    const videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', true);
    videoElement.setAttribute('playsinline', true);
    videoElement.style.width = '100%';
    videoElement.style.borderRadius = '10px';

    const container = document.querySelector('.container');
    const cameraCard = document.createElement('div');
    cameraCard.classList.add('card');
    cameraCard.appendChild(videoElement);

    // Voeg een knop toe om een foto te maken
    const captureButton = document.createElement('button');
    captureButton.textContent = 'Neem Foto';
    captureButton.style.padding = '10px 20px';
    captureButton.style.marginTop = '10px';
    captureButton.style.cursor = 'pointer';
    captureButton.onclick = () => capturePhoto(videoElement);
    cameraCard.appendChild(captureButton);

    container.prepend(cameraCard);

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

// Maak een foto en toon deze als een "post"
function capturePhoto(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Stop de camera
    if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
    }

    // Voeg de foto toe aan de strook
    const photoStrip = document.querySelector('.photo-strip');
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = 'Gemaakte foto';
    img.style.width = '10%'; // Schaal de afbeelding naar 10% van de breedte
    img.style.margin = '5px';
    photoStrip.appendChild(img);
}

// Log een bericht om te bevestigen dat het script is geladen
console.log("app.js is geladen.");