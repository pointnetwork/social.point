import { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {Box, Dialog, IconButton} from '@material-ui/core';
import FullscreenOutlinedIcon from '@material-ui/icons/FullscreenOutlined';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    frame: {
        display:'flex',
        justifyContent:'center',
        justify:'center',
        alignItems:'center',
        border: '1px solid #eee',
        minHeight: '450px',
        maxHeight: '500px',
        borderRadius: '4px',
        backgroundColor: '#eee',
    },
    media: {
        height: '450px',
        maxHeight: '500px',
        backgroundColor: '#ddd',
        padding: '5px'
    },
    image: {
        objectFit: 'contain',
        width: '100%',
        height: '450px',
        maxHeight: '500px',
        borderRadius: '4px',
    },
    video: {
        objectFit: 'contain',
        width: '100%',
        height: '450px',
        maxHeight: '500px',
        borderRadius: '4px',
    },
    panel: {
        display:'flex',
        alignItems:'flex-end',
        justifyContent:'flex-end',
        justify:'flex-end',
    },
    fullscreen: {
        objectFit: 'contain',
        width: '100%',
        height: '100',
    },
}));

const CardMediaContainer = ({ media }) => {

    const styles = useStyles();
    const [mediaType, setMediaType] = useState('image');
    const [fullscreen, setFullscreen] = useState(false);
    
    const onMediaError = (e) => {
        if (mediaType === 'video') {
            setMediaType('image');
        }
        else if (mediaType === 'image') {
            setMediaType('video');            
        }
    }

    const toggleFullScreen = () => {
        setFullscreen(!fullscreen);
    }

    return (
        <Box className={styles.root}>
            <div className={styles.frame}>
                {(mediaType === 'image') && <img className={styles.image} src={media} onError={onMediaError} alt=""/>}
                {(mediaType === 'video') && <video className={styles.video} controls><source src={media} onError={onMediaError}></source></video>}
            </div>
            <div className={styles.panel}>
                {(mediaType === 'image') && <IconButton color="primary" aria-label="fullscreen" size="small" edge="end" onClick={toggleFullScreen}>
                    <FullscreenOutlinedIcon fontSize="small"/>
                </IconButton>}
            </div>
            <Dialog maxWidth={false} open={fullscreen}>
                <img className={styles.fullscreen} src={media} onError={onMediaError} alt="" onClick={toggleFullScreen}/>                
            </Dialog>
        </Box>
    );
};

export default CardMediaContainer