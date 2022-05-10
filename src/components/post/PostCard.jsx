import clsx from 'clsx';
import { useEffect, useState, useRef } from "react";
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { usePushingGutterStyles } from '@mui-treasury/styles/gutter/pushing';
import { useLabelIconStyles } from '@mui-treasury/styles/icon/label';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';

import { Link } from "wouter";

import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';

import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import HttpOutlinedIcon from '@material-ui/icons/HttpOutlined';

import { format } from "timeago.js";

import defaultBanner from '../../assets/header-pic.jpg';

import {Avatar, 
        Backdrop, 
        Card,
        CardActions, 
        CardContent,
        CardHeader,
        CardMedia,
        CircularProgress,
        Collapse,
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

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        position: "absolute",
        zIndex: theme.zIndex.drawer - 1,
        opacity: 0.9    
    },
    card: {
        minWidth: 250,
        maxWidth: 1000,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
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
}));


const PostCard = ({post, setUpperLoading, setAlert}) => {

    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [edit, setEdit] = useState(false);
  
    const styles = useStyles();
    const theme = useTheme();
    const sm = useMediaQuery(theme.breakpoints.down('sm'));

    const gutterStyles = usePushingGutterStyles({ space: 1, firstExcluded: false });
    const iconLabelStyles = useLabelIconStyles({ linked: true });
    
    const { walletAddress, profile } = useAppContext();

    const [name, setName] = useState();
    const [avatar, setAvatar] = useState(EMPTY);
    const [color, setColor] = useState(`#${post.from.slice(-6)}`);

    const [content, setContent] = useState();
    const [media, setMedia] = useState();
    const [date, setDate] = useState();
    const [likes, setLikes] = useState();

    const actionsAnchor = useRef();
    const shareAnchor = useRef();
    const expandButton = useRef();
    
    useEffect(() => {
        loadPost();
    }, []);


    const loadPost = async () => {

        if (post.from === walletAddress) {
            setName(profile.name);
            setAvatar(`/_storage/${profile.avatar}`);
        }
        else {
            try {
                const {data: profile} = await window.point.contract.call({contract: 'PointSocial', method: 'getProfile', params: [post.from]});
                const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: post.from});
                const {data: name} = (profile[0] === EMPTY)? {data:identity} : await window.point.storage.getString({ id: profile[0], encoding: 'utf-8' });
                setName(name);
                setAvatar(`/_storage/${profile[3]}`);
            }
            catch(error) {
                setAlert(error.message);
            }
        }

        try {
            const {data: contents} = (post.contents === EMPTY)? {data:EMPTY} : await window.point.storage.getString({ id: post.contents, encoding: 'utf-8' });
            const {data: image} = (post.image === EMPTY)? {data:EMPTY} : await window.point.storage.getString({ id: post.image, encoding: 'utf-8' });
            setContent(contents);
            setMedia(`/_storage/${image}`);
            setLikes(post.likesCount);
        }
        catch(error) {
            setAlert(error.message);
        }

        await new Promise((res,rej) => setTimeout(res, 5000));
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
            deletePost();
          break;
        }
        setActionsOpen(false);  
    };
    
    const deletePost = async () => {
        setEdit(false);
    };

    const cancelEdit = async () => {
        setEdit(false);
    };
    
    const startEdit = async () => {
        setEdit(true);
    };

    const saveEdit = async () => {
        setLoading(true);
    };
    
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
            <MenuItem onClick={(event) => handleAction('delete')}>
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
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            getContentAnchorEl={null}
            onClose={handleShareClose}
            open={shareOpen}>
            <MenuItem onClick={(event) => console.log("web 3")}>
                <ListItemIcon style={{margin: 0}}>
                    <AccountTreeOutlinedIcon fontSize="small" style={{margin: 0}}/>
                </ListItemIcon>
                <Typography variant="caption" align="left">Web3</Typography>
            </MenuItem>
            <MenuItem onClick={(event) => console.log("web 2")}>
                <ListItemIcon style={{margin: 0}}>
                    <HttpOutlinedIcon fontSize="small" style={{margin: 0}}/>
                </ListItemIcon>
                <Typography variant="caption" align="left">Web 2.0</Typography>
            </MenuItem>
        </Menu>
    </>

    return (
        <>
            <div style={{ position: "relative" }}>
                <Backdrop className={styles.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Card elevation={8} className={styles.card}>
                    <CardHeader
                        avatar={loading
                            ? <Skeleton variant="circle"><Avatar /></Skeleton>
                            : <Avatar aria-label="avatar" alt={name} src={avatar} className={styles.avatar}  style={{backgroundColor: color }}/>
                        }
                        action={postActions}
                        title={<Typography variant="subtitle1"> {loading ? <Skeleton /> : name }</Typography>}
                        subheader={<Typography variant="subtitle2"> {loading ? <Skeleton /> : format(date) }</Typography>}
                    />
                    <CardContent>
                        <Typography variant="body2" component="p">{ loading ? <Skeleton /> : (content !== EMPTY) && content }
                        </Typography>
                    </CardContent>
                    { loading? <Skeleton variant="rect"></Skeleton> : ((media !== EMPTY) && media) && <CardMedia className={styles.media} image={media} />}
                    <CardActions disableSpacing>
                        <div className={gutterStyles.parent}>
                            <button type={'button'} className={iconLabelStyles.link}>
                                <FavoriteBorderOutlinedIcon className={iconLabelStyles.icon} />{post.likesCount}
                            </button>
                            <span className={iconLabelStyles.link} onClick={ () => { expandButton && expandButton.current && expandButton.current.click()} }>
                                <ModeCommentOutlinedIcon className={iconLabelStyles.icon} />0
                            </span>
                            <span className={iconLabelStyles.link} aria-label="share" aria-haspopup="true" ref={shareAnchor} onClick={handleShareOpen}>
                                <ShareOutlinedIcon className={iconLabelStyles.icon} />
                            </span>
                        </div>
                        { shareActions }
                        <IconButton
                            className={clsx(styles.expand, { [styles.expandOpen]: expanded, })}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="expand"
                            ref={expandButton}
                            >
                            <ExpandMoreIcon />
                        </IconButton>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                        </CardContent>
                    </Collapse>
                </Card>
            </div>
        </>
    )
}

export default PostCard