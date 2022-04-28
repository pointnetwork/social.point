import "./comments.css";
import { useState, useEffect } from "react";
import { useAppContext } from '../../context/AppContext';
import Comment from './Comment'
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const Comments = ({ postId, commentsCount, setCommentsCount, reloadPostCounters }) => {
    const DEFAULT_BTN_LABEL = 'Comment'
    const [comments, setComments] = useState([])
    const [contents, setContents] = useState()
    const [btnLabel, setBtnLabel] = useState(DEFAULT_BTN_LABEL);
    const [btnEnabled, setBtnEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const { walletAddress } = useAppContext();
    const classes = useStyles();

    const onContentsChange = event => {
      let newContents = event.target.value;
      setContents(newContents)
      setBtnEnabled(newContents && newContents.trim().length > 0)
    }

    const setSaving = (saving) => {
      setBtnEnabled(!saving);
      saving ? setBtnLabel('Saving...') : setBtnLabel(DEFAULT_BTN_LABEL);
    }

    const getComments = async () => {
      setLoading(true);
      const comments = await fetchComments();
      setComments(comments);
      setLoading(false);
    }
    
    const reloadComments = async() => {
      setLoading(true);
      await new Promise((res, rej) => setTimeout(res, 1000));
      await reloadPostCounters();
      await getComments();
      setLoading(false);
    }

    useEffect(() => {
        getComments()
    }, [postId])

    const fetchComments = async () => {
        const response = await window.point.contract.call({contract: 'PointSocial', method: 'getAllCommentsForPost', params: [postId]});

        const comments = response.data.filter(r => (parseInt(r[3]) !== 0)).map(([id, from, contents, createdAt]) => (
            {id, from, contents, createdAt: createdAt*1000}
          )
        )

        const commentsContent = await Promise.all(comments.map(async (comment) => {
          const {data: contents} = await window.point.storage.getString({ id: comment.contents, encoding: 'utf-8' });
          const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: comment.from});
          comment.identity = identity;
          comment.contents = contents;
          return comment;
        }))

        return commentsContent;
    }

    const submitHandler = async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
          // Save the post content to the storage layer and keep the storage id
          let {data: storageId} = await window.point.storage.putString({data: contents});
          // Save the post contents storage id in the PoinSocial Smart Contract
          await window.point.contract.send({contract: 'PointSocial', method: 'addCommentToPost', params: [postId, storageId]});
          setSaving(false);
          // calling renderCommentsImmediate instead of fetching the comments due to issues with fetching content too soon from Arweave after posting.
          //renderCommentsImmediate(contents);
          reloadComments();
          setContents('');
          // await getComments();
      } catch (err) {
        setSaving(false);
        console.error('Error: ', err);
      }
    };

    const loadingBlock = <div className={classes.root}><CircularProgress/></div>;
    
    return (
      <div className="commentWrapper">
        {loading? loadingBlock:  
          [<form className="commentBottom" onSubmit={submitHandler}>
            <textarea
                id="contents"
                name="contents"
                placeholder={"Any comment?"}
                maxLength="300"
                rows="3"
                cols="50"              
                className="commentCorners"
                onChange={onContentsChange}
                value={contents}>
            </textarea>
            <button className="commentButton" type="submit" disabled={!btnEnabled}>
              {btnLabel}
            </button>
          </form>,
          <hr className="commentHr" />,
          (!loading && comments.length === 0) && 'No comments yet. Be the first!',
          comments.filter(c => c.createdAt > 0).map((comment) => ([ 
            <Comment key={postId+comment.id}
                     id={postId+comment.id}
                     postId={postId} 
                     comment={comment} 
                     reloadComments={reloadComments}/>,<hr className="commentHr"/> ])
          )]
        }
      </div>
    )
}

export default Comments