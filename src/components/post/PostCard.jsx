import clsx from 'clsx';
import { useEffect, useState, useRef, createRef } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';
import { usePushingGutterStyles } from '@mui-treasury/styles/gutter/pushing';
import { useLabelIconStyles } from '@mui-treasury/styles/icon/label';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';

import { Link } from "wouter";

import RichTextField from '../generic/RichTextField';
import CircularProgressWithIcon from "../../components/generic/CircularProgressWithIcon";

import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import LanguageOutlinedIcon from '@material-ui/icons/LanguageOutlined';

import { format } from "timeago.js";

import {Backdrop,
        Button,
        Card,
        CardActions, 
        CardContent,
        CardHeader,
        CircularProgress,
        Collapse,
        Dialog,
        DialogActions,
        DialogContent,
        DialogContentText,
        DialogTitle,        
        IconButton,
        Menu,
        MenuItem,
        ListItemIcon,
        Typography,
    } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';

import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import UserAvatar from '../avatar/UserAvatar';
import CommentList from '../comments/CommentList';
import CardMediaSelector from '../generic/CardMediaSelector';
import CardMediaContainer from '../generic/CardMediaContainer';

import point from "../../services/PointSDK";
import UserManager from '../../services/UserManager';
import PostManager from '../../services/PostManager';

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        position: "absolute",
        zIndex: theme.zIndex.drawer - 1,
        opacity: 0.9    
    },
    card: {
    },
    avatar: {
        cursor:'pointer'
    },
    media: {
        height: 0,
        minHeight: '250px',
        maxHeight: '300px',
        paddingTop: '56.25%', // 16:9
        objectFit: 'contain',
        backgroundSize: 'contain',
    },
    editor: {
        height: '250px',
        minHeight: '250px',
        maxHeight: '300px',
        objectFit: 'contain',
        backgroundSize: 'contain',
        backgroundColor: '#ccc',
    },
    image: {
        objectFit: 'contain',
        backgroundSize: 'contain',
        minHeight: '250px',
        maxHeight: '300px',
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


const PostCard = ({post, setUpperLoading, setAlert, canExpand=true, startExpanded=false, parentDeletePost}) => {

    const [loading, setLoading] = useState(true);
    const [countersLoading, setCountersLoading] = useState(true);

    const [expanded, setExpanded] = useState(startExpanded);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [prompt, showPrompt] = useState(false);

    const styles = useStyles();
    const inputRef = useRef();
    const mediaRef = createRef();

    const gutterStyles = usePushingGutterStyles({ space: 1, firstExcluded: false });
    const iconLabelStyles = useLabelIconStyles({ linked: true });
    
    const { walletAddress, profile, identity, goHome} = useAppContext();

    const [name, setName] = useState();
    const [color, setColor] = useState(`#${post.from.slice(-6)}`);

    const [content, setContent] = useState();
    const [media, setMedia] = useState();
    const [date, setDate] = useState();

    const [likes, setLikes] = useState();
    const [comments, setComments] = useState();
    
    const [like, setLike] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    const actionsAnchor = useRef();
    const shareAnchor = useRef();
    const expandButton = useRef();
    
    useEffect(() => {
        loadPost();
    }, []);

    const loadPost = async () => {

        if (post.from === walletAddress) {
            setName((profile && profile.displayName) || identity);
        }
        else {
            try {
                const profile = await UserManager.getProfile(post.from);
                const { identity } = await point.ownerToIdentity(post.from);
                const name = (profile[0] === EMPTY)? identity : await point.getString(profile[0], {  encoding: 'utf-8' });
                setName(name);
            }
            catch(error) {
                setAlert(error.message);
            }
        }

        try {
            const contents = (post.contents === EMPTY)? EMPTY :  await point.getString(post.contents, {  encoding: 'utf-8' })
            setContent(contents);

            if (post.image !== EMPTY)  {
                setMedia(`/_storage/${post.image}`);
            }
            const isLiked = await PostManager.checkLikeToPost(post.id);

            setLike(isLiked);
            setCountersLoading(false);
        }
        catch(error) {
            setAlert(error.message);
        }

        setDate(post.createdAt);
        setLikes(post.likesCount);
        setComments(post.commentsCount);
        setComments(post.commentsCount);

        setCountersLoading(false);
        setLoading(false);
    };

    const handleAction = (action) => {
        switch(action) {
          case 'edit':
            startEdit();
          break;
          case 'save':
            saveEdit();
            break;
          default:
          case 'cancel':
            cancelEdit();
          break;
          case 'delete':
            showPrompt(true);
          break;
        }
        setActionsOpen(false);  
    };

    const share = async (type) => {        
        try {
            setShareOpen(false);
            const url = `https://social.point${((type === 'web2')? '.link' : '')}/post/${post.id}`;

            if (window.navigator.share) {
                await window.navigator.share({ url });
            }
            else if (window.navigator.clipboard) {
                await window.navigator.clipboard.writeText(url);
                setAlert("Copied to clipboard!|success");
            }
        }
        catch(error) {
            setAlert(error.message);
        }
    }

    const deletePost = async () => {
        try {
            setLoading(true);
            await PostManager.deletePost(post.id);
            if (parentDeletePost) {
                parentDeletePost(post.id);
            }
            else {
                await goHome();
            }
        }
        catch(error) {
            setAlert(error.message);
            setLoading(false);
        }
    };

    const cancelEdit = async () => {
        setEdit(false);
    };
    
    const startEdit = async () => {
        setEdit(true);
    };

    const saveEdit = async () => { 
        
        try {
            const newContent = (inputRef.current.value.trim())? inputRef.current.value.trim() : "";
            const newMedia = mediaRef.current.media();

            setEdit(false);
            setLoading(true);

            let contentId;
            if (!newContent) {
                contentId = EMPTY;
            }
            if (newContent === content) {
                contentId = post.contents;
            }
            else {
                const storageId = (newContent === EMPTY)? newContent : await point.putString(newContent, {  encoding: 'utf-8' });
                contentId = storageId;
            }

            let imageId;
            if (!newMedia) {
                imageId = EMPTY;
            }
            else if (newMedia === media) {
                imageId = post.image;
            }
            else {
                const formData = new FormData()
                formData.append("postfile", DataURIToBlob(newMedia));
                const storageId = await point.postFile(formData);
                imageId = storageId;
            }

            if (contentId === imageId && contentId === EMPTY) {
                throw new Error("Sorry, but you can't create an empty post");
            }
            
            const result = await PostManager.editPost(post.id, contentId, imageId);

            setContent(newContent);
            setMedia(newMedia);
        }
        catch(error) {
            console.log(error);
            setAlert(error.message);
        }
        finally {
            setLoading(false);
        }
    };
    
    const toggleLike = async () => {
        try {
            setLikeLoading(true);

            await PostManager.addLikeToPost(post.id);

            const isLiked = await PostManager.checkLikeToPost(post.id);
            setLike(isLiked);

            //TODO: Change to events
            const data = await PostManager.getPost(post.id);

            setLikes(parseInt(data[5]));
        }
        catch(error) {
            setAlert(error.message);
        }
        finally {
            setLikeLoading(false);
        }
    }

    const reloadCount = async () => {
        const data = await PostManager.getPost(post.id);
        setLikes(parseInt(data[5]));
        setComments(parseInt(data[6]));
    }

    const handleActionsOpen = () => {
        setActionsOpen(true);
    };
    
    const handleActionsClose = () => {
        setActionsOpen(false);
    };

    const handleShareOpen = () => {
        setShareOpen(true);
    };
    
    const handleShareClose = () => {
        setShareOpen(false);
    };

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const dialog = <>
        <Dialog
            open={prompt}
            aria-labelledby="alert-dialog-prompt-delete"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Delete post?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this post? This action cannot be undone
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => showPrompt(false)} color="primary">
                Cancel
            </Button>
            <Button onClick={deletePost} color="primary" autoFocus>
                Ok
            </Button>
            </DialogActions>
        </Dialog>
    </>

    
    const postActions = <>
        <IconButton aria-label="post-menu" aria-haspopup="true" ref={actionsAnchor} onClick={handleActionsOpen}><MoreVertIcon /></IconButton>
        <Menu id="actions-menu"
            anchorEl={actionsAnchor.current}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            getContentAnchorEl={null}
            onClose={handleActionsClose}
            open={actionsOpen}>
        {!edit &&
            <MenuItem onClick={(event) => handleAction('edit')}>
            <ListItemIcon style={{margin: 0}}>
                <EditOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Edit</Typography>
            </MenuItem>
        }
        {!edit && 
            <MenuItem onClick={(event) => handleAction('delete')}>
            <ListItemIcon style={{margin: 0}}>
                <DeleteOutlineOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Delete</Typography>
            </MenuItem>
        }
        {edit && 
            <MenuItem onClick={(event) => handleAction('cancel')}>
            <ListItemIcon style={{margin: 0}}>
                <CancelOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Cancel</Typography>
            </MenuItem>
        }
        {edit && 
            <MenuItem onClick={(event) => handleAction('save')}>
            <ListItemIcon style={{margin: 0}}>
                <SaveOutlinedIcon fontSize="small" style={{margin: 0}}/>
            </ListItemIcon>
            <Typography variant="caption" align="left">Save</Typography>
            </MenuItem>
        }
        </Menu>
    </>

    const shareActions = <>
        <Menu id="actions-menu"
            anchorEl={shareAnchor.current}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            getContentAnchorEl={null}
            onClose={handleShareClose}
            open={shareOpen}>
            <MenuItem onClick={()=>share('web3')}>
                <ListItemIcon style={{margin: 0}}>
                    <AccountTreeOutlinedIcon fontSize="small" style={{margin: 0}}/>
                </ListItemIcon>
                <Typography variant="caption" align="left">for Web3</Typography>
            </MenuItem>
            <MenuItem onClick={()=>share('web2')}>
                <ListItemIcon style={{margin: 0}}>
                    <LanguageOutlinedIcon fontSize="small" style={{margin: 0}}/>
                </ListItemIcon>
                <Typography variant="caption" align="left">for Web2</Typography>
            </MenuItem>
        </Menu>
    </>

    return (
        <>
            <div style={{ position: "relative" }}>
                <Backdrop className={styles.backdrop} open={loading}>
                    <CircularProgress color="primary" />
                </Backdrop>
                <Card elevation={8} className={styles.card}>
                    <CardHeader
                        avatar={<UserAvatar address={post.from} upperLoading={loading} setAlert={setAlert}/>}
                        action={((walletAddress === post.from) && (post.commentsCount === 0)) && postActions}
                        title={
                            <Link to={`/profile/${post.from}`}>
                                <Typography variant="subtitle1" style={{cursor:'pointer'}}>
                                {
                                    loading 
                                    ? 
                                        <Skeleton width="100%" height="100%"/> 
                                    : 
                                        (post.from === walletAddress) ? ((profile && profile.displayName) || identity) : name
                                }
                                </Typography>
                            </Link>
                        }
                        subheader={<Typography variant="subtitle2"> {loading ? <Skeleton width="100%" height="100%"/> : format(date) }</Typography>}
                    />
                    <CardContent>
                    {
                        edit
                        ?
                            loading ? <Skeleton width="100%" height="100%"/> : <RichTextField ref={inputRef} value={content}/>
                        : 
                            <Typography variant="body1" component="p">{ loading ? <Skeleton width="100%" height="100%"/> : (content !== EMPTY) && content }
                            </Typography>
                    }
                    </CardContent>
                    { loading
                        ? 
                            <Skeleton variant="rect" width="100%" height="300px"></Skeleton> 
                        :
                            <>
                            {
                                edit
                                    ?
                                        <CardMediaSelector ref={mediaRef} selectedMedia={media} setAlert={setAlert}/>
                                    :
                                        media && <CardMediaContainer media={media}/>
                            }
                            </>
                    }
                    <CardActions disableSpacing>
                        {
                            (countersLoading || loading)
                                ?   <Skeleton variant="rect" width="100%" height="16"/>
                                :   <>
                                    <div className={gutterStyles.parent}>
                                        {
                                            likeLoading
                                            ?
                                            <button type={'button'} className={iconLabelStyles.link}>
                                                <CircularProgressWithIcon 
                                                    icon={<FavoriteBorderOutlinedIcon style={{ color: '#f00', fontSize: '14px', marginLeft: '8px', marginBottom: '8px' }}/>} 
                                                    props={{size : 16, style: {color: '#f00', marginLeft: '8px', marginBottom: '8px', }  }} />
                                            </button>                                                    
                                            :
                                            <button type={'button'} className={iconLabelStyles.link} onClick={toggleLike}>
                                                { like? 
                                                    <FavoriteOutlinedIcon className={iconLabelStyles.icon} style={{fontColor: '#ff000'}} color="secondary"/> : 
                                                    <FavoriteBorderOutlinedIcon className={iconLabelStyles.icon}/>
                                                }
                                                {likes}
                                            </button>
                                        }
                                        <button type={'button'} className={iconLabelStyles.link} onClick={()=>(canExpand)? expandButton && expandButton.current && expandButton.current.click(): window.open(`/post/${post.id}`, "_blank")}>
                                            <ModeCommentOutlinedIcon className={iconLabelStyles.icon} />
                                            {comments}
                                        </button>
                                        <span className={iconLabelStyles.link} aria-label="share" aria-haspopup="true" ref={shareAnchor} onClick={handleShareOpen}>
                                            <ShareOutlinedIcon className={iconLabelStyles.icon} />
                                        </span>
                                    </div>
                                    { shareActions }                                
                                    </>
                        }                        
                        {   canExpand && 
                            <IconButton
                                className={clsx(styles.expand, { [styles.expandOpen]: expanded, })}
                                onClick={handleExpandClick}
                                aria-expanded={expanded}
                                aria-label="expand"
                                ref={expandButton}
                                >
                                <ExpandMoreIcon />
                            </IconButton>
                        }
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit style={{ width:'100%', height: '100%'}}>
                        <CommentList postId={post.id} setUpperLoading={setLoading} setAlert={setAlert} reloadCount={reloadCount}/>
                    </Collapse>
                </Card>
                {dialog}
            </div>
        </>
    )
}

export default PostCard