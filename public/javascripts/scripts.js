/*
Description: Script to implement the movie search by title or movie ID, renders the list of movies when using title search
             Calls showStatus from movie-rendering.js (some dependency in exchange for less duplicate code)
 */

const formTitle = document.querySelector('#lookupFormTitle');
const movieList = document.querySelector("#movieList");

/*
Description : Renders the movie list that matches the title search
 */
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

        const textWrap = document.createElement("div");
        textWrap.className = "result-text";

        textWrap.appendChild(movieTitle);
        textWrap.appendChild(movieYear);
        movieItem.appendChild(textWrap);
        movieItem.appendChild(thumbnail);

        const renderMoviePage = () => {
            window.location.href = `/ticket/${movie.id}`;
        };

        movieItem.addEventListener("click", renderMoviePage);
        movieList.appendChild(movieItem);

    });

    movieList.classList.add("visible");
}

function movieTitleSearch(event) {
    event.preventDefault();

    const movieTitle = document.querySelector("#movieName").value.trim();
    if (!movieTitle) {
        showStatus("Enter a movie title to look up.", true);
        return;
    }

    movieList.classList.remove("visible");
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
    // Redirect to movie-page.html
    window.location.href = `/ticket/${movieId}`;
}
// Triggers when the button is clicked or by pressing enter
formTitle.addEventListener("submit", movieTitleSearch);


// Since the script call is right before </body>, #lookupBtn already exists in the DOM
// If it didn't (calling script in <head> for example) ; would need to wrap it in :
// document.addEventListener("DOMContentLoaded", () => { put cmd line in here })
// document.querySelector("#lookupBtn").addEventListener("click", movieIDSearch);