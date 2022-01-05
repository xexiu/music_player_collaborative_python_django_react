import { styled } from '@linaria/react';
import {
    Button,
    Collapse,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Center = styled.section`
    text-align: center;
    width: 400px;
    padding: 4px;
`;

// tslint:disable-next-line: max-line-length
const CreateRoomPage = ({ update = false, votesToSkip = 2, guestCanPause = true, roomCode = '' }: { update: boolean, votesToSkip: number, guestCanPause: boolean, roomCode: string }) => {
    const title = update ? 'Update Room' : 'Create Room';
    const navigate = useNavigate();
    const [allValues, setAllValues] = useState({
        _guestCanPause: guestCanPause,
        _votesToSkip: votesToSkip,
        successMsg: '',
        errorMsg: ''
    });

    function handleVotesChange(attr: string) {
        return (event: { target: { value: string; }; }) => {
            return setAllValues(prev => {
                return {
                    ...prev,
                    [attr]: event.target.value
                };
            });
        };
    }

    async function handleCreateRoom(event: { preventDefault: () => void; }) {
        const { _guestCanPause, _votesToSkip }: { _guestCanPause: boolean, _votesToSkip: number } = allValues;

        event.preventDefault();

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const resp = await axios.post('/api/create-room', {
                votes_to_skip: JSON.parse(_votesToSkip as any),
                guest_can_pause: JSON.parse(_guestCanPause as any)
            }, options);
            const { data } = resp;
            return navigate(`/room/${data.code}`);
        } catch (error) {
            console.log('Oops. Creating Room Error:', error);
        }
    }

    async function handleUpdateRoom(event: { preventDefault: () => void; }) {
        const { _guestCanPause, _votesToSkip }: { _guestCanPause: boolean, _votesToSkip: number } = allValues;

        event.preventDefault();

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            await axios.patch('/api/update-room', JSON.stringify({
                votes_to_skip: _votesToSkip,
                guest_can_pause: _guestCanPause,
                code: roomCode
            }), options);
            return setAllValues(prev => {
                return {
                    ...prev,
                    successMsg: `Room ${roomCode} updated successfully!`
                };
            });
        } catch (error) {
            console.log('Oops. Updating Room Error:', error);
            return setAllValues(prev => {
                return {
                    ...prev,
                    errorMsg: 'Error updating room...'
                };
            });
        }
    }

    return (
        <Grid container spacing={1} alignItems='center'>
            <Center>
                <Grid item xs={12}>
                    <Collapse
                        in={allValues.errorMsg !== '' || allValues.successMsg !== ''}
                    >
                        {allValues.successMsg !== '' ? (
                            <Alert
                                severity='success'
                                onClose={() => {
                                    setAllValues(prev => {
                                        return { ...prev, successMsg: '' };
                                    });
                                }}
                            >
                                {allValues.successMsg}
                            </Alert>
                        ) : (
                            <Alert
                                severity='error'
                                onClose={() => {
                                    setAllValues(prev => {
                                        return { ...prev, errorMsg: '' };
                                    });
                                }}
                            >
                                {allValues.errorMsg}
                            </Alert>
                        )}
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    <Typography component='h4' variant='h4'>
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControl component='fieldset'>
                        <FormHelperText>
                            Guess control of Playback State
                        </FormHelperText>
                        <RadioGroup
                            row
                            defaultValue='true'
                            onChange={handleVotesChange('_guestCanPause')}
                        >
                            <FormControlLabel
                                value={String(!!allValues._guestCanPause)}
                                control={<Radio color='primary' />}
                                label='Play/Pause'
                                labelPlacement='bottom'
                            />
                            <FormControlLabel
                                value={String(!allValues._guestCanPause)}
                                control={<Radio color='secondary' />}
                                label='No Control'
                                labelPlacement='bottom'
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl>
                        <TextField
                            required
                            type='number'
                            defaultValue={allValues._votesToSkip}
                            inputProps={{
                                min: 1,
                                style: {
                                    textAlign: 'center'
                                }
                            }}
                            onChange={handleVotesChange('_votesToSkip')}
                        />
                        <FormHelperText>
                            Votes requiered to skip song
                            <br />
                            <br />
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button color='primary' variant='contained' onClick={update ? handleUpdateRoom : handleCreateRoom}>{title}</Button>
                    <br />
                    <br />
                </Grid>
                <Grid item xs={12}>
                    <Button color='secondary' variant='contained' onClick={() => navigate(-1)}>Back</Button>
                </Grid>
            </Center>
        </Grid>
    );
};

export default CreateRoomPage;
