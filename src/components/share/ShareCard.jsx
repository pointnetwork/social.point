import { useEffect, useState, useRef, createRef } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import {Backdrop,
    Box,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
} from '@material-ui/core';

import RichTextField from '../generic/RichTextField';
import CardMediaSelector from '../generic/CardMediaSelector';
import CircularProgressWithIcon from '../generic/CircularProgressWithIcon';
import UserAvatar from '../avatar/UserAvatar';

import SendOutlinedIcon from '@material-ui/icons/SendOutlined';
import AddPhotoAlternateOutlinedIcon from '@material-ui/icons/AddPhotoAlternateOutlined';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';

import PostManager from '../../services/PostManager';
import point from "../../services/PointSDK";

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const useStyles = makeStyles((theme) => ({
    root: {
        position: "relative"
    },
    backdrop: {
        position: "absolute",
        zIndex: theme.zIndex.drawer - 1,
        opacity: 0.9    
    },
    avatar: {
        marginRight:'10px'
    },
    media: {
        height: 0,
        minHeight: '450px',
        maxHeight: '500px',
        paddingTop: '56.25%', // 16:9
        objectFit: 'contain',
        backgroundSize: 'contain',
    },
    shareBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'        
    },
    editor: {
        height: '450px',
        maxHeight: '500px',
        objectFit: 'contain',
        backgroundSize: 'contain',
        backgroundColor: '#ccc',
    },
    image: {
        objectFit: 'contain',
        backgroundSize: 'contain',
        minHeight: '450px',
        maxHeight: '500px',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    }
}));

function DataURIToBlob(dataURI) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
}

async function saveFile(file) {
    const formData = new FormData();
    formData.append("postfile", DataURIToBlob(file));
    const storageId = await point.postFile(formData);
    return storageId;
}

const ShareCard = ({ setAlert, setReload }) => {

    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const { walletAddress, profile, identity } = useAppContext();

    const styles = useStyles();
    const inputRef = useRef();
    const mediaRef = createRef();

    const toggleExpanded = () => {        
        if (expanded && !mediaRef.current.media()) {
            setExpanded(false);
        }
        else {
            setExpanded(true);
        }
    }

    const sharePost = async () => {        
        try {
            const content = inputRef && inputRef.current && inputRef.current.value && inputRef.current.value.trim();
            const media = mediaRef && mediaRef.current && mediaRef.current.media();

            if (!(content || media)) {
                setAlert("Sorry, but you cannot create a empty post!|warning");
                return;
            }

            setLoading(true);
            const storageId = (content)? await point.putString(content): EMPTY;
            const imageId = (media)? await saveFile(media): EMPTY;
            await PostManager.addPost(storageId, imageId);

            setAlert("Your post was successfully shared!|success");
            reset();
            setReload(Date.now());
        }
        catch(error) {
            setAlert(error.message)
        }
        finally {
            setLoading(false);
        }
    }

    const reset = () => {
        inputRef.current.value = null;
        setExpanded(false);
    }

    return (
        <div className={styles.root}>
            <Backdrop className={styles.backdrop} open={loading}>
                <CircularProgressWithIcon icon={<CloudUploadOutlinedIcon style={{ color: '#fff' }}/>} props={{color : 'inherit' }} />
            </Backdrop>
            <Card elevation={8} className={styles.card}>
                <Box p={1} className={styles.shareBox}>
                    <UserAvatar address={walletAddress} upperLoading={false} setAlert={setAlert} link={false} props={{className:styles.avatar}}/>
                    <RichTextField ref={inputRef} value="" placeholder={`What's in your mind ${profile && profile.displayName || identity}?`}/>
                    <IconButton aria-label="attach" ml={3} onClick={toggleExpanded}>
                        <AddPhotoAlternateOutlinedIcon/>
                    </IconButton>
                    <IconButton aria-label="share" ml={3} onClick={sharePost}>
                        <SendOutlinedIcon color="secondary"/>
                    </IconButton>
                </Box>
                <Collapse in={expanded} timeout="auto" unmountOnExit style={{ width:'100%', height: '100%'}}>
                    <CardMediaSelector ref={mediaRef} selectedMedia={undefined} setAlert={setAlert} loading={loading}/>
                </Collapse>
            </Card>
        </div>
    );
}

export default ShareCard;