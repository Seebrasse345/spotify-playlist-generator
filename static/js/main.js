// static/js/main.js

$(document).ready(function() {
    let selectedArtists = [];

    $('#artist-search').on('input', function() {
        let query = $(this).val();
        if (query.length > 0) {
            $.ajax({
                url: '/search_artist',
                data: { q: query },
                success: function(response) {
                    displaySearchResults(response);
                },
                error: function() {
                    console.error('Error fetching artist search results.');
                }
            });
        } else {
            $('#search-results').empty().hide();
        }
    });

    function displaySearchResults(artists) {
        let resultsDiv = $('#search-results');
        resultsDiv.empty();
        artists.forEach(artist => {
            let imgUrl = artist.images.length > 0 ? artist.images[0].url : '/static/img/default_artist.png';
            let item = $(`
                <div class="search-result-item" data-artist-id="${artist.id}">
                    <img src="${imgUrl}" alt="${artist.name}">
                    <span>${artist.name}</span>
                </div>
            `);
            item.on('click', function() {
                addArtist(artist);
            });
            resultsDiv.append(item);
        });
        resultsDiv.show();
    }

    function addArtist(artist) {
        if (selectedArtists.length >= 5) {
            alert('You can select up to 5 artists.');
            return;
        }
        if (selectedArtists.find(a => a.id === artist.id)) {
            alert('Artist already selected.');
            return;
        }
        selectedArtists.push(artist);
        updateSelectedArtists();
        $('#artist-search').val('');
        $('#search-results').empty().hide();
    }

    function updateSelectedArtists() {
        let list = $('#selected-artists-list');
        list.empty();
        selectedArtists.forEach(artist => {
            let imgUrl = artist.images.length > 0 ? artist.images[0].url : '/static/img/default_artist.png';
            let item = $(`
                <li data-artist-id="${artist.id}">
                    <img src="${imgUrl}" alt="${artist.name}">
                    <span>${artist.name}</span>
                    <button class="remove-artist">&times;</button>
                </li>
            `);
            item.find('.remove-artist').on('click', function() {
                removeArtist(artist.id);
            });
            list.append(item);
        });
    }

    function removeArtist(artistId) {
        selectedArtists = selectedArtists.filter(a => a.id !== artistId);
        updateSelectedArtists();
    }

    $('#generate-playlist').on('click', function() {
        if (selectedArtists.length === 0) {
            alert('Please select at least one artist.');
            return;
        }
        let artistIds = selectedArtists.map(a => a.id);
        let playlistLength = parseInt($('#playlist-length').val()) || 20;
        $.ajax({
            url: '/generate_playlist',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ artist_ids: artistIds, playlist_length: playlistLength }),
            success: function(response) {
                displayPlaylistResult(response);
            },
            error: function(xhr) {
                alert('An error occurred while generating the playlist.');
                console.error(xhr.responseJSON.error);
            }
        });
    });

    function displayPlaylistResult(data) {
        $('#playlist-link').attr('href', data.playlist_url);
        let tracksDiv = $('#playlist-tracks');
        tracksDiv.empty();
        data.tracks.forEach(track => {
            let imgUrl = track.album.images.length > 0 ? track.album.images[0].url : '/static/img/default_artist.png';
            let item = $(`
                <div class="track-item">
                    <img src="${imgUrl}" alt="${track.name}">
                    <div class="track-info">
                        <span class="track-name">${track.name}</span>
                        <span class="artist-name">${track.artists.map(a => a.name).join(', ')}</span>
                    </div>
                </div>
            `);
            tracksDiv.append(item);
        });
        $('#playlist-result').show();
        $('html, body').animate({
            scrollTop: $("#playlist-result").offset().top
        }, 1000);
    }
});