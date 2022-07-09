// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "point-contract-manager/contracts/IIdentity.sol";

contract PointSocial is Initializable, UUPSUpgradeable, OwnableUpgradeable {
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

    address private _identityContractAddr;
    string private _identityHandle;

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

    address private _migrator;
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
    mapping(address => mapping(uint256 => uint256))
        public dislikeIdByUserAndPost;
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
    }

    modifier postExists(uint256 _postId) {
        require(postById[_postId].from != address(0), "Post does not exist");
        _;
    }

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

    function addMigrator(address migrator) public onlyOwner {
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

    function isDeployer() public view returns (bool) {
        return IIdentity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender);
    }

    // Post data functions
    function addPost(bytes32 contents, bytes32 image) public {
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
    ) public {
        require(postById[postId].createdAt != 0, "ERROR_POST_DOES_NOT_EXISTS");
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

    function deletePost(uint256 postId) public {
        require(postById[postId].createdAt != 0, "ERROR_POST_DOES_NOT_EXISTS");
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

    function flagPost(uint256 postId) public {
        require(IIdentity(_identityContractAddr).isIdentityDeployer(_identityHandle, msg.sender), 
            "ERROR_PERMISSION_DENIED");
        require(postById[postId].createdAt != 0, "ERROR_POST_DOES_NOT_EXISTS");

        postIsFlagged[postId] = !postIsFlagged[postId];

        emit StateChange(postId, msg.sender, block.timestamp, Component.Post, Action.Flag);
    }

    function getAllPosts() public view returns (PostWithMetadata[] memory) {
        PostWithMetadata[] memory postsWithMetadata = new PostWithMetadata[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            postsWithMetadata[i] = _getPostWithMetadata(postIds[i]);
        }
        return postsWithMetadata;
    }

    function getAllPostsLength() public view returns (uint256) {
        uint256 length = 0;
        for (uint256 i = 0; i < postIds.length; i++) {
            if (postById[postIds[i]].createdAt > 0) {
                length++;
            }
        }
        return length;
    }

    function getPaginatedPosts(uint256 cursor, uint256 howMany)
        public
        view
        returns (PostWithMetadata[] memory)
    {
        uint256 length = howMany;
        if (length > postIds.length - cursor) {
            length = postIds.length - cursor;
        }

        PostWithMetadata[] memory postsWithMetadata = new PostWithMetadata[](length);
        for (uint256 i = length; i > 0; i--) {
            postsWithMetadata[length - i] = _getPostWithMetadata(postIds[postIds.length - cursor - i]);
        }
        return postsWithMetadata;
    }

    function getAllPostsByOwner(address owner)
        public
        view
        returns (PostWithMetadata[] memory)
    {
        PostWithMetadata[] memory postsWithMetadata = new PostWithMetadata[](postIdsByOwner[owner].length);
        for (uint256 i = 0; i < postIdsByOwner[owner].length; i++) {
            postsWithMetadata[i] = _getPostWithMetadata(postIdsByOwner[owner][i]);
        }
        return postsWithMetadata;
    }

    function getAllPostsByOwnerLength(address owner)
        public
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

    function _getPostWithMetadata(uint256 _postId) internal view returns (PostWithMetadata memory) {
        Post memory post = postById[_postId];
        PostWithMetadata memory postWithMetadata = PostWithMetadata(
            post.id,
            post.from,
            post.contents,
            post.image,
            post.createdAt,
            post.likesCount,
            post.commentsCount,
            getPostDislikesQty(post.id),
            checkLikeToPost(post.id),
            checkDislikeToPost(_postId)
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
        uint256 cursor,
        uint256 howMany
    ) public view returns (PostWithMetadata[] memory) {
        uint256 _ownerPostLength = postIdsByOwner[owner].length;

        uint256 length = howMany;
        if (length > _ownerPostLength - cursor) {
            length = _ownerPostLength - cursor;
        }

        PostWithMetadata[] memory postsWithMetadata = new PostWithMetadata[](length);
        for (uint256 i = length; i > 0; i--) {
            postsWithMetadata[length - i] = _getPostWithMetadata(postIdsByOwner[owner][_ownerPostLength - cursor - i]);
        }
        return postsWithMetadata;
    }

    function getPostById(uint256 id) public view returns (PostWithMetadata memory) {
        return _getPostWithMetadata(id);
    }

    // Example: 1,"0x0000000000000000000000000000000000000000000068692066726f6d20706e"
    function addCommentToPost(uint256 postId, bytes32 contents) public {
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

    function editCommentForPost(uint256 commentId, bytes32 contents) public {
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

    function deleteCommentForPost(uint256 postId, uint256 commentId) public {
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
        public
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

    function getCommentById(uint256 id) public view returns (Comment memory) {
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
    function getPostDislikesQty(uint256 _postId)
        public
        view
        returns (uint256)
    {
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

    function setProfile(
        bytes32 name_,
        bytes32 location_,
        bytes32 about_,
        bytes32 avatar_,
        bytes32 banner_
    ) public {
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

    // Data Migrator Functions - only callable by _migrator

    function add(
        uint256 id,
        address author,
        bytes32 contents,
        bytes32 image,
        uint16 likesCount,
        uint256 createdAt
    ) public {
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
    ) public {
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
    ) public {
        require(msg.sender == _migrator, "Access Denied");

        profileByOwner[user].displayName = name;
        profileByOwner[user].displayLocation = location;
        profileByOwner[user].displayAbout = about;
        profileByOwner[user].avatar = avatar;
        profileByOwner[user].banner = banner;

        emit ProfileChange(user, block.timestamp);
    }
}
