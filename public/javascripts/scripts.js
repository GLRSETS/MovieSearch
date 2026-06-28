const formID = document.querySelector('#lookupForm');
const formTitle = document.querySelector('#lookupFormTitle');
const statusMsg = document.querySelector('#statusMsg');
const ticket = document.querySelector('#ticket');
const movieList = document.querySelector("#movieList");

function formatMovieTime(time) {
    if (!time)
        return null;
    // Get the hours of runtime (1h40m -> 1h)
    const hours = Math.floor(time/60);
    // Get the minutes by doing mod 60
    const minutes = time%60;
    // If hours bigger than 0 return hours and minutes, else return minutes
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function showMovie(movie) {
    // Set the src attribut of poster element, if TMDB has a poster -> set it to that, if not set it to ""
    document.querySelector("#poster").src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "";
    // Set the description of said poster element
    document.querySelector("#poster").alt = movie.title || "Poster";
    // Set the title, tagline and overview text
    document.querySelector("#movieTitle").innerText = movie.title || "Not available";
    document.querySelector("#movieTagline").innerText = movie.tagline || "";
    document.querySelector("#movieOverview").innerText = movie.overview || "Not available";
    document.querySelector("#footerId").innerText = `TMDB #${movie.id}`;
    // Set the movie score, toFixed -> forces the number to have only one decimal
    document.querySelector("#scoreValue").innerText = movie.vote_average != null ? movie.vote_average.toFixed(1) : "No score";

    // Makes a percentage out of the movie score
    const ratingPercentage = Math.round((movie.vote_average || 0) * 10);
    const ring = document.querySelector("#scoreRing");
    // CSS ring that changes depending on the percentage
    ring.style.setProperty("--pct", `${ratingPercentage}%`);
    const metaRow = document.querySelector("#metaRow");
    metaRow.innerHTML = "";
    // An array with the movie's info
    const movieInfoArray = [];
    if (movie.release_date) {
        movieInfoArray.push(movie.release_date.slice(0, 4));
    }
    const runtime = formatMovieTime(movie.runtime);
    if (runtime)
        movieInfoArray.push(runtime);
    if (Array.isArray(movie.genres)) {
        movie.genres.forEach(movieGenre => movieInfoArray.push(movieGenre.name));
    }

    // Create each element in the array, using the pill CSS style
    movieInfoArray.forEach(text => {
        const span = document.createElement("span");
        span.className = "pill";
        span.innerText = text;
        metaRow.appendChild(span);
    });

    ticket.classList.add("visible");
}

function showMovieList(movieArray) {
    movieList.innerHTML = "";

    movieArray.forEach(movie => {
        const movieItem = document.createElement("div");
        movieItem.className = "result-item";
        movieItem.tabIndex = 0;

        const thumbnail = document.createElement("img");
        thumbnail.className = "result-thumb";
        thumbnail.src = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : "";
        thumbnail.alt = movie.title || "Poster";

        const movieTitle = document.createElement("div");
        movieTitle.className = "result-title";
        movieTitle.innerText = movie.title || "Not available";

        const movieYear = document.createElement("div");
        movieYear.className = "result-year";
        movieYear.innerText = movie.release_date != null ? movie.release_date.slice(0, 4) : "Not Found";

        movieItem.appendChild(thumbnail);
        movieItem.appendChild(movieTitle);
        movieItem.appendChild(movieYear);

        const renderMoviePage = () => {

        };

        movieItem.addEventListener("click", renderMoviePage);
        movieList.appendChild(movieItem);

    });

    movieList.classList.add("visible");

}

function showStatus(message, error) {
    statusMsg.innerText = message;
    // If it is an error, the message will be red
    statusMsg.classList.toggle("error", Boolean(error));
}

function fetchMovieID(movieId) {
    ticket.classList.remove("visible");
    showStatus("Searching the archive…", false);

    // HTTP GET request to our internal server
    fetch(`/movie/${movieId}`)
        // Receives raw HTTP and transforms it into JSON
        .then(response => response.json()
            // Returns a plain object bundle ; respone.ok : Success status, data : The actual movie data
            .then(data => ({ ok: response.ok, data })))
        // Destructures the bundle into separate variables
        .then(({ ok, data }) => {
            if (!ok) {
                throw new Error(data.status_message || "Movie not found.");
            }
            showStatus("", false);
            showMovie(data);
        })
        .catch(error => {
            console.error("Error:", error);
            showStatus(error.message || "Something went wrong.", true);
        });
}

function movieTitleSearch(event) {
    event.preventDefault();

    const movieTitle = document.querySelector("#movieName").value.trim();
    if (!movieTitle) {
        showStatus("Enter a movie title to look up.", true);
        return;
    }

    movieList.classList.remove("visible");
    ticket.classList.remove("visible");
    showStatus("Searching the archive…", false);

    // HTTP GET request to our internal server
    fetch(`/search?title=${encodeURIComponent(movieTitle)}`)
        // Receives raw HTTP and transforms it into JSON
        .then(response => response.json()
            // Returns a plain object bundle ; respone.ok : Success status, data : The actual movie data
            .then(data => ({ ok: response.ok, data })))
        // Destructures the bundle into separate variables
        .then(({ ok, data }) => {
            if (!ok) {
                throw new Error(data.status_message || "Movie not found.");
            }
            if (!data.results || data.results.length === 0) {
                throw new Error("No movies found with that title.");
            }

            showStatus("", false);
            showMovieList(data.results);
        })
        .catch(error => {
            console.error("Error:", error);
            showStatus(error.message || "Something went wrong.", true);
        });
}

function movieIDSearch(event) {
    event.preventDefault();

    const movieId = document.querySelector("#movieId").value;
    if (!movieId) {
        showStatus("Enter a movie ID to look up.", true);
        return;
    }

    fetchMovieID(movieId);


}
// Triggers when the button is clicked or by pressing enter
formID.addEventListener("submit", movieIDSearch);
formTitle.addEventListener("submit", movieTitleSearch);


// Since the script call is right before </body>, #lookupBtn already exists in the DOM
// If it didn't (calling script in <head> for example) ; would need to wrap it in :
// document.addEventListener("DOMContentLoaded", () => { put cmd line in here })
// document.querySelector("#lookupBtn").addEventListener("click", movieIDSearch);