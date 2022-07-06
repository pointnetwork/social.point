const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

describe('PointSocial contract', function () {
  let pointSocial;
  let identityContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;
  let handle = 'social';
  let postContent = '0x9d6b0f937680809a01639ad1ae4770241c7c8a0ded490d2f023669f18c6d744b';
  let postimage = '0x5f04837d78fa7a656419f98d73fc1ddaac1bfdfca9a244a2ee128737a186da6e';

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    const identityFactory = await ethers.getContractFactory('Identity');
    identityContract = await upgrades.deployProxy(identityFactory, [], { kind: 'uups' });
    await identityContract.deployed();
    const factory = await ethers.getContractFactory('PointSocial');
    pointSocial = await upgrades.deployProxy(factory, [identityContract.address, handle], {
      kind: 'uups',
    });
    await pointSocial.deployed();
  });

  describe('Testing deployment functions', function () {
    it('Should upgrade the proxy by a deployer', async function () {
      await identityContract.setDevMode(true);
      await identityContract.register(
        handle,
        owner.address,
        '0xed17268897bbcb67127ed550cee2068a15fdb6f69097eebeb6e2ace46305d1ce',
        '0xe1e032c91d4c8fe6bab1f198871dbafb8842f073acff8ee9b822f748b180d7eb'
      );
      await identityContract.addIdentityDeployer(handle, addr1.address);
      const factory = await ethers.getContractFactory('PointSocial');
      let socialFactoryDeployer = factory.connect(addr1);

      await upgrades.upgradeProxy(pointSocial.address, socialFactoryDeployer);
    });

    it('Should not upgrade the proxy by a non-deployer', async function () {
      await identityContract.setDevMode(true);
      await identityContract.register(
        handle,
        owner.address,
        '0xed17268897bbcb67127ed550cee2068a15fdb6f69097eebeb6e2ace46305d1ce',
        '0xe1e032c91d4c8fe6bab1f198871dbafb8842f073acff8ee9b822f748b180d7eb'
      );

      const factory = await ethers.getContractFactory('PointSocial');
      let socialFactoryDeployer = factory.connect(addr1);
      await expect(
        upgrades.upgradeProxy(pointSocial.address, socialFactoryDeployer)
      ).to.be.revertedWith('You are not a deployer of this identity');
    });
  });

  /*describe("Testing migrator functions", function () {
        it("User can add migrator", async function () {
            await pointSocial.addMigrator(
                addr1.address
            )

            await expect(
                pointSocial.addMigrator(addr2.address)
            ).to.be.revertedWith("Access Denied");
        });

        it("User can add migrator migrator can add post", async function () {
            await pointSocial.addMigrator(
                addr1.address
            )

            await expect(
                pointSocial.addMigrator(addr2.address)
              ).to.be.revertedWith("Access Denied");

            await pointSocial.connect(addr1).add(
                1,
                addr2.address,
                postContent,
                postimage,
                0,
                "1646689414"
            )  

            const posts = await pointSocial.getAllPosts();

            expect(posts[0].from).to.be.equal(addr2.address);

        });

        it("Random user can't add migrator post", async function () {
            await expect(
              pointSocial.add(
                1,
                addr2.address,
                postContent,
                postimage,
                0,
                "1646689414"
            )).to.be.revertedWith("Access Denied");
        });

        it("Migrator user can add migrator comment", async function () {
            await pointSocial.addMigrator(
                addr1.address
            )

            await pointSocial.connect(addr1).add(
                1,
                addr2.address,
                postContent,
                postimage,
                0,
                "1646689414"
            )  

            await pointSocial.connect(addr1).addComment(
                1,
                1,
                addr2.address,
                postContent,
                "1646689414"
            );

            const postComments = await pointSocial.getAllCommentsForPost(1);

            expect(postComments[0].contents).to.be.equal(postContent);
        });

        it("Random user can't add migrator comment", async function () {
            await pointSocial.addMigrator(
                addr1.address
            )

            await pointSocial.connect(addr1).add(
                1,
                addr2.address,
                postContent,
                postimage,
                0,
                "1646689414"
            )  

            await expect(
              pointSocial.addComment(
                1,
                1,
                addr2.address,
                postContent,
                "1646689414"
            )).to.be.revertedWith("Access Denied");
        });

        it("Random user can't add migrator", async function () {
            await expect(
                pointSocial.connect(addr2).addMigrator(addr2.address)
              ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });*/

  describe('Testing user functions', function () {
    it('User can create post', async function () {
      await pointSocial.addPost(postContent, postimage);
      const post = await pointSocial.getPostById(1);

      expect(post.contents).to.be.equal(postContent);
      expect(post.image).to.be.equal(postimage);
    });

    it('Get posts by owner', async function () {
      await pointSocial.addPost(postContent, postimage);
      const posts = await pointSocial.getAllPostsByOwner(owner.address, []);

      expect(posts[0].contents).to.be.equal(postContent);
      expect(posts[0].image).to.be.equal(postimage);
    });

    it('Get more then one post by owner', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addPost(
        '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      const postsLength = await pointSocial.getAllPostsLength();

      expect(postsLength.toString()).to.be.equal('2');
    });

    it('Get paginated posts', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addPost(
        '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      const paginatedPosts = await pointSocial.getPaginatedPostsByOwner(owner.address, 10, []);

      expect(paginatedPosts[0].contents).to.be.equal(postContent);
      expect(paginatedPosts[0].image).to.be.equal(postimage);
    });

    it('Get paginated posts more pages', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addPost(
        '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      await pointSocial
        .connect(addr1)
        .addPost(
          '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
          '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
        );

      await pointSocial
        .connect(addr1)
        .addPost(
          '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
          '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
        );

      await pointSocial
        .connect(addr2)
        .addPost(
          '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
          '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
        );

      await pointSocial
        .connect(addr2)
        .addPost(
          '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
          '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
        );

      const paginatedPosts = await pointSocial.getPaginatedPosts('10', ['1']);

      expect(paginatedPosts.length).to.be.equal(5);
    });

    it('get all posts', async () => {
      await pointSocial
        .connect(addr2)
        .addPost(
          '0xdd5a0873f998fff6b00052b51d1662f2993b603d9837da33cbc281a06b9f3b55',
          '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
        );
      const posts = await pointSocial.getAllPosts([]);
      expect(posts.length).to.be.equal(1);
    });

    it('Add comments to posts', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addCommentToPost(
        '1',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      const postCommentId = await pointSocial.commentIdsByPost(1, 0);
      const postComments = await pointSocial.commentById(postCommentId);

      expect(postComments.contents).to.be.equal(
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );
    });

    it('Add dislike to posts', async () => {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addDislikeToPost('1');

      await pointSocial.connect(addr2).addDislikeToPost('1');

      const [post] = await pointSocial.getAllPosts([]);

      expect(post.dislikesCount).to.be.equal(2);
    });

    it("Add a dislike should remove user's like", async () => {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addLikeToPost('1');

      await pointSocial.addDislikeToPost('1');

      const posts = await pointSocial.getAllPosts([]);
      const [post] = posts;

      expect(post.likesCount).to.be.equal(0);
      expect(post.dislikesCount).to.be.equal(1);
    });

    it("Add a like should remove user's dislike", async () => {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addDislikeToPost('1');

      await pointSocial.addLikeToPost('1');

      const [post] = await pointSocial.getAllPosts([]);

      expect(post.likesCount).to.be.equal(1);
      expect(post.dislikesCount).to.be.equal(0);
    });

    it('Add like to posts', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addLikeToPost('1');

      await pointSocial.connect(addr2).addLikeToPost('1');

      const posts = await pointSocial.getAllPosts([]);

      expect(posts[0].likesCount).to.be.equal(2);
    });

    it('Add like to posts twice same user', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.connect(addr1).addLikeToPost(1);

      await pointSocial.connect(addr1).addLikeToPost(1);

      await pointSocial.connect(addr2).addLikeToPost(1);
      //remove index?

      const postsByOwnerLenght = await pointSocial.getAllPostsByOwnerLength(owner.address, []);
      const posts = await pointSocial.getAllPosts([]);

      expect(postsByOwnerLenght).to.be.equal(1);
      expect(posts[0].likesCount).to.be.equal(1);
    });

    it('Add comments to posts', async function () {
      await pointSocial.addPost(postContent, postimage);

      await pointSocial.addCommentToPost(
        '1',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      await pointSocial.addCommentToPost(
        '1',
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );

      const postComments = await pointSocial.getAllCommentsForPost(1);

      expect(postComments[0].contents).to.be.equal(
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );
      expect(postComments[1].contents).to.be.equal(
        '0x0090916c0e6846d5dc8d22560e90782ded96e4efdeb53db214f612a54d4f5fbe'
      );
    });
  });
});
