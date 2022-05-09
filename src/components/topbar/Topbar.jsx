import "./topbar.css";
import { useAppContext } from '../../context/AppContext';
import { Link } from "wouter";
import pointlogo from '../../assets/pointlogowhite.png';

import Avatar from '@material-ui/core/Avatar';

export default function Topbar() {
  const { walletAddress } = useAppContext();
  const { identity } = useAppContext();
  const { profile } = useAppContext();

  return (
    <div className="topbarContainer">
      <div className="topbarLeft flex v-center">
          <a href="/">
            <img
              src={pointlogo}
              alt=""
              className="topbarImg" />
          </a>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span className="logo">Point Social</span>
          </Link>
      </div>
      <div className="topbarCenter">
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
        </div>
        <div className="topbarIcons">
          <div>
          </div>
        </div>
        <Link to={`/profile/${walletAddress}`}>
          { walletAddress && profile &&
            <Avatar alt={identity} src={profile && `/_storage/${profile.avatar}` } style={{backgroundColor: `#${walletAddress.slice(-6)}` }}/>
          }
        </Link>
      </div>
    </div>
  );
}
