import {
    Card, Grid, IconButton,
    LinearProgress, Typography
} from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';

interface Song {
    title: string;
    artist: string;
    duration: number;
    time: number;
    image_url: string;
    is_playing: boolean;
    votes: number;
    id: string;
}

const MusicPlayer = ({ image_url, title, artist, is_playing, time, duration }: Song) => {
    const songProgress = (time / duration) * 100;

    async function pauseSong() {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        };
        const resp = await fetch('/spotify/pause', requestOptions);
        console.log('RESPP', resp);
    }

    async function playSong() {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        };
        const resp = await fetch('/spotify/play', requestOptions);
        console.log('RESPP', resp);
    }

    return (
        <Card>
            <Grid container spacing={1} alignItems='center'>
                <Grid item xs={4}>
                    <img src={image_url} height='100%' width='100%' />
                </Grid>
                <Grid item xs={8}>
                    <Typography component='h5' variant='h5'>
                        {title}
                    </Typography>
                    <Typography color='textSecondary' variant='subtitle1'>
                        {artist}
                    </Typography>
                    <div>
                        <IconButton
                            onClick={() => {
                                is_playing ? pauseSong() : playSong();
                            }}
                        >
                            {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton>
                            <SkipNextIcon />
                        </IconButton>
                    </div>
                </Grid>
            </Grid>
            <LinearProgress variant='determinate' value={songProgress} />
        </Card>
    );
};

export default MusicPlayer;
