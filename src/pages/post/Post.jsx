import Appbar from "../../components/topbar/Appbar";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { useAppContext } from '../../context/AppContext';
import { makeStyles } from '@material-ui/core/styles';

import PostManager from '../../services/PostManager';

import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import CircularProgressWithIcon from "../../components/generic/CircularProgressWithIcon";

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';

import Typography from '@material-ui/core/Typography';

import PostCard from '../../components/post/PostCard';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
    },
    container: {
        padding: theme.spacing(2, 2),
        display: "flex",
        minHeight: "90vh",
        flexDirection: "column",
        justifyContent: "center"        
    }
}));

const Post = () => {
    const [match, params] = useRoute("/post/:id");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [post, setPost] = useState();
    
    const { walletAddress } = useAppContext();

    const styles = useStyles();
  
    const handleAlert = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlert("");
    };   
    
    const getPost = async () => {
        try {
          const isPost = params.id.match(/^\d+$/);
          if (isPost) {
            const post = await PostManager.getPost(params.id);
            
            if (post && (parseInt(post[4]) !== 0)) {
                setPost({
                    id: post[0],
                    from: post[1],
                    contents: post[2],
                    image: post[3],
                    createdAt: parseInt(post[4])*1000,
                    likesCount: parseInt(post[5]),
                    commentsCount: parseInt(post[6]),
                })
            }
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
        getPost();
    }, []);

    const main = (post)?
    <Container fixed={false} className={styles.container}>
        <PostCard post={post} setUpperLoading={setLoading} setAlert={setAlert} startExpanded={true}/>
    </Container>
    : 
    <>
        { !loading && 
            <Box color="text.primary" display="flex" justifyContent="center" alignItems="center" height="90vh">
                <div>
                    <SearchOutlinedIcon style={{ fontSize: 120 }} />
                    <Typography>Post not found</Typography>
                </div>
            </Box>
        }                
    </>

    return (
        <div style={{ padding: 0, margin: 0}}>
            { walletAddress && <Appbar setAlert={setAlert} setLoading={setLoading}/> }
            <Backdrop className={styles.backdrop} open={loading || !walletAddress}>
                {
                    walletAddress? 
                    <CircularProgress color="inherit" />:
                    <CircularProgressWithIcon icon={<AccountBalanceWalletOutlinedIcon/>} props={{color : 'inherit'}} />
                }
            </Backdrop>
            {
                walletAddress && main
            }
            <Snackbar open={!(alert === "")} autoHideDuration={6000} onClose={handleAlert}>
                <Alert onClose={handleAlert} severity={alert.split("|")[1]||"error"}>{ alert.split("|")[0] }</Alert>
            </Snackbar>
        </div>
    );
}


export default Post