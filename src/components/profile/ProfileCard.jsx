import defaultBanner from '../../assets/header-pic.jpg';

import { useEffect, useState, useRef } from "react";
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Backdrop from '@material-ui/core/Backdrop';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Skeleton from '@material-ui/lab/Skeleton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RoomOutlinedIcon from '@material-ui/icons/RoomOutlined';
import PanoramaOutlinedIcon from '@material-ui/icons/PanoramaOutlined';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import BlockOutlinedIcon from '@material-ui/icons/BlockOutlined';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import TabPanel from '../tabs/TabPanel';
import Feed from '../feed/Feed';
import UserAvatar from '../avatar/UserAvatar';
import UserList from '../user/UserList';

import point from "../../services/PointSDK";
import UserManager from "../../services/UserManager";

import EventConstants from "../../events";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';
               
const useStyles = makeStyles((theme) => ({
  backdrop: {
    position: "absolute",
    zIndex: theme.zIndex.drawer - 1,
    opacity: 0.9    
  },
  actionDial: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),    
  },
  actionButton: {
    backgroundColor: "#000000",
    '&:hover': {
      backgroundColor: "#000000",
      opacity: 0.3
    },
    opacity: 0.4
  },
  userBadge: {
    marginLeft: theme.spacing(1),
    backgroundColor: "#000000",
    opacity: 0.4
  },
  actionIcon: {
    color: "#ffffff",
  },
  banner: {
    [theme.breakpoints.down('xs')]: {
      height: 150
    },
    [theme.breakpoints.up('sm')]: {
      height: 180
    },
    [theme.breakpoints.up('md')]: {
      height: 216
    },
    [theme.breakpoints.up('lg')]: {
      height: 270
    },
    [theme.breakpoints.up('xl')]: {
      height: 300 
    }
  },
  card: {
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(1),
      width: 250
    },
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(1),
      width: 450
    },
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(2),
      width: 720
    },
    [theme.breakpoints.up('lg')]: {
      margin: theme.spacing(2),
      width: 960
    },
    [theme.breakpoints.up('xl')]: {
      margin: theme.spacing(2),
      width: 1000 
    }
  },
  avatar: {
    [theme.breakpoints.down('xs')]: {
      width: "96px",
      height: "96px",
      fontSize: "50px",
    },
    [theme.breakpoints.up('sm')]: {
      width: "118px",
      height: "118px",
      fontSize: "56px",
    },
    [theme.breakpoints.up('md')]: {
      width: "141px",
      height: "141px",
      fontSize: "67px",
    },
    [theme.breakpoints.up('lg')]: {
      width: "187px",
      height: "187px",
      fontSize: "87px",
    },
    [theme.breakpoints.up('xl')]: {
      width: "195px",
      height: "195px",
      fontSize: "95px",
    }
  },
  fabAvatar: {
    margin: 0,
    bottom: 0,
    right: 0,
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      width: "100px",
      height: "100px",
      left: "31%",  
      top: -40,
      marginBottom: -40
    },
    [theme.breakpoints.up('sm')]: {
      width: "120px",
      height: "120px",
      left: "36%",  
      top: -50,
      marginBottom: -50
    },
    [theme.breakpoints.up('md')]: {
      width: "144px",
      height: "144px",
      left: "40%",
      top: -60,
      marginBottom: -60
    },
    [theme.breakpoints.up('lg')]: {
      width: "192px",
      height: "192px",
      left: "40%",
      top: -75,
      marginBottom: -75

    },
    [theme.breakpoints.up('xl')]: {
      width: "200px",
      height: "200px",
      left: "40%",
      top: -85,
      marginBottom: -85
    }
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    margin: 0,
    textAlign: "center"
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: '1px',
    textAlign: "center"
  },
  statBox: {
    justifyContent: "center",
    justify: "center",
    alignItems:"center"
  },
  followBox: {
    display: 'flex',
    justifyContent: "end",
    justify: "end",
    alignItems:"end",
    margin: theme.spacing(2)
  }
}));

const ProfileCard = ({ address, identity, setUpperLoading, setAlert }) => {

  const styles = useStyles();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('sm'));

  const [color, setColor] = useState(`#${address.slice(-6)}`);
  const [name, setName] = useState(EMPTY);
  const [location, setLocation] = useState(EMPTY);
  const [about, setAbout] = useState(EMPTY);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const [avatar, setAvatar] = useState(EMPTY);
  const [banner, setBanner] = useState(EMPTY);
  const [profile, setProfile] = useState();

  const [isOwner, setIsOwner] = useState(false);
  const [isFollowed, setFollowed] = useState(false);  
  const [isFollower, setFollower] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [imBlocked, setImBlocked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const uploadAvatarRef = useRef(null);
  const uploadBannerRef = useRef(null);
  const displayNameRef = useRef();
  const displayLocationRef = useRef();
  const displayAboutRef = useRef();
  const actionsAnchor = useRef();

  const { walletAddress, setUserProfile, events } = useAppContext();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    renderProfile(profile);
  }, [profile]);

  useEffect(() => {
    getEvents();
    return () => {
      events.listeners["PointSocial"]["FollowEvent"].removeListener("FollowEvent", handleEvents, { type: 'profile', id: address});
      events.unsubscribe("PointSocial", "FollowEvent");
    };
  }, []);

  const getEvents = async() => {
    try {
      (await events.subscribe("PointSocial", "FollowEvent")).on("FollowEvent", handleEvents, { type: 'profile', id: address});
    }
    catch(error) {
      console.log(error.message);
    }
  }

  const handleEvents = async(event) => {
    if (event && (((event.from.toLowerCase() === walletAddress.toLowerCase()) &&
       (event.to.toLowerCase() === address.toLowerCase())) ||
       ((event.to.toLowerCase() === walletAddress.toLowerCase()) &&
       (event.from.toLowerCase() === address.toLowerCase())))) {  
          switch(event.action) {
            case EventConstants.FollowAction.Follow:
            case EventConstants.FollowAction.UnFollow:
            case EventConstants.FollowAction.Block:
            case EventConstants.FollowAction.UnBlock:
              await loadFollowStatus();            
            break;
            default:
            break;
          }
    }
  }

  const renderProfile = async (profile) => {
    if (profile) {
      try {
        setLoading(true);
        const name = (profile.displayName === EMPTY)? identity : await point.getString(profile.displayName, {  encoding: 'utf-8' });
        setName(name);
        const location = (profile.displayLocation === EMPTY)? "Point Network" : await point.getString(profile.displayLocation, {  encoding: 'utf-8' });
        setLocation(location);
        const about = (profile.displayLocation === EMPTY)? "Hey I'm using Point Social!" : await point.getString(profile.displayAbout, {  encoding: 'utf-8' });
        setAbout(about);        
        setAvatar(`/_storage/${profile.avatar}`);
        setBanner((profile.banner=== EMPTY)?defaultBanner:`/_storage/${profile.banner}`);
        await loadFollowStatus();
        setLoading(false);
      }
      catch(error) {
        setAlert(error.message);
      }
    }
  }

  const loadFollowStatus = async () => {
    setFollowers(await UserManager.followersCount(address) || 0);
    setFollowing(await UserManager.followingCount(address) || 0);

    try {
      setFollowersList(await UserManager.followersList(address));
    }
    catch(error) {
      setFollowersList([]);
    }

    try {
      setFollowingList(await UserManager.followingList(address));
    }
    catch(error) {
      setFollowingList([]);
    }

    const owner = address.toLowerCase() === walletAddress.toLowerCase();
    if (owner) {
      setIsOwner(true);
    }
    else {
      setFollowed(await UserManager.isFollowing(walletAddress, address));
      setFollower(await UserManager.isFollowing(address, walletAddress));
      setIsBlocked(await UserManager.isBlocked(walletAddress, address));
      setImBlocked(await UserManager.isBlocked(address, walletAddress));
    }
  }

  const loadProfile = async () => {
    try {
      const profile = await UserManager.getProfile(address);
      if (profile) {
        setProfile({
          displayName : profile[0],
          displayLocation : profile[1],
          displayAbout : profile[2],
          avatar: profile[3],
          banner: profile[4],
          followersCount: 0,
          followingCount: 0,
        });
      }
    }
    catch(error) {
      setAlert(error.message);
    }
  }

  const handleActionsOpen = () => {
    setActionsOpen(true);
  };

  const handleActionsClose = () => {
    setActionsOpen(false);
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
      case 'block':
      case 'unblock':
        toggleBlock();
      break;
    }

    setActionsOpen(false);
  
  };

  const handleAvatarUpload = ({ target }) => {
    const file = target.files[0]; 
    if (file && (file.size <= MAX_FILE_SIZE)) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(target.files[0]);
      fileReader.onload = (e) => {
          setAvatar(e.srcElement.result);
      };  
    }
    else if (file && (file.size > MAX_FILE_SIZE)) {
      setAlert("For now, Point Social only supports files up to 100 MB. Please select a smaller media file.");
    }
  }

  const handleBannerUpload = ({ target }) => {
    const file = target.files[0]; 
    if (file && (file.size <= MAX_FILE_SIZE)) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(target.files[0]);
      fileReader.onload = (e) => {
        setBanner(e.srcElement.result);
      };  
    }
    else if (file && (file.size > MAX_FILE_SIZE)) {
      setAlert("For now, Point Social only supports files up to 100 MB. Please select a smaller media file.");
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  }

  const cancelEdit = async () => {
    setEdit(false);
    renderProfile(profile);
  };

  const startEdit = async () => {
    setEdit(true);
  };

  const saveEdit = async () => {
    setLoading(true);

    const newProfile = { ...profile };

    if (displayNameRef.current && 
        displayNameRef.current.value && 
        (displayNameRef.current.value.trim().length > 0) && 
        displayNameRef.current.value !== name) {
      const storageId = await point.putString(displayNameRef.current.value);
      newProfile.displayName = storageId;
    }

    if (displayLocationRef.current &&
        displayLocationRef.current.value && 
        (displayLocationRef.current.value.trim().length > 0) && 
        displayLocationRef.current.value !== location) {
      const storageId = await point.putString(displayLocationRef.current.value);
      newProfile.displayLocation = storageId;
    }

    if (displayAboutRef.current  && 
       displayAboutRef.current.value && 
       (displayAboutRef.current.value.trim().length > 0) && 
       displayAboutRef.current.value !== about) {
      const storageId = await point.putString(displayAboutRef.current.value);
      newProfile.displayAbout = storageId;
    }

    if (uploadAvatarRef.current && uploadAvatarRef.current.files[0]) {
      const formData = new FormData();
      formData.append("postfile", uploadAvatarRef.current.files[0]);
      const storageId = await point.postFile(formData);
      newProfile.avatar = storageId;
    }

    if (uploadBannerRef.current && uploadBannerRef.current.files[0]) {
      const formData = new FormData();
      formData.append("postfile", uploadBannerRef.current.files[0]);
      const storageId = await point.postFile(formData);
      newProfile.banner = storageId;
    }

    try {

      const updatedProfile = {
        displayName: newProfile.displayName || profile.displayName, 
        displayLocation: newProfile.displayLocation || profile.displayLocation,
        displayAbout: newProfile.displayAbout || profile.displayAbout,
        avatar: newProfile.avatar || profile.avatar,
        banner: newProfile.banner || profile.banner,
        followersCount: 0,
        followingCount: 0,
      };

      await UserManager.setProfile(
        updatedProfile.displayName,
        updatedProfile.displayLocation, 
        updatedProfile.displayAbout, 
        updatedProfile.avatar, 
        updatedProfile.banner
      );

      setProfile(updatedProfile);    
      setUserProfile({
        ...updatedProfile, 
        displayName: (displayNameRef.current && displayNameRef.current.value && displayNameRef.current.value.trim()) || name, 
        displayLocation: (displayLocationRef.current && displayLocationRef.current.value && displayLocationRef.current.value.trim()) || location,
        displayAbout: (displayAboutRef.current  && displayAboutRef.current.value && displayAboutRef.current.value.trim()) || about
      });

      setEdit(false);

      setAlert("Your profile was successfully updated!|success");
    }
    catch(error) {
      setAlert(error.message);
    }
    finally {
      setLoading(false);
    }
  };
 
  const toggleFollow = async () => {
    try {
      setLoading(true);
      if (isFollowed) {
        await UserManager.unfollowUser(address);
        setFollowed(false);
        setAlert(`You're no longer following to ${name}|success`);
      }
      else {
        await UserManager.followUser(address);
        setFollowed(true);
        setAlert(`Now you're following ${name}|success`);
      }
    }
    catch(error) {
      setAlert(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const toggleBlock = async () => {
    try {
      setLoading(true);
      if (isBlocked) {
        await UserManager.unblockUser(address);
        setIsBlocked(false);
        setAlert(`You unblocked all activity from ${name}|success`);
      }
      else {
        await UserManager.blockUser(address);
        setIsBlocked(true);
        setAlert(`You blocked all activity from ${name}|success`);
      }
    }
    catch(error) {
      setAlert(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const bannerContent = 
  <Grid container spacing={0} style={{ height: '100%'}}>
    <Grid item xs={12}>
      <Grid container justifyContent="flex-end" spacing={0} alignContent="flex-start" style={{ height:'100%'}}>
        <Box style={{display:'flex', width:'100%', alignItems: 'center'}}>
          <Chip size="small" className={styles.userBadge}
              label={
                <Typography 
                  variant="caption" 
                  align="left" 
                  className={styles.actionIcon}>@{identity} { !sm && `• ${address}` }
                </Typography>
              }/>
          {
            <Box style={{display:'flex', justifyContent:"right", width:'100%'}}>
              <IconButton aria-label="actions" 
                          aria-controls="actions-menu" 
                          aria-haspopup="true" 
                          ref={actionsAnchor}
                          onClick={handleActionsOpen}
                          className={styles.actionButton}
                          color="secondary">
                <MoreVertIcon className={styles.actionIcon}/>
              </IconButton>
              <Menu id="actions-menu"
                    anchorEl={actionsAnchor.current}
                    getContentAnchorEl={null}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    onClose={handleActionsClose}
                    open={actionsOpen}>
                {!isOwner && isBlocked &&
                  <MenuItem onClick={(event) => handleAction('unblock')}>
                    <ListItemIcon style={{margin: 0}}>
                      <LockOpenOutlinedIcon fontSize="small" style={{margin: 0}}/>
                    </ListItemIcon>
                    <Typography variant="caption" align="left">Unblock</Typography>
                  </MenuItem>
                }
                {!isOwner && !isBlocked &&
                  <MenuItem onClick={(event) => handleAction('block')}>
                    <ListItemIcon style={{margin: 0}}>
                      <BlockOutlinedIcon fontSize="small" style={{margin: 0}}/>
                    </ListItemIcon>
                    <Typography variant="caption" align="left">Block</Typography>
                  </MenuItem>
                }
                {!edit && isOwner &&
                  <MenuItem onClick={(event) => handleAction('edit')}>
                    <ListItemIcon style={{margin: 0}}>
                      <EditOutlinedIcon fontSize="small" style={{margin: 0}}/>
                    </ListItemIcon>
                    <Typography variant="caption" align="left">Edit</Typography>
                  </MenuItem>
                }
                {edit && isOwner &&
                  <MenuItem onClick={(event) => handleAction('cancel')}>
                    <ListItemIcon style={{margin: 0}}>
                      <CancelOutlinedIcon fontSize="small" style={{margin: 0}}/>
                    </ListItemIcon>
                    <Typography variant="caption" align="left">Cancel</Typography>
                  </MenuItem>
                }
                {edit && isOwner &&
                  <MenuItem onClick={(event) => handleAction('save')}>
                    <ListItemIcon style={{margin: 0}}>
                      <SaveOutlinedIcon fontSize="small" style={{margin: 0}}/>
                    </ListItemIcon>
                    <Typography variant="caption" align="left">Save</Typography>
                  </MenuItem>
                }
              </Menu>
            </Box>
          }
        </Box>
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Grid container justifyContent="flex-end" spacing={0} alignContent="flex-end" style={{ height:'100%'}}>
        <Box style={{display:'flex', width:'100%', justifyContent:"right"}}>
          {edit && 
            <IconButton aria-label="change-banner" 
                        onClick={() => edit && uploadBannerRef.current && uploadBannerRef.current.click()} 
                        className={styles.actionButton}>
              <PanoramaOutlinedIcon className={styles.actionIcon}/>
            </IconButton>
          }
        </Box>
      </Grid>
    </Grid>
  </Grid>

  return (
    <>
      <div style={{ position: "relative" }}>
        <Backdrop className={styles.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Card elevation={8} className={styles.card}>
          { edit && <input ref={uploadBannerRef} accept="image/*" type="file" hidden onChange={handleBannerUpload} />}
          <Tooltip open={edit} title="Click to change" placement="bottom-end" arrow>
            <CardMedia component="div" alt="banner" className={styles.banner} image={banner} children={bannerContent}/>
          </Tooltip>
          <Tooltip open={edit} title="Click to change" arrow placement="top-end">
            <Fab aria-label="edit" className={styles.fabAvatar} onClick={() => edit && uploadAvatarRef.current && uploadAvatarRef.current.click()}>
              <UserAvatar address={address} src={avatar} link={false} setAlert={setAlert} props={{className: styles.avatar}}/>
            </Fab>
          </Tooltip>
          { !loading && !isOwner &&
            <Box className={styles.followBox}>
              {
                isBlocked?
                  <Chip color="secondary" clickable icon={isBlocked? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />} label={isBlocked? "Unblock" : "Block"} onClick={toggleBlock}/>
                :
                  imBlocked?
                      <Chip icon={<BlockOutlinedIcon />} label="Blocked you" color="secondary"/>
                    :
                      isFollower && <Chip icon={<CheckOutlinedIcon />} label="Follows you" color="primary"/> 
              }              
              <div style={{width:'100%'}}></div>
              { !(isBlocked || imBlocked) && <Chip color="secondary" clickable icon={isFollowed? <PersonAddDisabledIcon /> : <PersonAddIcon />} label={isFollowed? "Unfollow" : "Follow"} onClick={toggleFollow}/> }
            </Box>
          }
          { edit && <input ref={uploadAvatarRef} accept="image/*" type="file" hidden onChange={handleAvatarUpload} />}
          <CardContent>              
            <Grid container direction="column" justifyContent="space-between" alignItems="center">
              { edit? 
                  <TextField 
                    id="displayName"
                    placeholder="Your name"
                    inputProps={{minLength: 3,  maxLength: 30, style: { textAlign: 'center', fontSize: '32px' }}}
                    inputRef={displayNameRef}
                    defaultValue={name} /> 
                :
                  <Typography  gutterBottom variant="h4" component="h4">
                    {loading ? <Skeleton style={{ width: '100px' }}/> : name }
                  </Typography>          
              }
              { edit? 
                  <TextField 
                    id="displayLocation" 
                    placeholder="Your location"
                    inputProps={{ minLength: 3,  
                                  maxLength: 30, 
                                  style: { textAlign: 'center',  fontSize: '22px' }, 
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RoomOutlinedIcon size="small"/>
                        </InputAdornment>
                      )                                                
                    }}
                    inputRef={displayLocationRef}
                    defaultValue={location} /> 
                :
                <Typography gutterBottom variant="h6">
                  {loading ? <Skeleton style={{ width: '100px' }}/> : location }
                </Typography>
              }
              { edit? 
                  <TextField 
                    id="displayAbout"
                    placeholder="Tell us a bit about yourself..."
                    multiline
                    maxRows={4}
                    inputProps={{minLength: 3,  maxLength: 420, style: { textAlign: 'center',  fontSize: '14px' }}}
                    inputRef={displayAboutRef}
                    style={{ width:"100%"}}
                    defaultValue={about} /> 
                :
                <Typography gutterBottom variant="body2" component="p" style={{marginTop:"15px"}}>
                  {loading ? <Skeleton style={{ width: '100px' }}/> : about }
                </Typography>
              }
            </Grid>
          </CardContent>
          <Divider />
          {
          <Box display={'flex'}>
            <Box p={2} flex={'auto'} className={styles.statBox}>
              <p className={styles.statLabel}>Followers</p>
              <p className={styles.statValue}>                
                {loading ? <Skeleton style={{ width: '100px' }}/> : followers }
              </p>
            </Box>
            <Box p={2} flex={'auto'} style={{ justify: "center", alignItems:"center" }}>
              <p className={styles.statLabel}>Following</p>
              <p className={styles.statValue}>
                {loading ? <Skeleton style={{ width: '100px' }}/> : following }
              </p>
            </Box>
            </Box>}
          <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label="Posts" />
            <Tab label="Followers" disabled={!isFollowed && !isOwner}/>
            <Tab label="Following" disabled={!isFollowed && !isOwner}/>
            {/* Temporarily disabling until functionality is available
            <Tab label="Likes" disabled/>
            <Tab label="Comments" disabled/>*/}
          </Tabs>
          <TabPanel value={tabIndex} index={0} children={<Feed account={address}/>}/>
          <TabPanel value={tabIndex} index={1} children={<UserList users={followersList}/>}/>
          <TabPanel value={tabIndex} index={2} children={<UserList users={followingList}/>}/>
        </Card>
      </div>
    </>
  )
}

export default ProfileCard