var AppCoins = artifacts.require("./AppCoins.sol");
var AppCoinsBClass = artifacts.require("./AppCoinsBClass.sol");
var AppCoinsIAB = artifacts.require("./AppCoinsIAB.sol");
var AddressProxy = artifacts.require("./AddressProxy.sol");
var AdvertisementStorage = artifacts.require("./AdvertisementStorage.sol");
var Advertisement = artifacts.require("./Advertisement.sol");

require('dotenv').config();

module.exports = function(deployer, network) {
    switch (network) {
        case 'development':
            deployer.deploy(AddressProxy);
            break;

        case 'ropsten':
            deployer.deploy(AddressProxy);
            break;
        case 'kovan':
            deployer.deploy(AddressProxy);
            break;

        case 'main':
            deployer.deploy(AddressProxy);
            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.` ;

    }
};
