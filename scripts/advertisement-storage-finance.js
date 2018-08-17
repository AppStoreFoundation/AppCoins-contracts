const AdvertisementStorage = artifacts.require("./AdvertisementStorage.sol");
const AdvertisementFinance = artifacts.require("./AdvertisementFinance.sol");
const Advertisement = artifacts.require("./Advertisement.sol");
const network = process.argv[5] || 'development';
const web3 = require('web3');

require('dotenv').config();

module.exports = function(callback) {
    let storageInstance;

    switch (network) {

        case 'development':
            storageInstance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_DEVELOPMENT_ADDRESS);
            financeInstance = AdvertisementFinance.at(process.env.ADVERTISEMENT_FINANCE_DEVELOPMENT_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_DEVELOPMENT_ADDRESS;
            break;

        case 'ropsten':
            storageInstance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_ROPSTEN_ADDRESS);
            financeInstance = AdvertisementFinance.at(process.env.ADVERTISEMENT_FINANCE_ROPSTEN_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_ROPSTEN_ADDRESS;
            break;

        case 'main':
            storageInstance = AdvertisementStorage.at(process.env.ADVERTISEMENT_STORAGE_MAINNET_ADDRESS);
            financeInstance = AdvertisementFinance.at(process.env.ADVERTISEMENT_FINANCE_MAINNET_ADDRESS);
            advertisementAddress = process.env.ADVERTISEMENT_MAINNET_ADDRESS;
            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.`;

    }

    if(!storageInstance || !advertisementAddress) {
        throw 'Missing environment variables';
    }

    const addNewAdvertisementToStorage = function(newAdvertisementAddress) {
        storageInstance.setAllowedAddresses(newAdvertisementAddress, true).then(function(error, success) {
            console.log(`New Advertisement address ${newAdvertisementAddress} added to the storage!`);
        })
    }

    const addAdvertisementContractAddressToFinance = function(newAdvertisementAddress) {
        financeInstance.setAdsContractAddress(newAdvertisementAddress).then(function(error, success) {
            console.log(`New Advertisement address ${newAdvertisementAddress} added to the finance!`);
        })
    }

    //  TODO this need to be async
    addAdvertisementContractAddressToFinance(advertisementAddress);
    addNewAdvertisementToStorage(advertisementAddress);

};
