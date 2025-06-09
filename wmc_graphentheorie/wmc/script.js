const API_KEY = "d268455c6655349de1f8546a0a653599";
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentGenreBtn = null;

// Navigation zwischen Bereichen - KORRIGIERT
function showSection(sectionId, element) {
    // Alle Bereiche ausblenden
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Alle Tabs deaktivieren
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Gewählten Bereich anzeigen
    document.getElementById(sectionId).classList.add('active');
    element.classList.add('active');
    
    // Spezielle Aktionen beim ersten Laden - KORRIGIERT
    if (sectionId === 'clown' && !document.querySelector('#clownResults .movie-card')) {
        console.log('Loading clown movies...');
        searchClownMovies();
    } else if (sectionId === 'top' && !document.querySelector('#topResults .movie-card')) {
        console.log('Loading top rated movies...');
        getTopRatedHorror();
    }
}

// Verbesserte API Aufruf Funktion mit besserer Fehlerbehandlung
async function apiCall(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
            throw new Error('Keine Daten erhalten');
        }
        
        return data;
    } catch (error) {
        console.error('API Fehler:', error);
        throw error;
    }
}

// Film-Karten HTML erstellen
function createMovieCard(movie) {
    if (!movie || !movie.title) return '';
    
    const posterUrl = movie.poster_path 
        ? `${IMG_BASE_URL}${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750/333/fff?text=Kein+Poster';
        
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unbekannt';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    return `
        <div class="movie-card" onclick="showMovieDetails(${movie.id})">
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" 
                 onerror="this.src='https://via.placeholder.com/500x750/333/fff?text=Kein+Poster'">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${year}</div>
                <div class="movie-rating">⭐ ${rating}</div>
            </div>
        </div>
    `;
}

// Loading-Anzeige
function showLoading(containerId) {
    const element = document.getElementById(containerId);
    if (element) {
        element.innerHTML = '<div class="loading">🎬 Filme werden geladen...</div>';
    }
}

// Fehler-Anzeige
function showError(containerId, message) {
    const element = document.getElementById(containerId);
    if (element) {
        element.innerHTML = `<div class="error">❌ ${message}</div>`;
    }
}

// Enter-Taste für Suche
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
}

// 1. Endpoint: Film-Suche
async function searchMovies() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        showError('searchResults', 'Bitte gib einen Suchbegriff ein.');
        return;
    }
    
    showLoading('searchResults');
    
    try {
        const data = await apiCall(`/search/movie?query=${encodeURIComponent(query)}`);
        
        if (data && data.results && data.results.length > 0) {
            const moviesHtml = data.results
                .filter(movie => movie.poster_path && movie.title) // Nur Filme mit Poster und Titel
                .slice(0, 20) // Maximal 20 Ergebnisse
                .map(createMovieCard)
                .filter(card => card) // Leere Karten entfernen
                .join('');
            
            if (moviesHtml) {
                document.getElementById('searchResults').innerHTML = moviesHtml;
            } else {
                showError('searchResults', 'Keine passenden Filme gefunden.');
            }
        } else {
            showError('searchResults', 'Keine Filme gefunden. Versuche einen anderen Suchbegriff.');
        }
    } catch (error) {
        showError('searchResults', 'Fehler beim Laden der Filme. Bitte versuche es später erneut.');
        console.error('Search error:', error);
    }
}

// 2. Endpoint: Genre-basierte Suche (verbessert)
async function discoverByGenre(genreId, buttonElement) {
    // Button-Status aktualisieren
    if (currentGenreBtn) currentGenreBtn.classList.remove('active');
    buttonElement.classList.add('active');
    currentGenreBtn = buttonElement;
    
    showLoading('genreResults');
    
    try {
        const data = await apiCall(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`);
        
        if (data && data.results && data.results.length > 0) {
            const moviesHtml = data.results
                .filter(movie => movie.poster_path && movie.title)
                .slice(0, 20)
                .map(createMovieCard)
                .filter(card => card)
                .join('');
            
            if (moviesHtml) {
                document.getElementById('genreResults').innerHTML = moviesHtml;
            } else {
                showError('genreResults', 'Keine passenden Filme gefunden.');
            }
        } else {
            showError('genreResults', 'Keine Filme in diesem Genre gefunden.');
        }
    } catch (error) {
        showError('genreResults', 'Fehler beim Laden der Filme. Bitte versuche es später erneut.');
        console.error('Genre search error:', error);
    }
}

// 3. Endpoint: Spezielle Clown-Film Suche - KORRIGIERT
async function searchClownMovies() {
    console.log('searchClownMovies called');
    showLoading('clownResults');
    
    const clownKeywords = ['terrifier clown', 'House of 1000 Corpses', 'Killer Klowns from Outer Space', 'pennywise', 'circus horror', 'creepy clown', 'scary clown', 'clown horror', 'clown movie', 'clown film', 'clown terror', 'clown fright', 'clown fear', 'clown nightmare'];
    
    try {
        // Sequentielle API-Calls statt parallele für bessere Stabilität
        let allMovies = [];
        
        for (const keyword of clownKeywords) {
            try {
                const data = await apiCall(`/search/movie?query=${encodeURIComponent(keyword)}`);
                if (data && data.results) {
                    allMovies = allMovies.concat(data.results);
                }
                // Kleine Verzögerung zwischen Calls
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error searching for ${keyword}:`, error);
            }
        }
        
        console.log('Total movies found:', allMovies.length);
        
        // Duplikate entfernen und nach Bewertung sortieren
        const uniqueMovies = allMovies
            .filter((movie, index, self) => 
                index === self.findIndex(m => m.id === movie.id))
            .filter(movie => movie.poster_path && movie.title)
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 16);
        
        console.log('Unique movies after filtering:', uniqueMovies.length);
        
        if (uniqueMovies.length > 0) {
            const moviesHtml = uniqueMovies.map(createMovieCard).join('');
            document.getElementById('clownResults').innerHTML = moviesHtml;
        } else {
            showError('clownResults', 'Keine Clown-Filme gefunden.');
        }
    } catch (error) {
        console.error('Clown search error:', error);
        showError('clownResults', 'Fehler beim Laden der Clown-Filme. Bitte versuche es später erneut.');
    }
}

// Top bewertete Horror-Filme - KORRIGIERT
async function getTopRatedHorror() {
    console.log('getTopRatedHorror called');
    showLoading('topResults');
    
    try {
        // Korrigierte API-Call-Syntax
        const data = await apiCall('/discover/movie?with_genres=27&sort_by=vote_average.desc&vote_count.gte=1000');
        
        console.log('Top rated data:', data);
        
        if (data && data.results && data.results.length > 0) {
            const moviesHtml = data.results
                .filter(movie => movie.poster_path && movie.title)
                .slice(0, 20)
                .map(createMovieCard)
                .filter(card => card)
                .join('');
            
            if (moviesHtml) {
                document.getElementById('topResults').innerHTML = moviesHtml;
            } else {
                showError('topResults', 'Keine passenden Filme gefunden.');
            }
        } else {
            showError('topResults', 'Keine Top-bewerteten Filme gefunden.');
        }
    } catch (error) {
        console.error('Top rated error:', error);
        showError('topResults', 'Fehler beim Laden der Top-Filme. Bitte versuche es später erneut.');
    }
}

// Zufälliger Film (verbessert)
async function getRandomMovie() {
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const genres = [27, 53, 9648]; // Horror, Thriller, Mystery
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    try {
        const data = await apiCall(`/discover/movie?with_genres=${randomGenre}&page=${randomPage}&sort_by=popularity.desc`);
        
        if (data && data.results && data.results.length > 0) {
            const validMovies = data.results.filter(movie => movie.poster_path && movie.title);
            if (validMovies.length === 0) {
                showError('randomResult', 'Keine passenden Filme gefunden.');
                return;
            }
            
            const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
            const resultDiv = document.getElementById('randomResult');
            
            resultDiv.classList.remove('show');
            setTimeout(() => {
                const overview = randomMovie.overview ? 
                    (randomMovie.overview.length > 200 ? 
                        randomMovie.overview.substring(0, 200) + '...' : 
                        randomMovie.overview) : 
                    'Keine Beschreibung verfügbar.';
                
                resultDiv.innerHTML = `

                    <div class="movie-details">
                        <img src="${IMG_BASE_URL}${randomMovie.poster_path}" 
                             alt="${randomMovie.title}" 
                             onerror="this.src='https://via.placeholder.com/150x225/333/fff?text=Kein+Poster'">
                        <div class="movie-details-info">
                            <h4>${randomMovie.title}</h4>
                            <p><strong>Year:</strong> ${randomMovie.release_date ? randomMovie.release_date.split('-')[0] : 'Unbekannt'}</p>
                            <p><strong>Rating:</strong> ⭐ ${randomMovie.vote_average ? randomMovie.vote_average.toFixed(1) : 'N/A'}</p>
                            <p><strong></strong> ${overview}</p>
                            <button onclick="showMovieDetails(${randomMovie.id})" 
                                    style="background:  #731b1b; border: none; padding: 10px 20px; border-radius: 15px; color: white; cursor: pointer; margin-top: 10px;">
                                Mehr Details
                            </button>
                        </div>
                    </div>
                `;
                resultDiv.classList.add('show');
            }, 100);
        } else {
            showError('randomResult', 'Fehler beim Laden eines zufälligen Films.');
        }
    } catch (error) {
        console.error('Random movie error:', error);
        showError('randomResult', 'Fehler beim Laden eines zufälligen Films. Bitte versuche es später erneut.');
    }
}

// Filmdetails anzeigen (neue Funktion)
async function showMovieDetails(movieId) {
    if (!movieId) return;
    
    try {
        const movie = await apiCall(`/movie/${movieId}?append_to_response=credits,videos`);
        
        if (movie) {
            const modal = document.getElementById('movieModal');
            const modalContent = document.getElementById('movieModalContent');
            
            const posterUrl = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450/333/fff?text=Kein+Poster';
            const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unbekannt';
            const runtime = movie.runtime ? `${movie.runtime} Min.` : 'Unbekannt';
            const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : 'Unbekannt';
            const director = movie.credits && movie.credits.crew ? 
                movie.credits.crew.find(person => person.job === 'Director')?.name || 'Unbekannt' : 'Unbekannt';
            
            modalContent.innerHTML = `
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <img src="${posterUrl}" alt="${movie.title}" style="width: 200px; border-radius: 10px;">
                    <div style="flex: 1; min-width: 300px;">
                        <h2 style="color: #731b1b; margin-bottom: 15px;">${movie.title}</h2>
                        <p style="margin: 8px 0;"><strong>Year:</strong> ${year}</p>
                        <p style="margin: 8px 0;"><strong>Duration:</strong> ${runtime}</p>
                        <p style="margin: 8px 0;"><strong>Genre:</strong> ${genres}</p>
                        <p style="margin: 8px 0;"><strong>Regisseur:</strong> ${director}</p>
                        <p style="margin: 8px 0;"><strong>Rating:</strong> ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                        <p style="margin: 15px 0; line-height: 1.6;"><strong>Beschreibung:</strong><br>
                        ${movie.overview || 'Keine Beschreibung verfügbar.'}</p>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Fehler beim Laden der Filmdetails:', error);
        alert('Fehler beim Laden der Filmdetails. Bitte versuche es später erneut.');
    }
}

// Modal schließen
function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

// Modal schließen wenn außerhalb geklickt wird
window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// ESC-Taste zum Schließen des Modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});