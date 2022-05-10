import Topbar from "../../components/topbar/Topbar";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { useAppContext } from '../../context/AppContext';

import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import Typography from '@material-ui/core/Typography';

import PostCard from '../../components/post/PostCard';

const EMPTY = '0x0000000000000000000000000000000000000000';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
    },
}));

const Post = () => {
    const [match, params] = useRoute("/post/:id");
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState("");
    const [post, setPost] = useState();
    
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
            const {data: post}  = await window.point.contract.call({contract: 'PointSocial', method: 'getPostById', params: [params.id]});
            if (post && (parseInt(post[4]) !== 0)) {
                setPost({
                    id: post[0],
                    from: post[1],
                    contents: post[2],
                    image: post[3],
                    createdAt: post[4],
                    likesCount: post[5],
                    commentsCount: post[6],
                })
                console.log(post);
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

    return (
        <>
            <Topbar />
            <Backdrop className={styles.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            { (post)? 
                <>
                    <Grid container spacing={0} direction="column" justifyContent="center" alignItems="center" style={{ minHeight: '80vh', overflow: 'auto', marginTop: "48px", marginBottom: "48px", marginLeft: "16px", marginRight: "16px" }}>
                        <PostCard post={post} setUpperLoading={setLoading} setAlert={setAlert}/>
                    </Grid>
                </>: 
                <>
                    { !loading && 
                        <Box color="text.primary"  display="flex" justifyContent="center" alignItems="center" height="90vh">
                            <div>
                                <SearchOutlinedIcon style={{ fontSize: 120 }} />
                                <Typography>Post not found</Typography>
                            </div>
                        </Box>
                    }                
                </> 
            }            
            <Snackbar open={!(alert === "")} autoHideDuration={6000} onClose={handleAlert}>
                <Alert onClose={handleAlert} severity="error">{ alert }</Alert>
            </Snackbar>
        </>
    );
}


export default Post