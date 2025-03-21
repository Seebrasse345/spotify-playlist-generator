// static/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const selectedArtists = new Map(); // Map to store selected artists (id -> artist data)
    let currentTimeRange = 'medium_term'; // Default time range
    
    // Initialize the application
    initApp();
    
    /**
     * Initialize the application and load data
     */
    function initApp() {
        // Fetch user profile data
        fetchUserProfile();
        
        // Fetch top artists and tracks with default time range
        fetchTopArtists(currentTimeRange);
        fetchTopTracks(currentTimeRange);
        fetchRecentTracks();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize Three.js background (if applicable)
        initThreeBackground();
    }
    
    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Artist search
        const artistSearchInput = document.getElementById('artist-search');
        const clearSearchBtn = document.getElementById('clear-search');
        
        if (artistSearchInput) {
            artistSearchInput.addEventListener('input', debounce(handleArtistSearch, 500));
            
            // Clear search button
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', () => {
                    artistSearchInput.value = '';
                    document.getElementById('search-results').style.display = 'none';
                    clearSearchBtn.style.display = 'none';
                });
            }
        }
        
        // Time range selector buttons
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const timeRange = button.getAttribute('data-time-range');
                changeTimeRange(timeRange);
                
                // Update active button
                timeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Track counter buttons
        const decreaseBtn = document.getElementById('decrease-tracks');
        const increaseBtn = document.getElementById('increase-tracks');
        const playlistLengthInput = document.getElementById('playlist-length');
        
        if (decreaseBtn && increaseBtn && playlistLengthInput) {
            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(playlistLengthInput.value);
                if (currentValue > parseInt(playlistLengthInput.min || 5)) {
                    playlistLengthInput.value = currentValue - 1;
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(playlistLengthInput.value);
                if (currentValue < parseInt(playlistLengthInput.max || 50)) {
                    playlistLengthInput.value = currentValue + 1;
                }
            });
        }
        
        // Generate playlist button
        const generateBtn = document.getElementById('generate-playlist');
        if (generateBtn) {
            generateBtn.addEventListener('click', handlePlaylistGeneration);
        }
        
        // Create new button in results section
        const createNewBtn = document.getElementById('create-new');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                // Reset form and hide results
                document.getElementById('playlist-name').value = '';
                document.getElementById('playlist-description').value = '';
                document.getElementById('playlist-length').value = '20';
                selectedArtists.clear();
                updateSelectedArtistsUI();
                document.getElementById('playlist-results-section').style.display = 'none';
                
                // Scroll to playlist generator section
                document.querySelector('.playlist-generator-section').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
    
    /**
     * Fetch user profile data
     */
    function fetchUserProfile() {
        fetch('/user_profile')
            .then(response => response.json())
            .then(data => {
                updateUserProfile(data);
            })
            .catch(error => console.error('Error fetching user profile:', error));
    }
    
    /**
     * Update user profile UI with fetched data
     */
    function updateUserProfile(userData) {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const userDetails = document.getElementById('user-details');
        const playlistCount = document.getElementById('playlist-count');
        const followingCount = document.getElementById('following-count');
        const followerCount = document.getElementById('follower-count');
        
        // Update profile image
        if (userAvatar && userData.images && userData.images.length > 0) {
            userAvatar.src = userData.images[0].url;
        } else if (userAvatar) {
            userAvatar.src = 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
        }
        
        // Update user name
        if (userName) {
            userName.textContent = userData.display_name || 'Spotify User';
        }
        
        // Update user details
        if (userDetails) {
            const productType = userData.product ? `${userData.product.charAt(0).toUpperCase() + userData.product.slice(1)} User` : 'Spotify User';
            userDetails.textContent = productType;
        }
        
        // Update stats if they exist in the response
        if (playlistCount && userData.playlists_count) {
            playlistCount.textContent = userData.playlists_count;
        }
        
        if (followingCount && userData.followers) {
            followingCount.textContent = userData.followers.total || 0;
        }
        
        if (followerCount && userData.followers) {
            followerCount.textContent = userData.followers.total || 0;
        }
    }
    
    /**
     * Fetch top artists based on time range
     */
    function fetchTopArtists(timeRange) {
        const container = document.getElementById('top-artists-container');
        if (!container) return;
        
        // Show loading
        container.innerHTML = `
            <div class="loading-artists">
                <div class="spinner"></div>
                <p>Loading your top artists...</p>
            </div>
        `;
        
        fetch(`/top_artists?time_range=${timeRange}&limit=8`)
            .then(response => response.json())
            .then(data => {
                displayTopArtists(data);
            })
            .catch(error => {
                console.error('Error fetching top artists:', error);
                container.innerHTML = `<p class="error-message">Failed to load top artists. Please try again later.</p>`;
            });
    }
    
    /**
     * Display top artists in the UI
     */
    function displayTopArtists(data) {
        const container = document.getElementById('top-artists-container');
        if (!container) return;
        
        if (!data.items || data.items.length === 0) {
            container.innerHTML = `<p class="no-data-message">No top artists found for this time period.</p>`;
            return;
        }
        
        let artistsHTML = '';
        
        data.items.forEach((artist, index) => {
            const imageUrl = artist.images && artist.images.length > 0 
                ? artist.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            artistsHTML += `
                <div class="grid-item" data-artist-id="${artist.id}" title="${artist.name}">
                    <div class="artist-rank">${index + 1}</div>
                    <img src="${imageUrl}" alt="${artist.name}" class="grid-item-image">
                </div>
            `;
        });
        
        container.innerHTML = artistsHTML;
        
        // Add click event to artist cards for selection
        const artistCards = container.querySelectorAll('.grid-item');
        artistCards.forEach(card => {
            card.addEventListener('click', () => {
                const artistId = card.getAttribute('data-artist-id');
                const artistName = card.getAttribute('title');
                const artistImage = card.querySelector('.grid-item-image').src;
                
                addArtistToSelection({
                    id: artistId,
                    name: artistName,
                    images: [{ url: artistImage }]
                });
            });
        });
    }
    
    /**
     * Fetch top tracks based on time range
     */
    function fetchTopTracks(timeRange) {
        const container = document.getElementById('top-tracks-container');
        if (!container) return;
        
        // Show loading
        container.innerHTML = `
            <div class="loading-tracks">
                <div class="spinner"></div>
                <p>Loading your top tracks...</p>
            </div>
        `;
        
        fetch(`/top_tracks?time_range=${timeRange}&limit=10`)
            .then(response => response.json())
            .then(data => {
                displayTopTracks(data);
            })
            .catch(error => {
                console.error('Error fetching top tracks:', error);
                container.innerHTML = `<p class="error-message">Failed to load top tracks. Please try again later.</p>`;
            });
    }
    
    /**
     * Display top tracks in the UI
     */
    function displayTopTracks(data) {
        const container = document.getElementById('top-tracks-container');
        if (!container) return;
        
        if (!data.items || data.items.length === 0) {
            container.innerHTML = `<p class="no-data-message">No top tracks found for this time period.</p>`;
            return;
        }
        
        let tracksHTML = '';
        
        data.items.forEach((track, index) => {
            const imageUrl = track.album.images && track.album.images.length > 0 
                ? track.album.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            const artistNames = track.artists.map(artist => artist.name).join(', ');
            const trackDuration = formatDuration(track.duration_ms);
            
            tracksHTML += `
                <div class="track-item">
                    <span class="track-number">${index + 1}</span>
                    <div class="track-info">
                        <div class="track-image">
                            <img src="${imageUrl}" alt="${track.name}">
                        </div>
                        <div class="track-name-artist">
                            <div class="track-name">${track.name}</div>
                            <div class="track-artist">${artistNames}</div>
                        </div>
                    </div>
                    <div class="track-album">${track.album.name}</div>
                    <div class="track-duration">${trackDuration}</div>
                </div>
            `;
        });
        
        container.innerHTML = tracksHTML;
    }
    
    /**
     * Fetch recently played tracks
     */
    function fetchRecentTracks() {
        const container = document.getElementById('recent-tracks-container');
        if (!container) return;
        
        fetch('/recent_tracks?limit=10')
            .then(response => response.json())
            .then(data => {
                displayRecentTracks(data);
            })
            .catch(error => {
                console.error('Error fetching recent tracks:', error);
                container.innerHTML = `<p class="error-message">Failed to load recent tracks. Please try again later.</p>`;
            });
    }
    
    /**
     * Display recently played tracks
     */
    function displayRecentTracks(data) {
        const container = document.getElementById('recent-tracks-container');
        if (!container) return;
        
        if (!data.items || data.items.length === 0) {
            container.innerHTML = `<p class="no-data-message">No recently played tracks found.</p>`;
            return;
        }
        
        let tracksHTML = '';
        
        data.items.forEach(item => {
            const track = item.track;
            const imageUrl = track.album.images && track.album.images.length > 0 
                ? track.album.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            const artistNames = track.artists.map(artist => artist.name).join(', ');
            
            tracksHTML += `
                <div class="recent-track-card">
                    <div class="recent-track-image">
                        <img src="${imageUrl}" alt="${track.name}">
                    </div>
                    <div class="recent-track-info">
                        <div class="recent-track-name">${track.name}</div>
                        <div class="recent-track-artist">${artistNames}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = tracksHTML;
    }
    
    /**
     * Change time range and refresh data
     */
    function changeTimeRange(timeRange) {
        currentTimeRange = timeRange;
        fetchTopArtists(timeRange);
        fetchTopTracks(timeRange);
    }
    
    /**
     * Format milliseconds to mm:ss format
     */
    function formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Debounce function to limit API calls
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    /**
     * Handle artist search input
     */
    function handleArtistSearch() {
        const searchInput = document.getElementById('artist-search');
        const searchResults = document.getElementById('search-results');
        const clearSearchBtn = document.getElementById('clear-search');
        const query = searchInput.value.trim();
        
        // Clear search button visibility
        if (clearSearchBtn) {
            clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';
        }
        
        if (query.length === 0) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }
        
        // Show loading indicator
        searchResults.innerHTML = '<div class="spinner search-spinner"></div>';
        searchResults.style.display = 'block';
        
        // Fetch artist search results
        fetch(`/search_artist?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Error searching artists:', error);
                searchResults.innerHTML = '<p class="error-message">Error searching for artists</p>';
            });
    }
    
    /**
     * Display search results in UI
     */
    function displaySearchResults(artists) {
        const searchResults = document.getElementById('search-results');
        
        if (!artists || artists.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No artists found</p>';
            return;
        }
        
        let resultsHTML = '';
        
        artists.forEach(artist => {
            const imageUrl = artist.images && artist.images.length > 0 
                ? artist.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            resultsHTML += `
                <div class="search-result-item" data-artist-id="${artist.id}">
                    <div class="search-result-image">
                        <img src="${imageUrl}" alt="${artist.name}">
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-name">${artist.name}</div>
                        <div class="search-result-followers">${new Intl.NumberFormat().format(artist.followers.total)} followers</div>
                    </div>
                </div>
            `;
        });
        
        searchResults.innerHTML = resultsHTML;
        
        // Add click event to search results
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const artistId = item.getAttribute('data-artist-id');
                const artist = artists.find(a => a.id === artistId);
                
                if (artist) {
                    addArtistToSelection(artist);
                    // Clear search
                    document.getElementById('artist-search').value = '';
                    searchResults.style.display = 'none';
                    document.getElementById('clear-search').style.display = 'none';
                }
            });
        });
    }
    
    /**
     * Add artist to the selected list
     */
    function addArtistToSelection(artist) {
        // Check if we already have 5 artists (limit)
        if (selectedArtists.size >= 5) {
            showAlert('You can select up to 5 artists');
            return;
        }
        
        // Check if artist is already selected
        if (selectedArtists.has(artist.id)) {
            showAlert('Artist already selected');
            return;
        }
        
        // Add to map
        selectedArtists.set(artist.id, artist);
        
        // Update UI
        updateSelectedArtistsUI();
    }
    
    /**
     * Update UI to reflect selected artists
     */
    function updateSelectedArtistsUI() {
        const container = document.getElementById('selected-artists-list');
        if (!container) return;
        
        // Update counter
        const counter = document.getElementById('selected-artists-count');
        if (counter) {
            counter.textContent = `(${selectedArtists.size}/5)`;
        }
        
        // If no artists selected
        if (selectedArtists.size === 0) {
            container.innerHTML = `<div class="no-artists-message">No artists selected yet. Search and select artists above.</div>`;
            
            // Update generate button state
            const generateButton = document.getElementById('generate-playlist');
            if (generateButton) {
                generateButton.disabled = true;
            }
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Add each artist
        let index = 0;
        for (const [id, artist] of selectedArtists) {
            const imageUrl = artist.images && artist.images.length > 0 
                ? artist.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            const artistElement = document.createElement('div');
            artistElement.className = 'selected-artist';
            artistElement.setAttribute('data-artist-id', id);
            
            artistElement.innerHTML = `
                <div class="selected-artist-image">
                    <img src="${imageUrl}" alt="${artist.name}">
                </div>
                <div class="selected-artist-name">${artist.name}</div>
                <button class="remove-artist" data-index="${index}" aria-label="Remove ${artist.name}">×</button>
            `;
            
            // Add event listener to remove button
            const removeButton = artistElement.querySelector('.remove-artist');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeArtistFromSelection(id);
            });
            
            container.appendChild(artistElement);
            index++;
        }
        
        // Update generate button state
        const generateButton = document.getElementById('generate-playlist');
        if (generateButton) {
            generateButton.disabled = false;
        }
    }
    
    /**
     * Remove artist from selection
     */
    function removeArtistFromSelection(artistId) {
        selectedArtists.delete(artistId);
        updateSelectedArtistsUI();
    }
    
    /**
     * Handle playlist generation
     */
    function handlePlaylistGeneration() {
        // Check if we have selected artists
        if (selectedArtists.size === 0) {
            showAlert('Please select at least one artist');
            return;
        }
        
        // Get playlist settings
        const playlistLength = document.getElementById('playlist-length')?.value || 20;
        const playlistName = document.getElementById('playlist-name')?.value || 'My Remix Playlist';
        const playlistDescription = document.getElementById('playlist-description')?.value || 'Generated with Spotify Remix Generator';
        
        // Get selected artist IDs
        const artistIds = Array.from(selectedArtists.keys());
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
            document.getElementById('loading-message').textContent = 'Creating your custom playlist...';
        }
        
        // Disable generate button
        const generateButton = document.getElementById('generate-playlist');
        if (generateButton) {
            generateButton.disabled = true;
        }
        
        // Make playlist generation request
        fetch('/generate_playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                artist_ids: artistIds,
                playlist_length: parseInt(playlistLength),
                playlist_name: playlistName,
                playlist_description: playlistDescription
            }),
        })
        .then(response => response.json())
        .then(data => {
            displayPlaylistResults(data);
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
            }
            
            // Re-enable generate button
            if (generateButton) {
                generateButton.disabled = false;
            }
            
            // Scroll to results
            const resultsSection = document.getElementById('playlist-results-section');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error('Error generating playlist:', error);
            
            // Hide loading overlay
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
            }
            
            // Re-enable generate button
            if (generateButton) {
                generateButton.disabled = false;
            }
            
            showAlert('Error generating playlist. Please try again.');
        });
    }
    
    /**
     * Display playlist results
     */
    function displayPlaylistResults(data) {
        const resultsSection = document.getElementById('playlist-results-section');
        const playlistTracks = document.getElementById('playlist-tracks');
        const playlistLink = document.getElementById('playlist-link');
        
        if (!resultsSection || !playlistTracks || !playlistLink) return;
        
        // Set playlist link
        playlistLink.href = data.playlist_url;
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Update playlist metadata
        const playlistImage = document.getElementById('playlist-image');
        if (playlistImage && data.tracks && data.tracks.length > 0 && data.tracks[0].album.images.length > 0) {
            playlistImage.src = data.tracks[0].album.images[0].url;
        }
        
        const playlistTitle = document.getElementById('playlist-title');
        if (playlistTitle) {
            playlistTitle.textContent = document.getElementById('playlist-name')?.value || 'My Remix Playlist';
        }
        
        const playlistCreator = document.getElementById('playlist-creator');
        if (playlistCreator) {
            const artistNames = Array.from(selectedArtists.values())
                .map(artist => artist.name)
                .join(', ');
            playlistCreator.textContent = `Based on ${artistNames}`;
        }
        
        const tracksCount = document.getElementById('tracks-count');
        if (tracksCount) {
            tracksCount.textContent = data.tracks.length;
        }
        
        // Calculate total duration
        let totalDurationMs = 0;
        data.tracks.forEach(track => {
            totalDurationMs += track.duration_ms;
        });
        
        const totalDuration = document.getElementById('total-duration');
        if (totalDuration) {
            const minutes = Math.floor(totalDurationMs / 60000);
            totalDuration.textContent = minutes;
        }
        
        // Display tracks
        let tracksHTML = '';
        
        data.tracks.forEach((track, index) => {
            const trackNumber = index + 1;
            const imageUrl = track.album.images.length > 0 
                ? track.album.images[0].url 
                : 'https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png';
            
            const artistNames = track.artists.map(artist => artist.name).join(', ');
            const duration = formatDuration(track.duration_ms);
            
            tracksHTML += `
                <div class="track-item" data-track-index="${index}">
                    <span class="track-number">${trackNumber}</span>
                    <div class="track-info">
                        <div class="track-image">
                            <img src="${imageUrl}" alt="${track.name}">
                        </div>
                        <div class="track-name-artist">
                            <div class="track-name">${track.name}</div>
                            <div class="track-artist">${artistNames}</div>
                        </div>
                    </div>
                    <div class="track-album">${track.album.name}</div>
                    <div class="track-duration">${duration}</div>
                </div>
            `;
        });
        
        playlistTracks.innerHTML = tracksHTML;
        
        // Add animation for tracks appearing
        const trackElements = playlistTracks.querySelectorAll('.track-item');
        trackElements.forEach((track, index) => {
            setTimeout(() => {
                track.classList.add('visible');
            }, 50 * index);
        });
    }
    
    /**
     * Initialize Three.js background if available
     */
    function initThreeBackground() {
        // Will implement Three.js background if needed
        // This is a placeholder for potential implementation
    }
    
    /**
     * Show an alert message
     */
    function showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        
        if (!alertContainer) {
            // Create alert container if it doesn't exist
            const newAlertContainer = document.createElement('div');
            newAlertContainer.id = 'alert-container';
            document.body.appendChild(newAlertContainer);
            
            showAlert(message, type); // Recursive call now that container exists
            return;
        }
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert ${type}`;
        alertElement.textContent = message;
        
        alertContainer.appendChild(alertElement);
        
        // Add visible class after a slight delay for animation
        setTimeout(() => {
            alertElement.classList.add('visible');
        }, 10);
        
        // Remove alert after 3 seconds
        setTimeout(() => {
            alertElement.classList.remove('visible');
            
            // Remove element after fade out animation
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 300);
        }, 3000);
    }
});