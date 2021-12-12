import {
    Button, Grid, TextField,
    Typography
} from '@material-ui/core';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RoomJoinPage = () => {
    const navigate = useNavigate();
    const [allValues, setAllValues] = useState({
        roomCode: '',
        error: false,
        errorMsg: ''
    });

    async function handleJoinRoom() {
        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            await axios.post('/api/join-room', {
                code: allValues.roomCode
            }, options);
            return navigate({ pathname: `/room/${allValues.roomCode}` });
        } catch (error: any) {
            console.log('Oops. Creating Room Error:', error.response);
            return setAllValues(prev => {
                return {
                    ...prev,
                    error: true,
                    errorMsg: error.response.data.errorMsg
                };
            });
        }
    }

    function handleTextFieldChange(event: { target: { value: string; }; }) {
        return setAllValues(prev => {
            return {
                ...prev,
                roomCode: event.target.value
            };
        });
    }

    const { roomCode, error, errorMsg } = allValues;
    return (
        <Grid container spacing={1} alignItems='center'>
            <Grid item xs={12}>
                <Typography variant='h4' component='h4'>
                    Join a Room
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    error={error}
                    label='Code'
                    placeholder='Enter a Room Code'
                    value={roomCode}
                    helperText={errorMsg}
                    variant='outlined'
                    onChange={handleTextFieldChange}
                />
            </Grid>
            <Grid item xs={12}>
                <Button variant='contained' color='primary' onClick={handleJoinRoom}>Enter Room</Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant='contained' color='secondary' to='/' component={Link}>Back</Button>
            </Grid>
        </Grid>
    );
};

export default RoomJoinPage;
