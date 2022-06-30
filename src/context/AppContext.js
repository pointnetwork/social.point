import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from "wouter";
import point from "../services/PointSDK";
import users from '../services/UserManager';

import EventManager from '../services/EventManager';

const events = new EventManager();

const defaultContext = {
  walletAddress: undefined,
  walletError: undefined,
  identity: undefined,
  profile: undefined,
  goHome: () => {},
  setUserProfile: () => {},
  events
};

const AppContext = createContext(defaultContext);

const EMPTY = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const useAppContext = () => useContext(AppContext);

export const ProvideAppContext = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState();
  const [identity, setIdentity] = useState();
  const [walletError, setWallerError] = useState();
  const [, setLocation] = useLocation();
  const [profile, setUserProfile] = useState();

  useEffect(() => {
    (async () => {
      try {
        const { address } = await point.getWalletAddress();
        const { identity } = await point.ownerToIdentity(address);
        const profile = await users.getProfile(address);
        const name = (profile[0] === EMPTY)? identity : await point.getString(profile[0], { encoding: 'utf-8'});
        const location = (profile[1] === EMPTY)? "Point Network" : await point.getString(profile[1], {encoding: 'utf-8'});
        const about = (profile[2] === EMPTY)? "Hey I'm using Point Social!" : await point.getString(profile[2], {encoding: 'utf-8'});
        setUserProfile({
          displayName : name,
          displayLocation : location, 
          displayAbout : about,
          avatar: profile[3],
          banner: profile[4],
          followersCount: 0,
          followingCount: 0,
        });
        setIdentity(identity);
        setWalletAddress(address);
      } catch (error) {
        console.log(error);
        setWallerError(error);
      }
    })()
  }, [])

  const goHome = useCallback(async () => {
    setLocation('/');
  }, []);


  const context = {
    walletAddress,
    walletError,
    identity,
    profile,
    setUserProfile,
    goHome,
    events
  }

  return <AppContext.Provider value={ context }>{ children }</AppContext.Provider>
}
