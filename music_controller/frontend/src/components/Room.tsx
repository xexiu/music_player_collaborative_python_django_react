import {
    Button, Grid, Typography
} from '@material-ui/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Room = () => {
    const params = useParams();
    const navigate = useNavigate();
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
            const resp: any = await axios(`/api/get-room?code=${params?.roomCode || ''}`);
            if (resp.status !== 200) {
                console.log('Response was not ok ', resp);
                return navigate('/', { replace: true });
            }
            const { data } = resp;
            return setAllValues(prev => {
                return {
                    ...prev,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                };
            });
        } catch (error: any) {
            console.log('Error getting the room: ', error);
            if (error.request.status === 404) {
                console.log('Room not found', error);
                return navigate('/', { replace: true });
            }
        }
    }

    async function handleLeaveRoom(event: { preventDefault: () => void; }) {
        event.preventDefault();

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const resp = await axios.post('/api/leave-room', {}, options);
            const { message } = resp.data;
            console.log('Leaving room --> ', message);
            return navigate('/', { replace: true });
        } catch (error: any) {
            console.log('Oops. Leaving Room Error:', error);
            if (error.request.status === 404) {
                console.log('Room not found', error.status);
                return navigate('/', { replace: true });
            }
        }
    }

    const { guestCanPause, votesToSkip, isHost } = allValues;

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Typography>RoomCode: {params.roomCode}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography>Votes: {votesToSkip}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography>Guest can pause: {String(guestCanPause)}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography>Is Host: {String(isHost)}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Button variant='contained' color='secondary' onClick={handleLeaveRoom}>Leave Room</Button>
            </Grid>
        </Grid>
    );
};

export default Room;
