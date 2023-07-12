# FilmSeeker
Suggests films based on a user's preferences

Demo here:

https://jakemorgan.co.uk/projects/filmseeker

Uses TMDB API.

FilmSeeker is a movie recommendation tool designed to help users discover their ideal films. It presents a grid of 100 movie thumbnails, and users are required to select 10 movies that they prefer from the initial selection. Based on these choices, FilmSeeker generates a new grid of 10 movies using a simple algorithm that considers factors like genres and age filters. Although future versions of the project aim to enhance the suggestion engine, the current version provides a basic yet effective movie recommendation system.  If a user marks a suggested film as "already seen", a new film suggestion is generated in its place.

Todo:
* Improve UX
* Exclude films that haven't already been released yet
* Make the initial 100 film choice much more random (at the moment it seems to pull very recent films)
* Make film grid smaller
* Reduce user selection from 10 to 5
* Hook into a DB backend, with the ability for a user to create an account and add movies their "seen list", "liked", "loved", "disliked" and "hated".  Suggestion engine can then take these lists into account and refine the recommendations.
* Instead of presenting the user with a large grid of 100 films, have a single film displayed.  The user can then choose from a few options below the film thumbnail: - haven't seen, loved, liked, meh, disliked, hated.  Their response is logged and then next film is shown.  Once the engine has enough responses to build a good enough recommendation, the recommendations will be displayed to the user.
