from datetime import timedelta

import requests
from django.shortcuts import redirect
from django.utils import timezone
from requests import get, post, put

from .credentials import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
from .models import SpotifyToken

TOKEN_SPOTIFY_URL = 'https://accounts.spotify.com/api/token'
BASE_URL = 'https://api.spotify.com/v1/me/'


def get_user_tokens(session_key):
    user_tokens = SpotifyToken.objects.filter(user=session_key)

    if user_tokens.exists():
        return user_tokens[0]
    return None


def update_or_create_user_tokens(session_key, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_key)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token',
                    'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_key, access_token=access_token,
                              token_type=token_type, expires_in=expires_in, refresh_token=refresh_token)
        tokens.save()


def is_spotify_authenticated(session_key):
    tokens = get_user_tokens(session_key)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            try:
                refresh_spotify_token(session_key)
            except:
                return False

        return True

    return False


def get_spotify_data_token(custom_data):
    common_params = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    params = {**custom_data, **common_params}

    response = post(TOKEN_SPOTIFY_URL, params).json()

    return {
        'access_token': response.get('access_token'),
        'token_type': response.get('token_type'),
        'expires_in': response.get('expires_in'),
        'refresh_token': response.get('refresh_token')
    }


def refresh_spotify_token(session_key):
    refresh_token = get_user_tokens(session_key).refresh_token
    data = get_spotify_data_token({
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token
    })

    update_or_create_user_tokens(session_key, **data)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')
    data = get_spotify_data_token({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    })

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, **data)
    # The app must have an app_name --> check urls.py from frontend
    # Redirects to an app. For example: frontend (app_name)
    # To redirect to app home -> frontend:
    # To redirect to app's page -> frontend:room
    return redirect('frontend:')


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    headers = {'Content-Type': 'application/json',
               'Authorization': f'Bearer ' + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        resp = requests.put(BASE_URL + endpoint, headers=headers)
        print('RESP', resp.text)
        return resp.ok

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}


def play_song(session_id):
    return execute_spotify_api_request(session_id, 'player/play', put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, 'player/pause', put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)
