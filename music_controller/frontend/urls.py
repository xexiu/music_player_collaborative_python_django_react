from django.urls import path

from .views import index

app_name = 'frontend'

urlpatterns = [
    path('', index, name=''),
    path('join', index, name='join_room'),
    path('create', index, name='create_room'),
    path('room/<str:roomCode>', index, name='room'),
    path('room/<str:roomCode>/settings', index, name='room_settings'),
]
