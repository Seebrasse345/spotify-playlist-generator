# app.py

import os
from flask import Flask, session, request, redirect, url_for, render_template, jsonify
from flask_session import Session
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key')  # Set this in .env
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
Session(app)

# Spotify OAuth config
CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI', 'http://localhost:5000/callback')
SCOPE = 'playlist-modify-private,user-library-read'

# Spotipy OAuth object
sp_oauth = SpotifyOAuth(
  client_id=CLIENT_ID,
  client_secret=CLIENT_SECRET,
  redirect_uri=REDIRECT_URI,
  scope=SCOPE,
  cache_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.spotifycache')
)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/login')
def login():
  auth_url = sp_oauth.get_authorize_url()
  return redirect(auth_url)

@app.route('/callback')
def callback():
  code = request.args.get('code')
  token_info = sp_oauth.get_access_token(code)
  session['token_info'] = token_info
  session.permanent = True
  return redirect(url_for('home'))

def get_spotify_client():
  token_info = session.get('token_info', None)
  if not token_info:
      return None
  if sp_oauth.is_token_expired(token_info):
      token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
      session['token_info'] = token_info
  sp = spotipy.Spotify(auth=token_info['access_token'])
  return sp

@app.route('/home')
def home():
  sp = get_spotify_client()
  if sp is None:
      return redirect(url_for('login'))
  return render_template('home.html')

@app.route('/search_artist', methods=['GET'])
def search_artist():
  sp = get_spotify_client()
  if sp is None:
      return redirect(url_for('login'))
  query = request.args.get('q')
  results = sp.search(q=query, type='artist', limit=5)
  artists = results['artists']['items']
  return jsonify(artists)

@app.route('/generate_playlist', methods=['POST'])
def generate_playlist():
  sp = get_spotify_client()
  if sp is None:
      return redirect(url_for('login'))
  data = request.json
  artist_ids = data.get('artist_ids', [])
  playlist_length = data.get('playlist_length', 20)
  if not artist_ids:
      return jsonify({'error': 'No artists selected'}), 400
  # Generate recommendations
  recommendations = sp.recommendations(seed_artists=artist_ids, limit=playlist_length)
  track_ids = [track['id'] for track in recommendations['tracks']]
  # Create a new playlist
  user_id = sp.current_user()['id']
  playlist = sp.user_playlist_create(
      user=user_id,
      name='Your Generated Playlist',
      public=False,
      collaborative=False,
      description='A playlist generated just for you!'
  )
  sp.playlist_add_items(playlist_id=playlist['id'], items=track_ids)
  playlist_url = playlist['external_urls']['spotify']
  # Get track details for display
  tracks = recommendations['tracks']
  return jsonify({'playlist_url': playlist_url, 'tracks': tracks})

@app.route('/logout')
def logout():
  session.clear()
  return redirect(url_for('index'))

if __name__ == '__main__':
  app.run(debug=True)