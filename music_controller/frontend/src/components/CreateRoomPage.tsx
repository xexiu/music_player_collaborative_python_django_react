import {
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_VOTES = 2;

const CreateRoomPage = () => {
    const navigate = useNavigate();
    const [allValues, setAllValues] = useState({
        guestCanPause: true,
        votesToSkip: DEFAULT_VOTES
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

    async function handleSubmitButton(event: { preventDefault: () => void; }) {
        const { guestCanPause, votesToSkip }: { guestCanPause: boolean, votesToSkip: number } = allValues;

        event.preventDefault();

        const options = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const { data } = await axios.post('/api/create-room', {
                votes_to_skip: JSON.parse(votesToSkip as any),
                guest_can_pause: JSON.parse(guestCanPause as any)
            }, options);
            return navigate({ pathname: `/room/${data.code}`});
        } catch (error) {
            console.log('Oops. Creating Room Error:', error);
        }
    }

    return (
        <Grid container spacing={1} alignContent='center'>
            <Grid item xs={12}>
                <Typography component='h4' variant='h4'>
                    Create a Room
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
                        onChange={handleVotesChange('guestCanPause')}
                    >
                        <FormControlLabel
                            value='true'
                            control={<Radio color='primary' />}
                            label='Play/Pause'
                            labelPlacement='bottom'
                        />
                        <FormControlLabel
                            value='false'
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
                        defaultValue={DEFAULT_VOTES}
                        inputProps={{
                            min: 1,
                            style: {
                                textAlign: 'center'
                            }
                        }}
                        onChange={handleVotesChange('votesToSkip')}
                    />
                    <FormHelperText>
                        Votes requiered to skip song
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <Button color='primary' variant='contained' onClick={handleSubmitButton}>Create a Room</Button>
            </Grid>
            <Grid item xs={12}>
                <Button color='secondary' variant='contained' to='/' component={Link}>Back</Button>
            </Grid>
        </Grid>
    );
};

export default CreateRoomPage;
