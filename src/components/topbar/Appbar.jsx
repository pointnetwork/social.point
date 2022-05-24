import { makeStyles } from '@material-ui/core/styles';
import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { useLocation } from "wouter";

import { AppBar, 
         Avatar,
         Button,
         Box,
         Dialog,
         DialogContent,
         DialogActions,
         IconButton,
         Menu,
         MenuItem,
         ListItemIcon,
         Toolbar,
         Typography,  
} from '@material-ui/core';

import MoreIcon from '@material-ui/icons/MoreVert';
import UserAvatar from '../avatar/UserAvatar';
import DialogTitle from '../generic/DialogTitle';
import ProfileCard from '../profile/ProfileCard';

import AddressDialog from '../generic/AddressDialog';

import { Link } from "wouter";

import pointlogo from '../../assets/pointlogowhite.png';

import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  appbar: {
    background: '#1c385b',
    backgroundColor: '#1c385b',
    flexGrow: 1, 
  },
  logo: {
    marginRight: '10px'
  }
}));

const Appbar = ({setAlert, setLoading, loading}) => {

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const [profile, showProfile] = useState(false);
  const [address, showAddress] = useState(false);

  const [, setLocation] = useLocation();

  const { walletAddress, identity } = useAppContext();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); setLocation(`/profile/${walletAddress}`) }}>
        <ListItemIcon>
          <AccountCircleOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); showAddress(true);}}>
        <ListItemIcon>
          <AccountBalanceWalletOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="inherit">My address</Typography>
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{vertical: 'bottom', horizontal: 'left'}}
      id={mobileMenuId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton aria-label="profile">
          <AccountCircleOutlinedIcon/>
        </IconButton>      
      </MenuItem>
    </Menu>
  );

  const renderProfileDialog = (
    <Dialog aria-labelledby="dialog-profile" open={profile} fullScreen>
      <DialogTitle id="dialog-profile-title" onClose={() => showProfile(false)}>
          Profile
      </DialogTitle>
      <DialogContent>
        <ProfileCard  address={walletAddress} identity={identity} setUpperLoading={setLoading} setAlert={setAlert}/>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <AppBar position="sticky" className={classes.appbar}>
        <Toolbar>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Avatar alt="point-logo" src={pointlogo} className={classes.logo}/>
          </Link>
          <Typography className={classes.title} variant="h5" noWrap>
            Point Social
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              edge="end"
              aria-label="account"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <UserAvatar address={walletAddress} upperLoading={loading} setAlert={setAlert} link={false} props={{ styles:classes.avatarSmall }}/>
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderProfileDialog}
      <AddressDialog  open={address} 
                      address={walletAddress} 
                      caption="My address" 
                      onClose={()=>showAddress(false)} 
                      setAlert={setAlert}>
      </AddressDialog>
    </>
  );
}

export default Appbar