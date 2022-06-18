require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

module.exports = {
    solidity: {
        compilers: [
            {version: '0.8.0'},
            {version: '0.8.4'},
            {version: '0.8.7'}
        ]
    },
    paths: {
        artifacts:'./hardhat/build',
        sources: './contracts',
        tests: './tests/unit/smartcontracts',
        cache: './hardhat/cache'
    }
};
