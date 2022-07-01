import Appbar from "../../components/topbar/Appbar";
import Footer from "../../components/footer/Footer";

import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import { Backdrop,
         CircularProgress,
         Snackbar,
         Container } from '@material-ui/core';


import CircularProgressWithIcon from "../../components/generic/CircularProgressWithIcon";
import ShareCard from "../../components/share/ShareCard";
import Feed from "../../components/feed/Feed";
import Alert from "../../components/generic/Alert";

import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';


const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        padding: 0, 
        margin: 0,
    },
    container: {
        padding: theme.spacing(2, 2),
        display: "flex",
        minHeight: "100%",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: '900px'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
    },
}));

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");    
    const { walletAddress } = useAppContext();

    const styles = useStyles();
  
    const handleAlert = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert("");
    };    
    
    return (
        <div className={styles.root}>
            <Backdrop className={styles.backdrop} open={!walletAddress || loading}>
            {
                walletAddress? 
                <CircularProgress color="inherit" />:
                <CircularProgressWithIcon icon={<AccountBalanceWalletOutlinedIcon />} props={{color : "inherit"}} />
            }
            </Backdrop>
            {
                walletAddress &&
                <>
                    <Appbar setAlert={setAlert} setLoading={setLoading}/>
                    <Container fixed={true} className={styles.container}>
                        <ShareCard setAlert={setAlert} />
                        <Feed setAlert={setAlert} setUpperLoading={setLoading} canPost={true}/>
                    </Container>
                    <Footer />
                </>
            }
            <Snackbar open={!(alert === "")} autoHideDuration={6000} onClose={handleAlert}>
                <Alert onClose={handleAlert} severity={alert.split("|")[1]||"error"}>{ alert.split("|")[0] }</Alert>
            </Snackbar>
        </div>
    );
}


export default Home