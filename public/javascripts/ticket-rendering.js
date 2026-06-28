/*
Description: Script to render the ticket view, calls fetchMovieID, showStatus
             from movie-rendering.js (some dependency in exchange for less duplicate code)
 */

function getMovieID() {
    // Splits the path of the movie id and filters all false values in the array ("", 0, null, undefined, NaN, false)
    const id = window.location.pathname.split("/").filter(Boolean);
    return id[id.length - 1];
}

const movieId = getMovieID();

if  (!movieId) {
    showStatus("No movie specified.", true);
} else {
    fetchMovieID(movieId);
}