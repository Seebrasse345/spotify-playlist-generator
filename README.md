# Spotify Playlist Generator

A sophisticated web application that leverages the Spotify Web API to create personalized playlists based on your favorite artists. The application provides a sleek, intuitive interface for exploring your listening habits and generating custom playlists.

![Spotify Playlist Generator Screenshot](https://via.placeholder.com/800x450)

## Features

### Authentication & User Profile
- Secure OAuth 2.0 authentication with Spotify
- User profile display with playlist count, followers, and following stats
- Session management with automatic token refresh

### Music Discovery
- View your top artists and tracks with time range filtering (4 weeks, 6 months, all time)
- Browse recently played tracks
- Search for any artist in the Spotify catalog

### Playlist Generation
- Select up to 5 seed artists to influence your playlist
- Customize playlist name, description, and track count
- Generate playlists directly to your Spotify account
- View generated tracks with album art, artist info, and duration
- Open playlists directly in Spotify

### Visual Experience
- Dynamic Three.js background visualization
- Responsive design for all device sizes
- Smooth animations and transitions

## Technology Stack

### Backend
- **Flask**: Python web framework for handling API routes and server-side logic
- **Spotipy**: Python library for interfacing with the Spotify Web API
- **Flask-Session**: Server-side session management
- **OAuth 2.0**: Authentication flow for secure API access
- **Python-dotenv**: Environment variable management

### Frontend
- **HTML5/CSS3**: Semantic markup and modern CSS features
- **JavaScript (ES6+)**: Dynamic client-side functionality
- **Three.js**: 3D visualization for background effects
- **Font Awesome**: Icon library
- **Google Fonts**: Typography
- **CSS Grid/Flexbox**: Advanced layout techniques

### APIs
- **Spotify Web API**: Access to Spotify's vast music database and user information
  - User Authentication
  - Top Artists/Tracks
  - Search Functionality
  - Playlist Creation
  - Recently Played Tracks

## Architecture

The application follows a client-server architecture:

1. **Server-side (Flask)**:
   - Handles authentication with Spotify
   - Manages API calls to the Spotify Web API
   - Processes and transforms data for the client
   - Maintains user sessions

2. **Client-side (JavaScript)**:
   - Manages the UI state and interactions
   - Makes AJAX requests to the Flask backend
   - Renders data using dynamic DOM manipulation
   - Provides visual feedback with animations and transitions

## How It Works

1. **Authentication Flow**:
   - User clicks "Login with Spotify"
   - Flask redirects to Spotify's authorization page
   - User grants permissions
   - Spotify redirects back with an authorization code
   - Flask exchanges the code for access and refresh tokens
   - Tokens are stored in the server-side session

2. **Data Retrieval**:
   - The application fetches user profile data, top artists, and tracks
   - Time-range filters allow viewing listening habits over different periods
   - Artist search queries the Spotify API and returns results

3. **Playlist Generation**:
   - User selects seed artists (up to 5)
   - Flask sends a recommendations request to Spotify with selected artists
   - Spotify returns tracks based on the musical attributes of those artists
   - A new playlist is created in the user's Spotify account with the generated tracks
   - The UI displays the new playlist with track details

## Setup and Installation

### Prerequisites

- Python 3.8 or higher
- A Spotify account
- Spotify Developer API credentials

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spotify-playlist-generator.git
   cd spotify-playlist-generator
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your credentials:
   ```
   FLASK_SECRET_KEY=your_secure_random_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
   ```

### Obtaining Spotify Credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Add `http://localhost:5000/callback` as a Redirect URI in your app settings
4. Copy the Client ID and Client Secret to your `.env` file

### Running the Application

Start the Flask development server:
```bash
python app.py
```

Access the application at `http://localhost:5000`

## Project Structure

```
spotify-playlist-generator/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in repo)
├── .gitignore             # Git ignore file
├── LICENSE                # MIT License
├── README.md              # Project documentation
├── static/                # Static assets
│   ├── css/               # Stylesheets
│   │   └── styles.css     # Main CSS file
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Main functionality
│   │   └── visualizer.js  # Three.js visualization
│   └── favicon.ico        # Favicon
└── templates/             # HTML templates
    ├── base.html          # Base template with common elements
    ├── index.html         # Landing page
    ├── home.html          # Main application page
    └── result.html        # Results page
```

## Security Considerations

- **OAuth 2.0**: Secure authentication without storing Spotify credentials
- **Server-side Session Storage**: Tokens are not exposed to client-side JavaScript
- **HTTPS**: In production, always use HTTPS for secure communication
- **Environmental Variables**: Sensitive credentials stored in environment variables, not in code

## Possible Enhancements

1. **Advanced Playlist Customization**:
   - Add musical attribute sliders (tempo, energy, danceability)
   - Genre filtering options
   - Exclude already saved tracks

2. **Expanded Visualization**:
   - Audio analysis visualization that responds to the currently playing track
   - More interactive 3D elements using Three.js

3. **Social Features**:
   - Share generated playlists
   - Collaborative playlist generation
   - Friend activity integration

4. **Performance Optimizations**:
   - Server-side caching for frequent API calls
   - Progressive loading for large playlists
   - Optimized images and assets

5. **Deployment Considerations**:
   - Containerization with Docker
   - CI/CD pipeline setup
   - Cloud hosting options (Heroku, AWS, etc.)

## Troubleshooting

### Common Issues

1. **Authentication Problems**:
   - Ensure your Spotify API credentials are correct
   - Verify the redirect URI matches exactly what's in your Spotify app settings
   - Check that the required scopes are included in the authorization request

2. **API Rate Limiting**:
   - Spotify API has rate limits that may affect functionality if exceeded
   - Implement caching strategies to reduce API calls

3. **Flask Session Issues**:
   - Ensure the Flask secret key is set
   - Check session configuration if tokens are not persisting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Spotipy](https://spotipy.readthedocs.io/) - Python library for the Spotify API
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [Three.js](https://threejs.org/) - JavaScript 3D library