require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("solidity-coverage");

module.exports = {
    solidity: {
        compilers: [
            {   
                version: '0.8.0',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000
                    }
                }            
            },
            {   
                version: '0.8.4',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000
                    }
                }            
            },
            {   
                version: '0.8.7',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000
                    }
                }            
            },
        ]
    },
    paths: {
        artifacts:'./hardhat/build',
        sources: './contracts',
        tests: './tests/unit/smartcontracts',
        cache: './hardhat/cache'
    }
};
