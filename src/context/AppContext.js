import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from "wouter";

const defaultContext = {
  walletAddress: undefined,
  walletError: undefined,
  identity: undefined,
  profile: undefined,
  goHome: () => {},
  setUserProfile: () => {},
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
        const {data: {address}} = await window.point.wallet.address();
        const {data: {identity}} = await window.point.identity.ownerToIdentity({owner: address});
        const {data: profile} = await window.point.contract.call({contract: 'PointSocial', method: 'getProfile', params: [address]});
        setIdentity(identity);
        const {data: name} = (profile[0] === EMPTY)? {data:identity} : await window.point.storage.getString({ id: profile[0], encoding: 'utf-8' });
        const {data: location} = (profile[1] === EMPTY)? {data:"Point Network"} : await window.point.storage.getString({ id: profile[1], encoding: 'utf-8' });
        const {data: about} = (profile[2] === EMPTY)? {data:"Hey I'm using Point Social!"} : await window.point.storage.getString({ id: profile[2], encoding: 'utf-8' });
        setUserProfile({
          displayName : name,
          displayLocation : location, 
          displayAbout : about,
          avatar: profile[3],
          banner: profile[4],
          followersCount: 0,
          followingCount: 0,
        });
        setWalletAddress(address);
      } catch (e) {
        setWallerError(e);
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
    goHome
  }

  return <AppContext.Provider value={ context }>{ children }</AppContext.Provider>
}
