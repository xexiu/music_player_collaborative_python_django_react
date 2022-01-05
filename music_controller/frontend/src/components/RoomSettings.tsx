import { Grid } from '@material-ui/core';
import { useLocation, useParams } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';

const RoomSettings = () => {
    const params = useParams();
    const { roomCode = '' } = params;
    const { state } = useLocation();

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <CreateRoomPage
                    update={true}
                    votesToSkip={state.votesToSkip}
                    guestCanPause={state.guestCanPause}
                    roomCode={roomCode}
                />
            </Grid>
        </Grid>
    );
};

export default RoomSettings;
