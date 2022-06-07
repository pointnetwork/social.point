import "./gifplayer.css"
import { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {Box} from '@material-ui/core';

const gifFrames = require('gif-frames');
const GifPlayer = require('react-gif-player');

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
    image: {
        objectFit: 'contain',
        width: '100%',
        height: '450px',
        maxHeight: '500px',
        borderRadius: '4px',
    }
}));

const GifImageContainer = ({ src }) => {

    const styles = useStyles();
    const [loading, setLoading] = useState();
    const [still, setStill] = useState();    

    useEffect(() => {
        getFirstFrame();
    },[]);
    
    const getFirstFrame = async () => {
        setLoading(true);
        try {
            const frameData = await gifFrames({ url: src, frames: 0});
            const stream = frameData[0].getImage();
            const base64 = Buffer.from(stream._obj).toString("base64");
            setStill(`data:image/jpeg;base64,${base64}`);
        }
        catch(error) {
            console.error(error);
        }
        setLoading(false);
    }

    return (
        <Box className={styles.root}>
        {
            !loading && <div className={styles.frame}>
            {
                (still)?
                <GifPlayer gif={src} still={still} className={styles.image} />
                :
                <img className={styles.image} src={src} alt=""/>
            }
            </div>
        }
        </Box>
    );
};

export default GifImageContainer