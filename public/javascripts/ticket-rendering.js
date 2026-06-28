function getMovieID() {
    // Splits the path of the movie id and filters all false values in the array ("", 0, null, undefined, NaN, false)
    const id = window.location.pathname.split("/").filter(Boolean);
    return id[id.length - 1];
}

function showStatus(message, error) {
    statusMsg.innerText = message;
    // If it is an error, the message will be red
    statusMsg.classList.toggle("error", Boolean(error));
}

const movieId = getMovieID();

if  (!movieId) {
    showStatus("No movie specified.", true);
} else {
    fetchMovieID(movieId);
}