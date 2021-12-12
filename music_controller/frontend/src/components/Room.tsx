import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Room = () => {
    const params = useParams();
    const [allValues, setAllValues] = useState({
        guestCanPause: true,
        votesToSkip: 2,
        isHost: false
    });

    useEffect(() => {
        getRoomDetails();
    }, []);

    async function getRoomDetails() {
        try {
            const { data } = await axios(`/api/get-room?code=${params?.roomCode || ''}`);
            return setAllValues(prev => {
                return {
                    ...prev,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                };
            });
        } catch (error) {
            console.log('Error getting the room: ', error);
        }
    }

    const { guestCanPause, votesToSkip, isHost } = allValues;

    return (
        <div>
            <p>RoomCode: {params.roomCode}</p>
            <p>Guest Can Vote?: {String(guestCanPause)}</p>
            <p>Votes needed to skip: {String(votesToSkip)}</p>
            <p>Is Host: {String(isHost)}</p>
        </div>
    );
};

export default Room;
