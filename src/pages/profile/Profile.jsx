import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import profilePic from '../../assets/profile-pic.jpg';
import profileCoverImg from '../../assets/header-pic.jpg';
import { useRoute } from "wouter";
import { useEffect, useState } from "react";

import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Profile = () => {
  const [match, params] = useRoute("/profile/:account");
  const [identity, setIdentity] = useState(undefined);

  useEffect(() => {
    getIdentity();
  }, []);

  const getIdentity = async () => {
    try {
      const result = await window.point.identity.ownerToIdentity({owner: params.account});
      if (result && result.data && result.data.identity) {
        setIdentity(result.data.identity);
      }
    }
    catch(error) {
      console.log("Error");
    }
  };

  return (
    <> 
      <Topbar />
      { identity ?
        <div className="profile">
          <div className="profileRight">
            <div className="profileRightTop">
              <div className="profileCover">
                <img
                  className="profileCoverImg"
                  src={profileCoverImg}
                  alt=""
                />
                <img
                  className="profileUserImg"
                  src={profilePic}
                  alt=""
                />
              </div>
              <div className="profileInfo">
                <h4 className="profileInfoName">@{identity}</h4>
                <span className="profileInfoDesc">{params.account}</span>
              </div>
            </div>
            <div className="profileRightBottom">
              <Sidebar />
              <Feed account={params.account} />
              <Rightbar />
            </div>
          </div>
        </div> :
        <Alert severity="error">Invalid account or account does not exists</Alert>
      }
    </>
  );
}

export default Profile