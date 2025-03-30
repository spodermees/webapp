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

// Log een bericht om te bevestigen dat het script is geladen
console.log("app.js is geladen.");