import Appbar from "../../components/topbar/Appbar";
import Footer from "../../components/footer/Footer";

import { useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import { Backdrop,
         CircularProgress,
         Snackbar,
         Container } from '@material-ui/core';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from '../../components/tabs/TabPanel';

import DiscoverFeed from '../../components/feed/DiscoverFeed';
import FollowFeed from '../../components/feed/FollowFeed';
import FreshFeed from '../../components/feed/FreshFeed';
import TopFeed from '../../components/feed/TopFeed';

import ExploreOutlinedIcon from '@material-ui/icons/ExploreOutlined';
import PersonPinCircleOutlinedIcon from '@material-ui/icons/PersonPinCircleOutlined';
import EcoOutlinedIcon from '@material-ui/icons/EcoOutlined';
import EmojiEventsOutlinedIcon from '@material-ui/icons/EmojiEventsOutlined';
         
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
        maxWidth: '900px',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
    },
    tab: {
        padding: 0, 
        margin: 0,
    },
    tabpanel: {
        padding: 0,
        padding: 0,
    }
}));

function a11yProps(index) {
    return {
      id: `scrollable-prevent-tab-${index}`,
      'aria-controls': `scrollable-prevent-tabpanel-${index}`,
    };
}

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState("");    
    const { walletAddress } = useAppContext();
    const [tabIndex, setTabIndex] = useState(0);

    const styles = useStyles();
  
    const handleAlert = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert("");
    };    

    const handleChange = (event, newIndex) => {
        setTabIndex(newIndex);
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
                        <Tabs value={tabIndex}
                              onChange={handleChange}
                              variant="fullWidth"
                              scrollButtons="off"
                              aria-label="feed-selector" className={styles.tab}>
                            <Tab icon={<ExploreOutlinedIcon />} aria-label="discover" {...a11yProps(0)} />
                            <Tab icon={<PersonPinCircleOutlinedIcon />} aria-label="following" {...a11yProps(1)}/>
                            <Tab icon={<EcoOutlinedIcon />}  aria-label="fresh"  {...a11yProps(2)} />
                            <Tab icon={<EmojiEventsOutlinedIcon />}  aria-label="top" {...a11yProps(3)}/>
                        </Tabs>
                        <ShareCard setAlert={setAlert} />
                        <TabPanel value={tabIndex} index={0} className={styles.tabpanel}>
                            <DiscoverFeed setAlert={setAlert} setUpperLoading={setLoading} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={1} className={styles.tabpanel}>
                            <FollowFeed setAlert={setAlert} setUpperLoading={setLoading} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={2} className={styles.tabpanel}>
                            <FreshFeed setAlert={setAlert} setUpperLoading={setLoading} canPost={true}/>
                        </TabPanel>
                        <TabPanel value={tabIndex} index={3} className={styles.tabpanel}>
                            <TopFeed setAlert={setAlert} setUpperLoading={setLoading} />
                        </TabPanel>
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