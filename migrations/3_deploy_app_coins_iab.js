var AppCoinsIAB = artifacts.require("./AppCoinsIAB.sol");

require('dotenv').config();

module.exports = function(deployer, network) {
    switch (network) {
        case 'development':
            deployer.deploy(AppCoinsIAB);
            break;

        case 'ropsten':
            var AppCoinsIABAddress = process.env.IAB_ROPSTEN_ADDRESS;

            if (!AppCoinsIABAddress) {
                deployer.deploy(AppCoinsIAB);
            }

            break;

        case 'kovan':
            var AppCoinsIABAddress = process.env.IAB_KOVAN_ADDRESS;

            if (!AppCoinsAddress) {
                deployer.deploy(AppCoinsIAB);
            }

            break;

        case 'main':
            var AppCoinsIABAddress = process.env.IAB_MAINNET_ADDRESS;

            if (!AppCoinsAddress) {
                deployer.deploy(AppCoinsIAB);
            }

            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.` ;

    }
};
