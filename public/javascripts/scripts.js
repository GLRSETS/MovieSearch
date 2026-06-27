function sendData(e) {
    e.preventDefault();

    const movieId = document.querySelector("#movieId").value;

    fetch(`/movie/${movieId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(protectedData => {
            console.log('Protected Data:', protectedData);
            document.querySelector(".result").innerText = `Title: ${protectedData.title}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Since the script call is right before </body>, #lookupBtn already exists in the DOM
// If it didn't (calling script in <head> for example) ; would need to wrap it in :
// document.addEventListener("DOMContentLoaded", () => { put cmd line in here })
document.querySelector("#lookupBtn").addEventListener("click", sendData);