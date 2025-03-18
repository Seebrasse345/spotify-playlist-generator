# Spotify Playlist Generator

A web application that helps you generate personalized Spotify playlists based on your favorite artists. Built with Flask and the Spotify Web API.

## Features

- Authenticate with your Spotify account
- Search for artists
- Select up to 5 seed artists
- Generate playlists with customizable length
- View playlist tracks and open the playlist directly in Spotify

## Demo

![Spotify Playlist Generator Demo](static/img/demo.png)

## Setup

### Prerequisites

- Python 3.8 or higher
- A Spotify account
- Spotify Developer credentials (Client ID and Client Secret)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/spotify-playlist-generator.git
   cd spotify-playlist-generator
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Spotify API credentials and Flask secret key

   ```
   FLASK_SECRET_KEY=your_flask_secret_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
   ```

### Getting Spotify Credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Create a new application
4. Add `http://localhost:5000/callback` as a Redirect URI in the app settings
5. Copy your Client ID and Client Secret to the `.env` file

## Running the Application

1. Start the Flask application:
   ```
   python app.py
   ```

2. Open your browser and go to:
   ```
   http://localhost:5000
   ```

3. Log in with your Spotify account and start creating playlists!

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: Spotify Web API
- **Authentication**: OAuth 2.0
- **Visualization**: Three.js

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Spotipy](https://spotipy.readthedocs.io/) - Python library for the Spotify Web API
- [Three.js](https://threejs.org/) - JavaScript 3D library 