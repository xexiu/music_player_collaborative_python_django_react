import {
    Button,
    ButtonGroup, Grid, Typography
} from '@material-ui/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import RoomJoinPage from './RoomJoinPage';
import RoomSettings from './RoomSettings';

const HomePage = () => {
    const [allValues, setAllValues] = useState({
        isLoading: true,
        roomCode: null
    });

    useEffect(() => {
        isUserInRoom();
    }, [allValues.isLoading]);

    async function isUserInRoom() {
        try {
            const resp = await axios('/api/user-in-room');
            const { data } = resp;
            return setAllValues(prev => {
                return {
                    ...prev,
                    isLoading: false,
                    roomCode: data.code
                };
            });
        } catch (error) {
            console.log('Oppps isUserInRoom error: ', error);
        }
    }

    function RenderHomePage() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant='h3' component='h3'>House Party</Typography>
                </Grid>
                <Grid item xs={12}>
                    <ButtonGroup disableElevation variant='contained' color='primary'>
                        <Button color='primary' to='/join' component={Link}>Join a Room</Button>
                        <Button color='secondary' to='/create' component={Link}>Create a Room</Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    if (allValues.isLoading) {
        return (
            <div>Loading...</div>
        );
    } else if (allValues.roomCode) {
        return (
            <Router>
                <Routes>
                    <Route path='/room/:roomCode' element={<Room />} />
                    <Route path='/' element={<Navigate to={`/room/${allValues.roomCode}`} />} />
                    <Route path='/room/:roomCode/settings' element={<RoomSettings />} />
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path='/' element={<RenderHomePage />} />
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
                <Route path='/room/:roomCode' element={<Room />} />
                <Route path='/room/:roomCode/settings' element={<RoomSettings />} />
            </Routes>
        </Router>
    );
};

export default HomePage;
