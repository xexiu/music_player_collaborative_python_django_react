from django.shortcuts import redirect
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .credentials import CLIENT_ID, REDIRECT_URI
from .util import (get_spotify_data_token, is_spotify_authenticated,
                   update_or_create_user_tokens)


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


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


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
