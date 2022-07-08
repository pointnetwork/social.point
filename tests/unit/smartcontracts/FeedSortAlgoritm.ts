import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract, ContractReceipt } from 'ethers';

const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

const handle = 'social';

function getRandomNumber(max: number) {
  return Math.floor(Math.random() * max);
}

const postContent = '0x9d6b0f937680809a01639ad1ae4770241c7c8a0ded490d2f023669f18c6d744b';
const postImage = '0x5f04837d78fa7a656419f98d73fc1ddaac1bfdfca9a244a2ee128737a186da6e';

describe('PointSocial contract', () => {
  let identity: Contract;
  let contract: Contract;
  let deployer: SignerWithAddress;
  let goodActor: SignerWithAddress;
  let badActor: SignerWithAddress;
  let users: SignerWithAddress[];

  let badPostId: BigNumber;
  let goodPostId: BigNumber;

  before(async () => {
    [deployer, goodActor, badActor, ...users] = await ethers.getSigners();
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
        doTransaction(
          contract.connect(users[getRandomNumber(users.length - 1)]).addPost(postContent, postImage)
        )
      )
    );

    const badPostReceipt = await doTransaction(
      contract.connect(badActor).addPost(postContent, postImage)
    );
    badPostId = badPostReceipt.events![0].args![0];

    Array.from(Array(20)).map(() =>
      doTransaction(
        contract.connect(users[getRandomNumber(users.length - 1)]).addPost(postContent, postImage)
      )
    );

    const goodPostReceipt = await doTransaction(
      contract.connect(goodActor).addPost(postContent, postImage)
    );
    goodPostId = goodPostReceipt.events![0].args![0];

    // more random posts
    await Promise.all(
      Array.from(Array(50)).map(() =>
        doTransaction(
          contract.connect(users[getRandomNumber(users.length - 1)]).addPost(postContent, postImage)
        )
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
    posts = posts.sort(({ weight: w1 }, { weight: w2 }) => w2 - w1);
  });
});
