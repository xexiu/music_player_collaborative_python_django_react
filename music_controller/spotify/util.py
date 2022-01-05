from datetime import timedelta

from django.utils import timezone
from requests import post

from .credentials import CLIENT_ID, CLIENT_SECRET
from .models import SpotifyToken

TOKEN_SPOTIFY_URL = 'https://accounts.spotify.com/api/token'


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
