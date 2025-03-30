self.addEventListener("install", (event) => {
    console.log("Service Worker geïnstalleerd!");
  });
  
  self.addEventListener("fetch", (event) => {
    console.log("Fetching:", event.request.url);
  });
  