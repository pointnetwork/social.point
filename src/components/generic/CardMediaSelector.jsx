import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { makeStyles } from '@material-ui/core/styles';

import {Box, Fab} from '@material-ui/core';

import AddPhotoAlternateOutlinedIcon from '@material-ui/icons/AddPhotoAlternateOutlined';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MEDIA_TYPES = "image/gif,image/png,image/jpeg,image/bmp,image/webp,video/webm,video/ogg,video/mp4,video/mpeg";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    frame: {
        display:'flex',
        justifyContent:'center',
        justify:'center',
        alignItems:'center',
        border: '1px solid #ccc',
        width: '100%',
        height: '100%',
        minHeight: '450px',
        maxHeight: '500px',
        borderRadius: '4px',
        backgroundColor: '#ddd',
    },
    media: {
        height: '450px',
        maxHeight: '500px',
        backgroundSize: 'contain',
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
    fab: {
        position: 'absolute',
        backgroundColor: '#000',
        opacity: 0.5
    },
}));

const CardMediaSelector = forwardRef(({ selectedMedia, setAlert, loading=false }, ref) => {

    const styles = useStyles();
    const [media, setMedia] = useState(selectedMedia);
    const [mediaType, setMediaType] = useState();

    const mediaRef = useRef(null);

    useImperativeHandle(ref, () => ({
        media: () => media,
    }));

    const handleFileUpload = ({ target }) => {
        try {
            const file = target.files[0]; 
            if (file && (file.size <= MAX_FILE_SIZE)) {
              const fileReader = new FileReader();
              fileReader.readAsDataURL(target.files[0]);
              fileReader.onload = (e) => {
                const data = e.srcElement.result;

                const contentType = data.substring(data.indexOf(':')+1,data.indexOf(';'));
                if (!MEDIA_TYPES.split(",").includes(contentType)) {
                    setAlert("The selected file format is unsupported, please select another file");
                    return;
                }

                setMediaType(data.substring(data.indexOf(':')+1,data.indexOf('/'))); 
                setMedia(data);
              };  
            }
            else if (file && (file.size > MAX_FILE_SIZE)) {
              setAlert("For now, Point Social only supports files up to 100 MB. Please select a smaller media file.");
            }    
        }
        catch(error) {
            setAlert(error.message);
        }
    }

    const selectFile = () => {
        if (mediaRef.current) {
            mediaRef.current.click();
        }
    }

    const removeSelection = () => {
        setMedia(undefined);
        setMediaType(undefined);
    }

    const onMediaError = (e) => {
        console.error(e);
        setAlert("The selected file could not be processed, please select another file");
        setMedia(undefined);
        setMediaType(undefined);
    }

    return (
        <Box className={styles.root}>
            <div className={styles.frame}>
                {(mediaType === 'image') && 
                <img className={styles.image} src={media} onError={onMediaError} alt=""/>}
                {(mediaType === 'video') && 
                <video className={styles.video} controls>
                    <source src={media} onError={onMediaError}></source>
                </video>}
                {
                    !loading &&
                    <>
                        {!media && <Fab aria-label="add" size="large" className={styles.fab} onClick={()=>selectFile()}>
                            <AddPhotoAlternateOutlinedIcon fontSize="large" style={{color: '#fff', fontColor: '#fff'}}/>
                        </Fab>}
                        {media && <Fab aria-label="remove" size="large" className={styles.fab} onClick={removeSelection}>
                            <RemoveCircleOutlineOutlinedIcon fontSize="large" style={{color: '#fff', fontColor: '#fff'}}/>
                        </Fab>}
                    </>    
                }
            </div>
            <input ref={mediaRef} accept={MEDIA_TYPES} type="file" hidden onChange={handleFileUpload} />
        </Box>
    );
});

export default CardMediaSelector