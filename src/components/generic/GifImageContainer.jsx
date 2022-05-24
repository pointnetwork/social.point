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

const GifImageContainer = ({ src }) => {

    const styles = useStyles();
    
    return (
        <Box className={styles.root}>
            <div className={styles.frame}>
                <img className={styles.image} src={src} alt=""/>
            </div>
        </Box>
    );
};

export default GifImageContainer