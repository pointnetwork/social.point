import "./share.css";
import { AttachFileTwoTone } from "@material-ui/icons";
import { useRef, useState } from "react";
import profileImg from '../../assets/profile-pic.jpg';
import { useAppContext } from '../../context/AppContext';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Share({reloadPosts}) {
  const DEFAULT_BTN_LABEL = 'Share'
  const EMPTY_IMAGE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const EMPTY_TEXT = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const [selectedFile, setSelectedFile] = useState();
  const [contents, setContents] = useState('');
  const [btnLabel, setBtnLabel] = useState(DEFAULT_BTN_LABEL);
  const [alert, setAlert] = useState(false);
  const [btnEnabled, setBtnEnabled] = useState(false);
  const [shareError, setShareError] = useState(undefined);
  const { identity } = useAppContext();

  const fileInputRef = useRef()

  const onFileChange = event => {
    let fileToUpload = event.target.files[0];
    if(fileToUpload.type.startsWith('image') || fileToUpload.type.startsWith('video') ) {
      if (fileToUpload.size > 100 * 1024 * 1024){
        alert('Point Social only supports image and video until 100 MB. Please change to a smaller image or video file!')  
      }
      setSelectedFile(event.target.files[0]);
      setBtnEnabled(true);
    } else {
      alert('Point Social only supports image and video uploads for now. Please change to an image or video file!')
    }
  };

  const handleAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(false);
  };

  const onContentsChange = event => {
    let newContents = event.target.value;
    setContents(newContents)
    setBtnEnabled(newContents && newContents.length > 0)
  }

  const setSaving = (saving) => {
    setBtnEnabled(!saving);
    saving ? setBtnLabel('Saving...') : setBtnLabel(DEFAULT_BTN_LABEL);
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save the post content to the storage layer and keep the storage id
      let {data: storageId} = (contents && contents.trim().length > 0)? await window.point.storage.putString({data: contents}) : { data: EMPTY_TEXT }; 
      let imageId = EMPTY_IMAGE;
      if(selectedFile){
        const formData = new FormData()
        formData.append("postfile", selectedFile);
        const res = await window.point.storage.postFile(formData);
        imageId = res.data;
      }
      // Save the post contents storage id in the PoinSocial Smart Contract
      await window.point.contract.send({contract: 'PointSocial', method: 'addPost', params: [storageId, imageId]});
      await reloadPosts();
      setSaving(false);
      setContents('');
      setSelectedFile();
      fileInputRef.current.value = null
      setBtnEnabled(false);
    } catch (e) {
      console.error('Error sharing post: ', e.message);
      setSaving(false);
      setContents('');
      setSelectedFile();
      fileInputRef.current.value = null
      setBtnEnabled(false);
      setShareError(e);
      setAlert(true);
    }
  };

  return (
    <div className="share bg-white">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={profileImg}
            alt=""
          />
          <textarea
            id="contents"
            name="contents"
            placeholder={"What's in your mind " + identity + "?"}
            maxLength="300"
            rows="3"
            cols="50"
            className="shareInput"
            value={contents}
            onChange={onContentsChange}>
          </textarea>
        </div>
        <hr className="shareHr" />
        <form className="shareBottom" onSubmit={submitHandler}>
          <div className="shareOptions">
            <div className="shareOption">
              <AttachFileTwoTone htmlColor="grey" />
              <input
                type="file"
                name="fileupload"
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={onFileChange}
              />
            </div>
          </div>
          <button className="shareButton" type="submit" disabled={!btnEnabled}>
            {btnLabel}
          </button>
        </form>
      </div>
      <Snackbar open={alert} autoHideDuration={6000} onClose={handleAlert}>
        <Alert onClose={handleAlert} severity="error">
        Error sharing post: {shareError && shareError.message}. Did you deploy the contract sucessfully?
        </Alert>
      </Snackbar>
    </div>
  );
}
