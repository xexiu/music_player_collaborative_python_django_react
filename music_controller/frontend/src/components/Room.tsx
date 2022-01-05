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
        isHost: false,
        spotifyAuthenticated: false
    });

    useEffect(() => {
        getRoomDetails();
    }, []);

    async function getAuthUrl() {
        try {
            const resp = await axios('/spotify/get-auth-url');
            const { data }: any = resp;
            window.location.replace(data.url);
        } catch (error) {
            console.log('AuthUrl error: ', error);
        }
    }

    async function isAuthenticatedSpotify() {
        try {
            const resp = await axios('/spotify/is-authenticated');
            const { data } = resp;
            setAllValues(prev => {
                return { ...prev, spotifyAuthenticated: data.status };
            });
            console.log(data.status);
            if (!data.status) {
                return getAuthUrl();
            }
        } catch (error) {
            console.log('IsAuthenticathed error: ', error);
        }
    }

    async function getRoomDetails() {
        try {
            const resp: any = await axios(`/api/get-room?code=${params?.roomCode || ''}`);
            if (resp.status !== 200) {
                console.log('Response was not ok ', resp);
                return navigate('/', { replace: true });
            }
            const { data } = resp;
            setAllValues(prev => {
                return {
                    ...prev,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                };
            });
            if (data.is_host) {
                return isAuthenticatedSpotify();
            }
        } catch (error: any) {
            console.log('Error getting the room: ', error);
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
            location.href = '/';
        } catch (error: any) {
            console.log('Oops. Leaving Room Error:', error);
            if (error.request.status === 404 || error.request.status === 400) {
                console.log('Room not found', error.status);
                return navigate('/', { replace: true });
            }
        }
    }

    const renderSettingsButton = () => {
        return (
            <Grid item xs={12}>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={() => navigate(`/room/${params.roomCode}/settings`,
                        {
                            state: {
                                votesToSkip,
                                guestCanPause
                            }
                        }
                    )}
                >
                    Settings
                </Button>
            </Grid>
        );
    };

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
            {isHost ? renderSettingsButton() : null}
            <Grid item xs={12}>
                <Button variant='contained' color='secondary' onClick={handleLeaveRoom}>Leave Room</Button>
            </Grid>
        </Grid>
    );
};

export default Room;
