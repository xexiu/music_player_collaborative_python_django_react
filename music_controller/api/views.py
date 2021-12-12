from datetime import datetime, timezone

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room
from .serializers import CreateRoomSerializer, RoomSerializer


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    look_up_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.look_up_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code Parameter not found in request.'}, status=status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    queryset = Room.objects.all()
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()


        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            created_at = datetime.now(timezone.utc)
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.created_at = created_at
                room.save(update_fields=[
                          'guest_can_pause', 'votes_to_skip', 'created_at'])
            else:
                room = Room.objects.create(
                    host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip, created_at=created_at)
                room.save()

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        return Response({'Bad Request': 'Invalida data...'}, status=status.HTTP_400_BAD_REQUEST)
