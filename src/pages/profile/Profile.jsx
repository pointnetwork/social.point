import Appbar from "../../components/topbar/Appbar";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../context/AppContext';

import CircularProgress from '@material-ui/core/CircularProgress';
import CircularProgressWithIcon from "../../components/generic/CircularProgressWithIcon";

import Backdrop from '@material-ui/core/Backdrop';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';

import Typography from '@material-ui/core/Typography';

import ProfileCard from "../../components/profile/ProfileCard";

const EMPTY = '0x0000000000000000000000000000000000000000';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
    },
}));

const Profile = () => {
    const [match, params] = useRoute("/profile/:account");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");
    const [identity, setIdentity] = useState(undefined);
    const [address, setAddress] = useState(undefined);

    const { walletAddress } = useAppContext();

    const styles = useStyles();
  
    const handleAlert = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert("");
    };    
    
    const getAccount = async () => {
        setLoading(true);
        try {
          const isAddress = params.account.match(/0x[a-fA-F0-9]{40}/);
          let address = null;
          let identity = null;
    
          if (isAddress) {
            address = params.account;
            const result = await window.point.identity.ownerToIdentity({owner: address});
            if (result && result.data && result.data.identity) {
              identity = result.data.identity;
            }
          }
          else {
            identity =  params.account;
            const result = await window.point.identity.identityToOwner({identity: identity});
            if (result && result.data && result.data.owner && result.data.owner !== EMPTY) {
              address = result.data.owner;
            }
          }
    
          if (address && identity) {
            setAddress(address);
            setIdentity(identity);
          }
        }
        catch(error) {
          setAlert(error.message);
        }
        finally {
          setLoading(false);
        }
    };
    
    useEffect(() => {
        getAccount();
    }, []);

    return (
        <>
            { walletAddress && <Appbar /> }
            <Backdrop className={styles.backdrop} open={!walletAddress || loading}>
            {
                walletAddress? 
                <CircularProgress color="inherit" />:
                <CircularProgressWithIcon icon={<AccountBalanceWalletOutlinedIcon/>} props={{color : "inherit"}} />
            }
            </Backdrop>
            {walletAddress  && 
              <> { (address && identity)? 
                  <>
                      <Grid container spacing={10} direction="column" justifyContent="center" alignItems="center" style={{ minHeight: '80vh', overflow: 'auto', marginTop: "48px" }}>
                          <ProfileCard address={address} identity={identity} setUpperLoading={setLoading} setAlert={setAlert}/>
                      </Grid>
                  </>: 
                  <>
                      { !loading && 
                          <Box color="text.primary"  display="flex" justifyContent="center" alignItems="center" height="90vh">
                              <div>
                                  <SearchOutlinedIcon style={{ fontSize: 120 }} />
                                  <Typography>Profile not found</Typography>
                              </div>
                          </Box>
                      }                
                  </> 
              } </> 
            }
            <Snackbar open={!(alert === "")} autoHideDuration={6000} onClose={handleAlert}>
                <Alert onClose={handleAlert} severity={alert.split("|")[1]||"error"}>{ alert.split("|")[0] }</Alert>
            </Snackbar>
        </>
    );
}


export default Profile