import {
    Button, Collapse, Grid, Typography
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';

interface Song {
    title: string;
    artist: string;
    duration: number;
    time: number;
    image_url: string;
    is_playing: boolean;
    votes: number;
    votes_required: number;
    id: string;
}
interface StateProps {
    guestCanPause: boolean;
    votesToSkip: number;
    isHost: boolean;
    spotifyAuthenticated: boolean;
    errorMsg: string;
    song: Song;
}

const Room = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [allValues, setAllValues] = useState<StateProps>({
        guestCanPause: true,
        votesToSkip: 2,
        isHost: false,
        spotifyAuthenticated: false,
        errorMsg: '',
        song: {} as Song
    });

    useEffect(() => {
        getRoomDetails();
        getCurrentSong()
        // const interval = setInterval(getCurrentSong, 1000);
        return () => {
            // clearInterval(interval);
        };
    }, []);

    async function getCurrentSong() {
        try {
            const resp = await axios('/spotify/current-song');
            const song: Song = resp.data;
            console.log('Song', song);

            if (!Object.keys(song).length) {
                return setAllValues(prev => {
                    return {
                        ...prev,
                        errorMsg: 'Please Open Spotify and play first song then refresh this page!'
                    };
                });
            }

            setAllValues(prev => {
                return {
                    ...prev,
                    song
                };
            });
        } catch (error) {
            console.log('getCurrentSong error: ', error);
        }
    }

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
            if (error.request.status === 404 || error.request.status === 400) {
                setAllValues(prev => {
                    return {
                        ...prev,
                        errorMsg: 'Room not found or doesn\'t exist!! ' + params?.roomCode
                    };
                });
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
            <Grid item xs={6} style={{ marginTop: 10 }}>
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
        <Grid container spacing={1} alignItems='center' justifyContent='center'>
            <Grid item xs={12}>
                <Collapse
                    in={allValues.errorMsg !== ''}
                >
                    <Alert
                        severity='error'
                        onClose={() => {
                            setAllValues(prev => {
                                return { ...prev, errorMsg: '' };
                            });
                            return navigate('/', { replace: true });
                        }}
                    >
                        {allValues.errorMsg}
                    </Alert>
                </Collapse>
            </Grid>
            <Grid item xs={12}>
                <Typography>RoomCode: {params.roomCode}</Typography>
            </Grid>
            {!!Object.keys(allValues.song).length && <MusicPlayer {...allValues.song} />}
            {isHost ? renderSettingsButton() : null}
            <Grid item xs={6} style={{ marginTop: 10 }}>
                <Button variant='contained' color='secondary' onClick={handleLeaveRoom}>Leave Room</Button>
            </Grid>
        </Grid>
    );
};

export default Room;
