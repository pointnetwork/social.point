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

    modifier onlyMutuals (address _user) {
        require(isFollowing(msg.sender, _user), "ERROR_NOT_MUTUAL");
        require(isFollowing(_user, msg.sender), "ERROR_NOT_MUTUAL");
        _;
    }

    modifier onlyFollowers (address _user) {
        require((msg.sender == _user) || isFollowing(msg.sender, _user), "ERROR_NOT_FOLLOWING");
        _;
    }

    modifier notBlocked (address _user) {
        require(!isBlocked(msg.sender, _user), "ERROR_USER_BLOCKED");
        require(!isBlocked(_user, msg.sender), "ERROR_USER_BLOCKED");
        _;
    }

    modifier onlyDeployer {
        require(
            IIdentity(_identityContractAddr).isIdentityDeployer(
                _identityHandle,
                msg.sender
            ),
            "ERROR_NOT_DEPLOYER"
        );
        _;
    }

    enum FollowAction {
        Follow,
        UnFollow,
        Block,
        UnBlock
    }

    event FollowEvent(address indexed from, address indexed to, FollowAction action);

    function initialize(
        address identityContractAddr,
        string calldata identityHandle
    ) public initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _identityContractAddr = identityContractAddr;
        _identityHandle = identityHandle;
    }

    function _authorizeUpgrade(address) internal onlyDeployer view override {
    }

    function followUser(address _user) public notBlocked(_user) returns (bool) {
        bool result =
            EnumerableSet.add(_connectionsByUser[msg.sender].following, _user)
            &&
            EnumerableSet.add(_connectionsByUser[_user].followers, msg.sender);

        emit FollowEvent(msg.sender, _user, FollowAction.Follow);
        return result;
    }

    function unfollowUser(address _user) public returns (bool) { 
        bool result =
            EnumerableSet.remove(_connectionsByUser[msg.sender].following, _user)
            &&
            EnumerableSet.remove(_connectionsByUser[_user].followers, msg.sender);
        emit FollowEvent(msg.sender, _user, FollowAction.UnFollow);
        return result;
    }

    function isFollowing(address _owner, address _user) public view returns (bool) {   
        return EnumerableSet.contains(_connectionsByUser[_owner].following, _user);
    }

    function followingList(address _user) public onlyFollowers(_user) view returns (address[] memory) {
        return EnumerableSet.values(_connectionsByUser[_user].following);
    }

    function followingCount(address _user) public view returns (uint256) {
        return EnumerableSet.length(_connectionsByUser[_user].following);
    }

    function followersList(address _user) public onlyFollowers(_user) view returns (address[] memory) {        
        return EnumerableSet.values(_connectionsByUser[_user].followers);
    }

    function followersCount(address _user) public view returns (uint256) {        
        return EnumerableSet.length(_connectionsByUser[_user].followers);
    }

    function blockUser(address _user) public returns (bool) {
        EnumerableSet.remove(_connectionsByUser[msg.sender].following, _user);
        EnumerableSet.remove(_connectionsByUser[msg.sender].followers, _user);
        EnumerableSet.remove(_connectionsByUser[_user].following, msg.sender);
        EnumerableSet.remove(_connectionsByUser[_user].followers, msg.sender);
        bool result =
            EnumerableSet.add(_connectionsByUser[msg.sender].blocked, _user);
        emit FollowEvent(msg.sender, _user, FollowAction.Block);
        return result;
    }

    function unBlockUser(address _user) public returns (bool)  {
        bool result =
        EnumerableSet.remove(_connectionsByUser[msg.sender].blocked, _user);
        emit FollowEvent(msg.sender, _user, FollowAction.UnBlock);
        return result;
    }

    function isBlocked(address _owner, address _user) public view returns (bool) {        
        return EnumerableSet.contains(_connectionsByUser[_owner].blocked, _user);
    }

    function blockList() public view returns (address[] memory) {
        return EnumerableSet.values(_connectionsByUser[msg.sender].blocked);
    }

}