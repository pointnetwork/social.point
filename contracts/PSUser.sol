// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "point-contract-manager/contracts/IIdentity.sol";

contract PSUser is Initializable, UUPSUpgradeable, OwnableUpgradeable {

    using EnumerableSet for EnumerableSet.AddressSet;

    address private _identityContractAddr;
    string private _identityHandle;

    struct Connections {
        EnumerableSet.AddressSet following;
        EnumerableSet.AddressSet followers;
        EnumerableSet.AddressSet blocked;
    }

    mapping(address => Connections) private _connectionsByUser;

    function initialize(
        address identityContractAddr,
        string calldata identityHandle
    ) public initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _identityContractAddr = identityContractAddr;
        _identityHandle = identityHandle;
    }

    function _authorizeUpgrade(address) internal view override {
        require(
            IIdentity(_identityContractAddr).isIdentityDeployer(
                _identityHandle,
                msg.sender
            ),
            "You are not a deployer of this identity"
        );
    }

    function followUser(address _user) public returns (bool) {
        return
            EnumerableSet.add(_connectionsByUser[msg.sender].following, _user)
            &&
            EnumerableSet.add(_connectionsByUser[_user].followers, msg.sender);
    }

    function unfollowUser(address _user) public returns (bool) { 
        return
            EnumerableSet.remove(_connectionsByUser[msg.sender].following, _user)
            &&
            EnumerableSet.remove(_connectionsByUser[_user].followers, msg.sender);
    }

    function isFollowing(address _owner, address _user) public view returns (bool) {   
        return EnumerableSet.contains(_connectionsByUser[_owner].following, _user);
    }

    function getFollowing(address _user) public view returns (address[] memory) {
        return EnumerableSet.values(_connectionsByUser[_user].following);
    }

    function getFollowers(address _user) public view returns (address[] memory) {        
        return EnumerableSet.values(_connectionsByUser[_user].followers);
    }

    function blockUser(address _user) public returns (bool) {
        return
            EnumerableSet.remove(_connectionsByUser[msg.sender].following, _user)
            &&
            EnumerableSet.remove(_connectionsByUser[_user].followers, msg.sender)
            &&
            EnumerableSet.add(_connectionsByUser[msg.sender].blocked, _user);
    }

    function unBlockUser(address _user) public returns (bool)  {
        return EnumerableSet.remove(_connectionsByUser[msg.sender].blocked, _user);
    }

    function isBlocked(address _owner, address _user) public view returns (bool) {        
        return EnumerableSet.contains(_connectionsByUser[_owner].blocked, _user);
    }
}