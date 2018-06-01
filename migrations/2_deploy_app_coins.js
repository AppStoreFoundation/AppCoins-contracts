var AppCoins = artifacts.require("./AppCoins.sol");

require('dotenv').config();

module.exports = function(deployer, network) {
    switch (network) {
        case 'development':
            deployer.deploy(AppCoins);
            break;

        case 'ropsten':
            var AppCoinsAddress = process.env.APPCOINS_ROPSTEN_ADDRESS;

            if (!AppCoinsAddress) {
                deployer.deploy(AppCoins);
            }

            break;

        case 'kovan':
            var AppCoinsAddress = process.env.APPCOINS_KOVAN_ADDRESS;

            if (!AppCoinsAddress) {
                deployer.deploy(AppCoins);
            }

            break;

        case 'main':
            var AppCoinsAddress = process.env.APPCOINS_MAINNET_ADDRESS;

            if (!AppCoinsAddress) {
                deployer.deploy(AppCoins);
            }

            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.` ;

    }
};
