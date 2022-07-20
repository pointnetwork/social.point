import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract, ContractReceipt } from 'ethers';

const { expect } = require('chai');
const { ethers, upgrades, network } = require('hardhat');

const handle = 'social';

function getRandomNumber(max: number) {
  return Math.floor(Math.random() * max);
}

const postContent = '0x9d6b0f937680809a01639ad1ae4770241c7c8a0ded490d2f023669f18c6d744b';
const postImage = '0x5f04837d78fa7a656419f98d73fc1ddaac1bfdfca9a244a2ee128737a186da6e';

type Post = {
  id: BigNumber;
  createdAt: BigNumber;
  weight: number;
};

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const YEAR = MONTH * 12;

async function addTime(seconds: number) {
  await network.provider.send('evm_increaseTime', [seconds]);
  await network.provider.send('evm_mine');
}

describe('PointSocial contract', () => {
  let identity: Contract;
  let contract: Contract;
  let deployer: SignerWithAddress;
  let goodActor: SignerWithAddress;
  let badActor: SignerWithAddress;
  let users: SignerWithAddress[];

  let badPostId: BigNumber;
  let goodPostId: BigNumber;

  async function deployContracts() {
    const identityFactory = await ethers.getContractFactory('Identity');
    identity = await upgrades.deployProxy(identityFactory, [], { kind: 'uups' });
    await identity.deployed();
    await identity.setDevMode(true);
    await identity.register(
      handle,
      deployer.address,
      '0xed17268897bbcb67127ed550cee2068a15fdb6f69097eebeb6e2ace46305d1ce',
      '0xe1e032c91d4c8fe6bab1f198871dbafb8842f073acff8ee9b822f748b180d7eb'
    );
    const factory = await ethers.getContractFactory('PointSocial');
    contract = await upgrades.deployProxy(factory, [identity.address, handle], {
      kind: 'uups',
    });
    await contract.deployed();
  }

  before(async () => {
    [deployer, goodActor, badActor, ...users] = await ethers.getSigners();
    await deployContracts();
    await setWeights();
    await populateSocial();
    await voteBadPost();
    await voteGoodPost();
  });

  beforeEach(async () => {
    await setWeights(1, 1, 0, 10, 10);
  });

  async function doTransaction(transaction: Promise<any>): Promise<ContractReceipt> {
    const tx = await transaction;
    const receipt = tx.wait();
    return receipt;
  }

  async function setWeights(
    likesWeightMultiplier = 0,
    dislikesWeightWultiplier = 0,
    oldWeightMultiplierinitialWeight = 0,
    weightThreshold = 0,
    initialWeight = 0
  ) {
    await doTransaction(
      contract
        .connect(deployer)
        .setWeights(
          BigNumber.from(likesWeightMultiplier),
          BigNumber.from(dislikesWeightWultiplier),
          BigNumber.from(oldWeightMultiplierinitialWeight),
          BigNumber.from(weightThreshold),
          BigNumber.from(initialWeight)
        )
    );
  }

  async function voteBadPost() {
    await Promise.all(
      Array.from(Array(getRandomNumber(10))).map(() =>
        doTransaction(
          contract.connect(users[getRandomNumber(users.length - 1)]).addDislikeToPost(badPostId)
        )
      )
    );
  }

  async function addPost(
    content: string,
    image: string,
    user: SignerWithAddress = deployer
  ): Promise<BigNumber> {
    const receipt = await doTransaction(contract.connect(user).addPost(postContent, postImage));
    const id: BigNumber = receipt.events![0].args![0];
    return id;
  }

  async function voteGoodPost() {
    await Promise.all(
      Array.from(Array(getRandomNumber(10))).map(() =>
        doTransaction(
          contract.connect(users[getRandomNumber(users.length - 1)]).addLikeToPost(goodPostId)
        )
      )
    );
  }

  async function populateSocial() {
    // random posts
    await Promise.all(
      Array.from(Array(28)).map(() =>
        addPost(postContent, postImage, users[getRandomNumber(users.length - 1)])
      )
    );

    badPostId = await addPost(postContent, postImage, badActor);

    // more random posts
    await Promise.all(
      Array.from(Array(20)).map(() =>
        addPost(postContent, postImage, users[getRandomNumber(users.length - 1)])
      )
    );

    goodPostId = await addPost(postContent, postImage, goodActor);

    // more random posts
    await Promise.all(
      Array.from(Array(50)).map(() =>
        addPost(postContent, postImage, users[getRandomNumber(users.length - 1)])
      )
    );
  }

  it('all posts should be returned', async () => {
    const posts = await contract.getAllPosts([]);
    expect(posts.length).to.equal(100);
  });

  describe('with weight threshold', () => {
    beforeEach(async () => {
      await setWeights(1, 1, 0, 10, 10);
    });

    it(`bad post should be filtered`, async () => {
      const posts = await contract.getAllPosts([]);
      expect(posts.some(({ id }: { id: BigNumber }) => id === badPostId)).to.equal(false);
    });
  });

  describe('front sort logic', async () => {
    beforeEach(async () => {
      await setWeights(1, 1, 0, 10, 10);
    });
    // get X amount of posts
    let posts = await contract.getPaginatedPosts(100, []);
    // sort them using weight
    posts = posts.sort(({ weight: w1 }: Post, { weight: w2 }: Post) => w2 - w1);
  });

  describe('if a new post is created', () => {
    let viewedPosts: Post[];
    before(async () => {
      viewedPosts = await contract.getPaginatedPosts(100, []);
      await addTime(HOUR);
      await addPost(postContent, postImage, users[1]);
    });

    it(`if the users clicks on 'get newest posts', that post should be returned`, async () => {
      let newestViewedPostTimestamp = BigNumber.from(0);
      const viewedPostIds = viewedPosts.map(({ createdAt, id }: Post) => {
        newestViewedPostTimestamp = newestViewedPostTimestamp.lt(createdAt)
          ? createdAt
          : newestViewedPostTimestamp;
        return id;
      });
      const newPostsToView = await contract.getNewPosts(
        10,
        viewedPostIds,
        newestViewedPostTimestamp
      );
      expect(newPostsToView.length).to.equal(1);
      expect(newPostsToView[0].from).to.equal(users[1].address);
    });
  });
});
