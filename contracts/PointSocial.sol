// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "point-contract-manager/contracts/IIdentity.sol";

contract SocialStorage {

    using Counters for Counters.Counter;

    Counters.Counter internal _postIds;
    Counters.Counter internal _commentIds;
    Counters.Counter internal _likeIds;

    struct Post {
        uint256 id;
        address from;
        bytes32 contents;
        bytes32 image;
        uint256 createdAt;
        uint16 likesCount;
        uint16 commentsCount;
    }

    struct Comment {
        uint256 id;
        address from;
        bytes32 contents;
        uint256 createdAt;
    }

    struct Like {
        uint256 id;
        address from;
        uint256 createdAt;
    }

    struct Dislike {
        uint256 id;
        uint256 post;
        address from;
        uint256 createdAt;
        bool active;
    }

    struct Profile {
        bytes32 displayName;
        bytes32 displayLocation;
        bytes32 displayAbout;
        bytes32 avatar;
        bytes32 banner;
    }

    event StateChange(
        uint256 indexed id,
        address from,
        uint256 date,
        Component indexed component,
        Action indexed action
    );

    event ProfileChange(address indexed from, uint256 indexed date);

    event MultipliersChanged(
        address indexed from,
        uint256 timestamp,
        uint256 likesWeightMultiplier,
        uint256 dislikesWeightWultiplier,
        uint256 ageWeightMultiplier,
        uint256 initialWeight,
        uint256 followWeight
    );

    address internal _identityContractAddr;
    string internal _identityHandle;

    // posts
    uint256[] public postIds;
    mapping(address => uint256[]) public postIdsByOwner;
    mapping(uint256 => Post) public postById;

    // comments
    mapping(uint256 => uint256[]) public commentIdsByPost;
    mapping(uint256 => Comment) public commentById;
    mapping(address => uint256[]) public commentIdsByOwner;

    // likes
    mapping(uint256 => uint256[]) public likeIdsByPost;
    mapping(uint256 => Like) public likeById;

    address internal _migrator;
    mapping(address => Profile) public profileByOwner;
    mapping(uint256 => bool) public postIsFlagged;

    enum Action {
        Migrator,
        Create,
        Like,
        Comment,
        Edit,
        Delete,
        Dislike,
        Flag
    }

    enum Component {
        Contract,
        Feed,
        Post,
        Comment
    }

    // dislikes
    Counters.Counter internal _dislikeIds;
    mapping(uint256 => uint256[]) public dislikeIdsByPost;
    mapping(address => uint256[]) public dislikeIdsByUser;
    mapping(address => mapping(uint256 => uint256)) public dislikeIdByUserAndPost;
    mapping(uint256 => Dislike) public dislikeById;

    struct PostWithMetadata {
        uint256 id;
        address from;
        bytes32 contents;
        bytes32 image;
        uint256 createdAt;
        uint16 likesCount;
        uint16 commentsCount;
        uint256 dislikesCount;
        bool liked;
        bool disliked;
        int256 weight;
        bool flagged;
    }

    uint256 public likesWeightMultiplier;
    uint256 public dislikesWeightWultiplier;
    uint256 public ageWeightMultiplier;
    uint256 public weightThreshold;
    uint256 public initialWeight;
    uint256 public followWeight;

    //mapping(bytes32 => address) internal _contractExtensions;
    /*
     * Follow layout storage
     */
    using EnumerableSet for EnumerableSet.AddressSet;

    struct FollowConnections {
        EnumerableSet.AddressSet following;
        EnumerableSet.AddressSet followers;
        EnumerableSet.AddressSet blocked;
    }

    mapping(address => FollowConnections) internal _followConnectionsByUser;

    enum FollowAction {
        Follow,
        UnFollow,
        Block,
        UnBlock
    }

    event FollowEvent(
        address indexed from, 
        address indexed to, 
        FollowAction action);

}

contract PointSocial is Initializable, UUPSUpgradeable, OwnableUpgradeable, SocialStorage  {
    using Counters for Counters.Counter;

    modifier postExists(uint256 _postId) {
        require(postById[_postId].from != address(0), "ERROR_POST_DOES_NOT_EXISTS");
        _;
    }

    modifier onlyDeployer() {
        require(IIdentity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender),
            "ERROR_NOT_DEPLOYER"
        );
        _;
    }

    modifier isContract(address _contract) {
        uint size;
        assembly { size := extcodesize(_contract) }
        require(size > 0, "ERROR_NO_CONTRACT");
        _;
    }

    function initialize(
        address identityContractAddr,
        string calldata identityHandle
    ) external initializer onlyProxy {
        __Ownable_init();
        __UUPSUpgradeable_init();
        _identityContractAddr = identityContractAddr;
        _identityHandle = identityHandle;
    //    _contractExtensions["PSFollow"] = address(new PSFollow());
    }

    function _authorizeUpgrade(address) internal view override onlyDeployer {}

    function addMigrator(address migrator) external onlyOwner {
        require(_migrator == address(0), "Access Denied");
        _migrator = migrator;
        emit StateChange(
            0,
            msg.sender,
            block.timestamp,
            Component.Contract,
            Action.Migrator
        );
    }

    function isDeployer() external view returns (bool) {
        return
            IIdentity(_identityContractAddr).isIdentityDeployer(
                _identityHandle,
                msg.sender
            );
    }

    function setWeights(
        uint256 _likesWeightMultiplier,
        uint256 _dislikesWeightWultiplier,
        uint256 _ageWeightMultiplier,
        uint256 _weightThreshold,
        uint256 _initialWeight,
        uint256 _followWeight
    ) external onlyDeployer {
        likesWeightMultiplier = _likesWeightMultiplier;
        dislikesWeightWultiplier = _dislikesWeightWultiplier;
        ageWeightMultiplier = _ageWeightMultiplier;
        weightThreshold = _weightThreshold;
        initialWeight = _initialWeight;
        followWeight = _followWeight;

        emit MultipliersChanged(
            msg.sender,
            block.timestamp,
            likesWeightMultiplier,
            dislikesWeightWultiplier,
            ageWeightMultiplier,
            initialWeight,
            followWeight
        );
    }

    // Post data functions
    function addPost(bytes32 contents, bytes32 image) external {
        _postIds.increment();
        uint256 newPostId = _postIds.current();
        Post memory _post = Post(
            newPostId,
            msg.sender,
            contents,
            image,
            block.timestamp,
            0,
            0
        );
        postIds.push(newPostId);
        postById[newPostId] = _post;
        postIdsByOwner[msg.sender].push(newPostId);

        emit StateChange(
            newPostId,
            msg.sender,
            block.timestamp,
            Component.Feed,
            Action.Create
        );
    }

    function editPost(
        uint256 postId,
        bytes32 contents,
        bytes32 image
    ) external postExists(postId) {
        require(
            msg.sender == postById[postId].from,
            "ERROR_CANNOT_EDIT_OTHERS_POSTS"
        );

        postById[postId].contents = contents;
        postById[postId].image = image;

        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Edit
        );
    }

    function deletePost(uint256 postId) external postExists(postId) {
        require(
            msg.sender == postById[postId].from,
            "ERROR_CANNOT_DELETE_OTHERS_POSTS"
        );
        require(
            postById[postId].commentsCount == 0,
            "ERROR_CANNOT_DELETE_POST_WITH_COMMENTS"
        );

        delete postById[postId];

        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Delete
        );
    }

    function _inArray(uint256 _number, uint256[] memory _array)
        internal
        pure
        returns (bool)
    {
        uint256 length = _array.length;
        for (uint256 i = 0; i < length; ) {
            if (_array[i] == _number) {
                return true;
            }
            unchecked {
                i++;
            }
        }
        return false;
    }

    function flagPost(uint256 postId) external postExists(postId) onlyDeployer {
        postIsFlagged[postId] = !postIsFlagged[postId];
        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Flag
        );
    }

    function getAllPosts() external view returns (PostWithMetadata[] memory) {
        PostWithMetadata[] memory postsWithMetadata = new PostWithMetadata[](
            postIds.length
        );
        for (uint256 i = 0; i < postIds.length; i++) {
            postsWithMetadata[i] = _getPostWithMetadata(postIds[i]);
        }
        return postsWithMetadata;
    }

    /**
     * @notice Validate that a post must be shown or not
     * @dev Validate that a post must be shown or not
     * @param _post - Post to be validated with metadata
     * @param _postIdsToFilter - Already seen post ids
     * @param _newerThanTimestamp - newest post seen timestamp
     */
    function _validPostToBeShown(
        PostWithMetadata memory _post,
        uint256[] memory _postIdsToFilter,
        uint256 _newerThanTimestamp
    ) public view returns (bool) {
        // Conditions:
        // 1. CreatedAt must be different than 0
        // 2. Weight must be equal or higher than weightThreshold (if set)
        // 3. Post must not have been seen before (not include on post ids array)
        // 4. Must be newer than timestamp (if set)
        uint256 ageWeight = (block.timestamp - _post.createdAt) *
            ageWeightMultiplier;

        return
            _post.createdAt != 0 &&
            (weightThreshold == 0 ||
                (_post.weight + int256(ageWeight)) >=
                int256(weightThreshold)) &&
            !_inArray(_post.id, _postIdsToFilter) &&
            (_newerThanTimestamp == 0 ||
                _post.createdAt >= _newerThanTimestamp);
    }

    function _filterPosts(
        uint256[] memory _ids,
        uint256[] memory _idsToFilter,
        uint256 _maxQty,
        uint256 _newerThanTimestamp
    ) internal view returns (PostWithMetadata[] memory) {
        uint256 length = _ids.length;

        PostWithMetadata[] memory _filteredArray = new PostWithMetadata[](
            _maxQty
        );

        uint256 insertedLength = 0;
        for (uint256 i = length; i > 0; i--) {
            if (insertedLength >= _maxQty) {
                break;
            }

            PostWithMetadata memory _post = _getPostWithMetadata(_ids[i - 1]);
            bool _blocked = isBlocked(msg.sender, _post.from) || isBlocked(_post.from, msg.sender);

            if (!_blocked && _validPostToBeShown(_post, _idsToFilter, _newerThanTimestamp)) {
                _filteredArray[insertedLength] = _post;
                unchecked {
                    insertedLength++;
                }
            }
        }

        PostWithMetadata[] memory _toReturnArray = new PostWithMetadata[](
            insertedLength
        );

        for (uint256 j = 0; j < insertedLength; ) {
            _toReturnArray[j] = _filteredArray[j];
            unchecked {
                j++;
            }
        }

        return _toReturnArray;
    }

    function getAllPostsLength() external view returns (uint256) {
        uint256 length = 0;
        for (uint256 i = 0; i < postIds.length; i++) {
            if (postById[postIds[i]].createdAt > 0) {
                length++;
            }
        }
        return length;
    }

    function getPaginatedPosts(
        uint256 howMany,
        uint256[] memory _viewedPostsIds
    ) external view returns (PostWithMetadata[] memory) {
        return _filterPosts(postIds, _viewedPostsIds, howMany, 0);
    }

    function getNewPosts(
        uint256 _qty,
        uint256[] memory _viewedPostsIds,
        uint256 _newerThanTimestamp
    ) external view returns (PostWithMetadata[] memory) {
        return
            _filterPosts(postIds, _viewedPostsIds, _qty, _newerThanTimestamp);
    }

    function getAllPostsByOwner(address owner, uint256[] memory _viewedPostsIds)
        external
        view
        returns (PostWithMetadata[] memory)
    {
        if (isBlocked(msg.sender, owner) || isBlocked(owner, msg.sender)) {
            return new PostWithMetadata[](0);
        }
        else {
            return
                _filterPosts(
                    postIdsByOwner[owner],
                    _viewedPostsIds,
                    postIdsByOwner[owner].length,
                    0
                );
        }
    }

    function getAllPostsByOwnerLength(address owner)
        external
        view
        returns (uint256)
    {
        uint256 length = 0;
        for (uint256 i = 0; i < postIdsByOwner[owner].length; i++) {
            if (postById[postIdsByOwner[owner][i]].createdAt > 0) {
                length++;
            }
        }
        return length;
    }

    function _getPostWithMetadata(uint256 _postId)
        internal
        view
        returns (PostWithMetadata memory)
    {
        Post memory post = postById[_postId];
        uint256 dislikesCount = getPostDislikesQty(post.id);
        uint256 likesWeight = post.likesCount * likesWeightMultiplier;
        uint256 weightPunishment = (dislikesCount * dislikesWeightWultiplier) +
            (block.timestamp - post.createdAt) *
            ageWeightMultiplier;
        uint256 follow = isFollowing(msg.sender, post.from)? followWeight : 0;

        int256 weight = int256(initialWeight) +
            int256(likesWeight) -
            int256(weightPunishment) + int256(follow);

        PostWithMetadata memory postWithMetadata = PostWithMetadata(
            post.id,
            post.from,
            post.contents,
            post.image,
            post.createdAt,
            post.likesCount,
            post.commentsCount,
            dislikesCount,
            checkLikeToPost(post.id),
            checkDislikeToPost(_postId),
            weight,
            postIsFlagged[_postId]
        );
        return postWithMetadata;
    }

    function checkDislikeToPost(uint256 _postId) public view returns (bool) {
        uint256 dislikeId = dislikeIdByUserAndPost[msg.sender][_postId];
        bool disliked;
        if (dislikeId != 0) {
            Dislike memory dislike = dislikeById[dislikeId];
            disliked = dislike.active;
        }
        return disliked;
    }

    function getPaginatedPostsByOwner(
        address owner,
        uint256 howMany,
        uint256[] memory _viewedPostsIds
    ) external view returns (PostWithMetadata[] memory) {
        return _filterPosts(postIdsByOwner[owner], _viewedPostsIds, howMany, 0);
    }

    function getPostById(uint256 id)
        external
        view
        returns (PostWithMetadata memory)
    {
        return _getPostWithMetadata(id);
    }

    function addCommentToPost(uint256 postId, bytes32 contents) external {
        _commentIds.increment();
        uint256 newCommentId = _commentIds.current();
        Comment memory _comment = Comment(
            newCommentId,
            msg.sender,
            contents,
            block.timestamp
        );
        commentIdsByPost[postId].push(newCommentId);
        commentById[newCommentId] = _comment;
        commentIdsByOwner[msg.sender].push(newCommentId);
        postById[postId].commentsCount += 1;

        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Comment
        );
    }

    function editCommentForPost(uint256 commentId, bytes32 contents) external {
        Comment storage comment = commentById[commentId];

        require(comment.createdAt != 0, "ERROR_POST_DOES_NOT_EXISTS");
        require(
            msg.sender == comment.from,
            "ERROR_CANNOT_EDIT_OTHERS_COMMENTS"
        );
        comment.contents = contents;

        emit StateChange(
            commentId,
            msg.sender,
            block.timestamp,
            Component.Comment,
            Action.Edit
        );
    }

    function deleteCommentForPost(uint256 postId, uint256 commentId) external {
        require(
            commentById[commentId].createdAt != 0,
            "ERROR_COMMENT_DOES_NOT_EXISTS"
        );
        require(
            msg.sender == commentById[commentId].from,
            "ERROR_CANNOT_DELETE_OTHERS_COMMENTS"
        );

        postById[postId].commentsCount -= 1;
        delete commentById[commentId];

        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Comment
        );
        emit StateChange(
            commentId,
            msg.sender,
            block.timestamp,
            Component.Comment,
            Action.Delete
        );
    }

    function getAllCommentsForPost(uint256 postId)
        external
        view
        returns (Comment[] memory)
    {
        Comment[] memory _comments = new Comment[](
            commentIdsByPost[postId].length
        );
        for (uint256 i = 0; i < commentIdsByPost[postId].length; i++) {
            _comments[i] = commentById[commentIdsByPost[postId][i]];
        }
        return _comments;
    }

    function getCommentById(uint256 id) external view returns (Comment memory) {
        return commentById[id];
    }

    function _userAlreadyLikedPost(uint256 postId)
        internal
        view
        returns (bool)
    {
        uint256[] memory likeIdsOnPost = likeIdsByPost[postId];
        uint256 likeIdsOnPostLength = likeIdsOnPost.length;
        for (uint256 i = 0; i < likeIdsOnPostLength; i++) {
            if (likeById[likeIdsOnPost[i]].from == msg.sender) {
                return true;
            }
        }
        return false;
    }

    // Likes data functions
    function addLikeToPost(uint256 postId) public returns (bool) {
        // Get the post and likes for the postId from the mapping
        uint256[] storage _likeIdsOnPost = likeIdsByPost[postId];
        Post storage _post = postById[postId];

        uint256 _removeIndex;
        bool _isLiked = false;
        uint256 _removeId;

        // Check if msg.sender has already liked
        for (uint256 i = 0; i < _likeIdsOnPost.length; i++) {
            if (likeById[_likeIdsOnPost[i]].from == msg.sender) {
                _isLiked = true;
                _removeIndex = i;
                _removeId = _likeIdsOnPost[i];
                break;
            }
        }
        // If yes, then we remove that like and decrement the likesCount for the post
        if (_isLiked) {
            for (uint256 i = _removeIndex; i < _likeIdsOnPost.length - 1; i++) {
                _likeIdsOnPost[i] = _likeIdsOnPost[i + 1];
            }

            _likeIdsOnPost.pop();
            delete likeById[_removeId];
            _post.likesCount--;

            emit StateChange(
                postId,
                msg.sender,
                block.timestamp,
                Component.Post,
                Action.Like
            );
            return false;
        }

        // remove dislike
        _removeDislikeFromPost(postId);

        _likeIds.increment();
        uint256 newLikeId = _likeIds.current();
        Like memory _like = Like(newLikeId, msg.sender, block.timestamp);
        _likeIdsOnPost.push(newLikeId);
        likeById[newLikeId] = _like;
        postById[postId].likesCount += 1;

        emit StateChange(
            postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Like
        );
        return true;
    }

    /**
     * @notice Add a dislike to a post by id (or remove it)
     * @dev Add a dislike to a post by id (or remove it)
     * @param _postId - The post id
     */
    function addDislikeToPost(uint256 _postId) external postExists(_postId) {
        uint256 currentDislikeId = dislikeIdByUserAndPost[msg.sender][_postId];
        bool exists;
        if (currentDislikeId != 0) {
            Dislike memory dislike = dislikeById[currentDislikeId];
            exists = dislike.active;
        }
        if (exists) {
            _removeDislikeFromPost(_postId);
        } else {
            uint256 dislikeId = _dislikeIds.current();
            _dislikeIds.increment();

            Dislike memory dislike = Dislike(
                dislikeId,
                _postId,
                msg.sender,
                block.timestamp,
                true
            );
            dislikeById[dislikeId] = dislike;

            dislikeIdByUserAndPost[msg.sender][_postId] = dislikeId;

            uint256[] storage userDislikes = dislikeIdsByUser[msg.sender];
            userDislikes.push(dislikeId);

            uint256[] storage postDislikes = dislikeIdsByPost[_postId];
            postDislikes.push(dislikeId);

            // remove like if exists
            if (_userAlreadyLikedPost(_postId)) {
                addLikeToPost(_postId);
            }
        }

        emit StateChange(
            _postId,
            msg.sender,
            block.timestamp,
            Component.Post,
            Action.Dislike
        );
    }

    function _removeDislikeFromPost(uint256 _postId) internal {
        uint256 dislikeId = dislikeIdByUserAndPost[msg.sender][_postId];
        dislikeById[dislikeId].active = false;
    }

    /**
     * @notice Get a post's dislikes qty
     * @dev Get a post's dislikes qty
     * @param _postId - The post id
     * @return Post's dislikes qty
     */
    function getPostDislikesQty(uint256 _postId) public view returns (uint256) {
        Dislike[] memory postDislikes = _getPostDislikes(_postId);
        return postDislikes.length;
    }

    /**
     * @notice Get a post's dislikes array
     * @dev Get a post's dislikes array
     * @param _postId - The post id
     * @return Post's dislikes array
     */
    function _getPostDislikes(uint256 _postId)
        internal
        view
        returns (Dislike[] memory)
    {
        unchecked {
            uint256 postDislikesLength = dislikeIdsByPost[_postId].length;

            uint256 activeDislikesQty = 0;
            Dislike[] memory result = new Dislike[](postDislikesLength);
            for (uint256 i = 0; i < postDislikesLength; i++) {
                uint256 dislikeId = dislikeIdsByPost[_postId][i];
                Dislike memory dislike = dislikeById[dislikeId];
                if (dislike.active) {
                    result[i] = dislike;
                    activeDislikesQty++;
                }
            }

            Dislike[] memory trimmed = new Dislike[](activeDislikesQty);
            for (uint256 j = 0; j < activeDislikesQty; j++) {
                trimmed[j] = result[j];
            }
            return trimmed;
        }
    }

    function checkLikeToPost(uint256 postId) public view returns (bool) {
        uint256[] memory _likeIdsOnPost = likeIdsByPost[postId];

        for (uint256 i = 0; i < _likeIdsOnPost.length; i++) {
            if (likeById[_likeIdsOnPost[i]].from == msg.sender) {
                return true;
            }
        }

        return false;
    }

    /**********************************************************************
    * User Profile Functions
    ***********************************************************************/

    function setProfile(
        bytes32 name_,
        bytes32 location_,
        bytes32 about_,
        bytes32 avatar_,
        bytes32 banner_
    ) external {
        profileByOwner[msg.sender].displayName = name_;
        profileByOwner[msg.sender].displayLocation = location_;
        profileByOwner[msg.sender].displayAbout = about_;
        profileByOwner[msg.sender].avatar = avatar_;
        profileByOwner[msg.sender].banner = banner_;
        emit ProfileChange(msg.sender, block.timestamp);
    }

    function getProfile(address id_) public view returns (Profile memory) {
        return profileByOwner[id_];
    }

    /**********************************************************************
    * Data Migrator Functions - only callable by _migrator
    ***********************************************************************/

    function add(
        uint256 id,
        address author,
        bytes32 contents,
        bytes32 image,
        uint16 likesCount,
        uint256 createdAt
    ) external {
        require(msg.sender == _migrator, "Access Denied");

        Post memory _post = Post({
            id: id,
            from: author,
            contents: contents,
            image: image,
            createdAt: createdAt,
            likesCount: likesCount,
            commentsCount: 0
        });

        postIds.push(id);
        postIdsByOwner[_post.from].push(id);
        postById[_post.id] = _post;
        _postIds.increment();

        emit StateChange(
            id,
            author,
            block.timestamp,
            Component.Post,
            Action.Create
        );
    }

    function addComment(
        uint256 id,
        uint256 postId,
        address author,
        bytes32 contents,
        uint256 createdAt
    ) external {
        require(msg.sender == _migrator, "Access Denied");

        Comment memory _comment = Comment({
            id: id,
            from: author,
            contents: contents,
            createdAt: createdAt
        });

        commentIdsByPost[postId].push(id);
        commentById[_comment.id] = _comment;
        commentIdsByOwner[_comment.from].push(id);
        _commentIds.increment();
        postById[postId].commentsCount += 1;

        emit StateChange(
            postId,
            author,
            block.timestamp,
            Component.Comment,
            Action.Comment
        );
    }

    function addProfile(
        address user,
        bytes32 name,
        bytes32 location,
        bytes32 about,
        bytes32 avatar,
        bytes32 banner
    ) external {
        require(msg.sender == _migrator, "Access Denied");

        profileByOwner[user].displayName = name;
        profileByOwner[user].displayLocation = location;
        profileByOwner[user].displayAbout = about;
        profileByOwner[user].avatar = avatar;
        profileByOwner[user].banner = banner;

        emit ProfileChange(user, block.timestamp);
    }

    /**********************************************************************
    * Follow functions
    ***********************************************************************/

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

    function followUser(address _user) public notBlocked(_user) {
        EnumerableSet.add(_followConnectionsByUser[msg.sender].following, _user);
        EnumerableSet.add(_followConnectionsByUser[_user].followers, msg.sender);
        emit FollowEvent(msg.sender, _user, FollowAction.Follow);
    }

    function unfollowUser(address _user) public { 
        EnumerableSet.remove(_followConnectionsByUser[msg.sender].following, _user);
        EnumerableSet.remove(_followConnectionsByUser[_user].followers, msg.sender);
        emit FollowEvent(msg.sender, _user, FollowAction.UnFollow);
    }

    function isFollowing(address _owner, address _user) public view returns (bool) {   
        return EnumerableSet.contains(_followConnectionsByUser[_owner].following, _user);
    }

    function followingList(address _user) public onlyFollowers(_user) view returns (address[] memory) {
        return EnumerableSet.values(_followConnectionsByUser[_user].following);
    }

    function followingCount(address _user) public view returns (uint256) {
        return EnumerableSet.length(_followConnectionsByUser[_user].following);
    }

    function followersList(address _user) public onlyFollowers(_user) view returns (address[] memory) {        
        return EnumerableSet.values(_followConnectionsByUser[_user].followers);
    }

    function followersCount(address _user) public view returns (uint256) {        
        return EnumerableSet.length(_followConnectionsByUser[_user].followers);
    }

    function blockUser(address _user) public {
        EnumerableSet.remove(_followConnectionsByUser[msg.sender].following, _user);
        EnumerableSet.remove(_followConnectionsByUser[msg.sender].followers, _user);
        EnumerableSet.remove(_followConnectionsByUser[_user].following, msg.sender);
        EnumerableSet.remove(_followConnectionsByUser[_user].followers, msg.sender);
        EnumerableSet.add(_followConnectionsByUser[msg.sender].blocked, _user);
        emit FollowEvent(msg.sender, _user, FollowAction.Block);
    }

    function unBlockUser(address _user) public {
        EnumerableSet.remove(_followConnectionsByUser[msg.sender].blocked, _user);
        emit FollowEvent(msg.sender, _user, FollowAction.UnBlock);
    }

    function isBlocked(address _owner, address _user) public view returns (bool) {        
        return EnumerableSet.contains(_followConnectionsByUser[_owner].blocked, _user);
    }

    function blockList() public view returns (address[] memory) {
        return EnumerableSet.values(_followConnectionsByUser[msg.sender].blocked);
    }


}
