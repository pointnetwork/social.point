import '@nomiclabs/hardhat-waffle';
import '@openzeppelin/hardhat-upgrades';
import fs from 'fs';
import os from 'os';
import { hdkey } from 'ethereumjs-wallet';
import { mnemonicToSeedSync } from 'bip39';

const keystorePath = `${os.homedir()}/.point/keystore/key.json`;

const networks: Record<string, any> = {
  rinkeby: {
    url: process.env.RINKEBY_URL || '',
    accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  },
};

try {
  if (fs.existsSync(keystorePath)) {
    const keystore: any = JSON.parse(
      fs.readFileSync(`${os.homedir()}/.point/keystore/key.json`).toString()
    );

    const wallet = hdkey.fromMasterSeed(mnemonicToSeedSync(keystore.phrase)).getWallet();
    const privateKey = wallet.getPrivateKey().toString('hex');

    networks.ynet = {
      url: 'http://ynet.point.space:44444',
      accounts: [privateKey],
    };
  }
} catch (err) {}

export default {
  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.8.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },

  networks,

  paths: {
    artifacts: './hardhat/build',
    sources: './contracts',
    tests: './tests/unit/smartcontracts',
    cache: './hardhat/cache',
  },
};
