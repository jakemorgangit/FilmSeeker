let movieArray = [];
let selectedMovies = [];
let recommendations = [];
const apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxx";
const movieGrid = document.querySelector('#movie-grid');
const movieInfo = document.querySelector('#movieInfo');
const pagesToFetch = 5;

let uniqueMovieIds = new Set();

for(let i=1; i<=pagesToFetch; i++) {
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${i}`)
        .then(response => response.json())
        .then(data => {
            // Only add movies that have not been added yet
            data.results.forEach(movie => {
                if(!uniqueMovieIds.has(movie.id)) {
                    uniqueMovieIds.add(movie.id);
                    movieArray.push(movie);
                }
            });

            // When finished fetching all pages, shuffle and display the first 100 movies
            if(i === pagesToFetch) {
                movieArray = movieArray.sort(() => Math.random() - 0.5).slice(0, 100);
                displayMovies(movieArray);
            }
        });
}


function displayMovies(movies, recommendation = false) {
    movieGrid.innerHTML = movies.map((movie, index) => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4" style="animation: dealCards 1s ${index * 0.05}s">
            <div class="movie-card card" data-id="${movie.id}">
                <img class="card-img-top" src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                </div>
            </div>
        </div>
    `).join('');

    // If these are recommendations, add a different event listener
    if (recommendation) {
        movieGrid.addEventListener('click', (e) => {
            if(e.target.closest('.movie-card')) {
                const movieCard = e.target.closest('.movie-card');
                const movieId = movieCard.dataset.id;
                displayMovieInfo(movieId, recommendation);
            }
        });
    } else {
        // Event listener for movie selection
        movieGrid.addEventListener('click', (e) => {
            if(e.target.closest('.movie-card')) {
                const movieCard = e.target.closest('.movie-card');
                const movieId = movieCard.dataset.id;
                selectMovie(movieId, movieCard);
            }
        });
    }
}




let selectedGenres = new Set();

function selectMovie(movieId, movieCard) {
    // if already selected, return
    if (selectedMovies.includes(movieId)) return;

    selectedMovies.push(movieId);
    let movie = movieArray.find(movie => movie.id == movieId);
    movie.genre_ids.forEach(id => selectedGenres.add(id));

    // grey out the selected movie card
    movieCard.style.opacity = "0.5";

    // add a tick icon to the movie card
    const tickIcon = document.createElement('i');
    tickIcon.classList.add('fas', 'fa-check', 'tick-icon');
    movieCard.appendChild(tickIcon);

    // if 10 movies have been selected, generate recommendations
    if (selectedMovies.length === 10) {
        generateRecommendations();
    }
}

async function generateRecommendations() {
    // Gather unique genre ids from selected movies
    let genreIds = [...new Set(selectedMovies.flatMap(movie => movie.genre_ids))];

    // Determine if user preference is towards animation or children's movies
    const animationOrChildren = genreIds.includes(16) || genreIds.includes(10751); // 16 and 10751 are genre IDs for Animation and Family respectively

    // Fetch movies based on the genre preference
    try {
        let recommendationArray = [];
        for(let i=1; i<=10; i++) {
            let req = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${i}&with_genres=${genreIds.join(',')}`);
            let data = await req.json();
            recommendationArray.push(...data.results);
        }

        // Remove any movies that were already in the initial 100
        recommendationArray = recommendationArray.filter(movie => !movieArray.some(m => m.id === movie.id));

        // If user preference is animation or children's movies, filter out adult, horror, or sexual content movies
       /*
	   if(animationOrChildren) {
            recommendationArray = recommendationArray.filter(movie => !movie.adult && !movie.genre_ids.includes(27)); // 27 is the genre ID for Horror
        }
		*/
		if(animationOrChildren) {
			recommendationArray = recommendationArray.filter(movie => !movie.adult && (movie.genre_ids.includes(16) || movie.genre_ids.includes(10751)));
		}


        // Sort recommendation movies by the number of shared genres with selected movies
        recommendationArray.sort((a, b) => commonGenres(b).length - commonGenres(a).length);

        // Pick top 10
        recommendations = recommendationArray.slice(0, 10);

        displayMovies(recommendations, true);
    } catch (error) {
        console.log(error);
    }
}



function commonGenres(movie) {
    return movie.genre_ids.filter(id => selectedGenres.has(id));
}

function displayMovieInfo(movieId) {
    // fetch movie info and display it in a modal
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`)
        .then(response => response.json())
        .then(data => {
            // Generate the star rating for the movie
            const starRating = generateStarRating(data.vote_average);

            movieInfo.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${data.title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.title}">
                        <p>${data.overview}</p>
                        <p>Release Date: ${data.release_date}</p>
                        <p>Rating: ${starRating}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="alreadySeen(${data.id})">Already Seen</button>
                    </div>
                </div>
            `;
            $('#movieInfo').modal('show');
        });
}


function alreadySeen(movieId) {
    // remove the movie from the recommendations array
    recommendations = recommendations.filter(movie => movie.id !== movieId);
    // add a new recommendation
    const newRec = movieArray.filter(movie => !selectedMovies.includes(movie.id) && !recommendations.includes(movie)).sort(() => Math.random() - 0.5)[0];
    recommendations.push(newRec);
    displayMovies(recommendations, true);
    $('#movieInfo').modal('hide');
}

function generateStarRating(rating) {
    let filledStars = Math.round(rating); // round to the nearest whole number
    let emptyStars = 10 - filledStars;

    let starsHTML = '';

    for(let i=0; i<filledStars; i++) {
        starsHTML += '<i class="fas fa-star" style="color: yellow;"></i>';
    }

    for(let i=0; i<emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    return `<div class="rating-box" style="background-color: yellow; color: black;">${rating}</div>${starsHTML}`;
}
