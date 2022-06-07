import { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {Box, Dialog, IconButton} from '@material-ui/core';
import FullscreenOutlinedIcon from '@material-ui/icons/FullscreenOutlined';
import BrokenImageOutlinedIcon from '@material-ui/icons/BrokenImageOutlined';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';

import detectContentType from 'detect-content-type';

import CircularProgressWithIcon from './CircularProgressWithIcon';
import GifImageContainer from './GifImageContainer';

const Buffer = require('buffer/').Buffer;

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

    const [loading, setLoading] = useState(true);
    const [contentType, setContentType] = useState();
    const [mediaType, setMediaType] = useState();
    const [fullscreen, setFullscreen] = useState(false);
    const [mediaError, setMediaError] = useState(false);

    useEffect(() => {
        detectMedia();
    },[]);

    const detectMedia = async () => {
        setLoading(true);

        const stream = await (await fetch(media)).body;
        const reader = stream.getReader();

        const chunk = await reader.read();
        const ct = await detectContentType(Buffer.from(chunk.value));
        setContentType(ct);
        console.info(ct);

        if (ct.startsWith("image")) {
            setMediaType('image');
        }
        else if (ct.startsWith("video")) {
            setMediaType('video');            
        }
        else {
            setMediaType('other');
            setMediaError(true);
        }

        await reader.releaseLock();
        await stream.cancel();

        setLoading(false);
    }

    const onMediaError = (e) => {
        console.error(e);
        setMediaError(true);
    }

    const toggleFullScreen = () => {
        setFullscreen(!fullscreen);
    }

    return (
        <Box className={styles.root}>
            {
                (loading || mediaError) ?
                <div className={styles.frame}>
                {
                    loading?
                    <CircularProgressWithIcon icon={<ImageOutlinedIcon />} props={{color : "inherit"}} />
                    :
                    <BrokenImageOutlinedIcon style={{ fontSize: 64 }}/>
                }
                </div>
                :
                <div className={styles.frame}>
                    {(mediaType === 'image') &&
                        <>
                        {
                            (contentType === 'image/gif')?
                            <GifImageContainer src={media}/>
                            :
                            <img 
                            className={styles.image} 
                            src={media} 
                            onError={onMediaError} 
                            alt=""/>
                        }
                        </>
                    } 
                    {(mediaType === 'video') && 
                        <video 
                            className={styles.video} 
                            controls><source src={media} onError={onMediaError}></source>
                        </video>}
                </div>
            }
            { !(loading || mediaError) &&
                <div className={styles.panel}>
                    {(mediaType === 'image') && 
                        <IconButton 
                            color="primary" 
                            aria-label="fullscreen" 
                            size="small" 
                            edge="end" 
                            onClick={toggleFullScreen}>
                        <FullscreenOutlinedIcon fontSize="small"/>
                    </IconButton>}
                </div>
            }
            <Dialog maxWidth={false} open={fullscreen}>
                <img 
                    className={styles.fullscreen} 
                    src={media} 
                    onError={onMediaError} 
                    alt="" 
                    onClick={toggleFullScreen}/>                
            </Dialog>
        </Box>
    );
};

export default CardMediaContainer