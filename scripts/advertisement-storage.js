const AdvertisementStorage = artifacts.require("./AdvertisementStorage.sol");
const network = process.argv[5] || 'development';
const web3 = require('web3');

require('dotenv').config();

module.exports = function(callback) {
    let instance;

    switch (network) {

        case 'development':
            instance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_DEVELOPMENT_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_DEVELOPMENT_ADDRESS;
            break;

        case 'ropsten':
            instance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_ROPSTEN_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_ROPSTEN_ADDRESS;
            break;

        case 'main':
            instance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_MAINNET_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_MAINNET_ADDRESS;
            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.`;

    }

    if(!instance || !advertisementAddress) {
        throw 'Missing environment variables';
    }

    const addNewAdvertisementToStorage = function(newAdvertisementAddress) {
        instance.setAllowedAddresses(newAdvertisementAddress, true).then(function(error, success) {
            console.log(`New Advertisement address ${advertisementAddress} added to the storage!`);
        })
    }

    addNewAdvertisementToStorage(advertisementAddress);

};
