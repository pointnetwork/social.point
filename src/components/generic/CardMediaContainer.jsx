import { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {Box} from '@material-ui/core';

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
    }
}));

const CardMediaContainer = ({ media }) => {

    const styles = useStyles();
    const [mediaType, setMediaType] = useState('image');

    const onMediaError = (e) => {
        if (mediaType === 'video') {
            setMediaType('image');
        }
        else if (mediaType === 'image') {
            setMediaType('video');            
        }
    }

    return (
        <Box className={styles.root}>
            <div className={styles.frame}>
                {(mediaType === 'image') && <img className={styles.image} src={media} onError={onMediaError} alt=""/>}
                {(mediaType === 'video') && <video className={styles.video} controls><source src={media} onError={onMediaError}></source></video>}
            </div>
        </Box>
    );
};

export default CardMediaContainer