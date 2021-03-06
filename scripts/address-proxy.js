const AddressProxy = artifacts.require("./AddressProxy.sol");
const network = process.argv[5] || 'development';
const web3 = require('web3');

require('dotenv').config();

let instance;
let appCoinsAddress;
let appCoinsIABAddress;
let advertisementAddress;
let advertisementFinanceAddress;
let advertisementStorageAddress;
let appCoinsTimelockAddress;
let appCoinsCreditsBalanceAddress;
let extendedAdvertisementAddress;
let extendedAdvertisementFinanceAddress;
let extendedAdvertisementStorageAddress;

module.exports = function(callback) {
    let instance;
    switch (network) {

        case 'development':
            instance = AddressProxy.at(process.env.ADDRESS_PROXY_DEVELOPMENT_ADDRESS);
            appCoinsAddress = process.env.APPCOINS_DEVELOPMENT_ADDRESS;
            appCoinsIABAddress = process.env.IAB_DEVELOPMENT_ADDRESS;
            advertisementAddress = process.env.ADVERTISEMENT_DEVELOPMENT_ADDRESS;
            advertisementFinanceAddress = process.env.ADVERTISEMENT_FINANCE_DEVELOPMENT_ADDRESS;
            advertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_DEVELOPMENT_ADDRESS;
            appCoinsTimelockAddress = process.env.APPCOINS_TIMELOCK_DEVELOPMENT_ADDRESS;
            appCoinsCreditsBalanceAddress = process.env.APPCOINS_CREDITS_BALANCE_DEVELOPMENT_ADDRESS;

            extendedAdvertisementAddress = process.env.EXTENDED_ADVERTISEMENT_DEVELOPMENT_ADDRESS;
            extendedAdvertisementFinanceAddress = process.env.EXTENDED_ADVERTISEMENT_FINANCE_DEVELOPMENT_ADDRESS;
            extendedAdvertisementStorageAddress = process.env.EXTENDED_ADVERTISEMENT_STORAGE_DEVELOPMENT_ADDRESS;

            break;

        case 'ropsten':
            instance = AddressProxy.at(process.env.ADDRESS_PROXY_ROPSTEN_ADDRESS);
            appCoinsAddress = process.env.APPCOINS_ROPSTEN_ADDRESS;
            appCoinsIABAddress = process.env.IAB_ROPSTEN_ADDRESS;
            advertisementAddress = process.env.ADVERTISEMENT_ROPSTEN_ADDRESS;
            advertisementFinanceAddress = process.env.ADVERTISEMENT_FINANCE_ROPSTEN_ADDRESS;
            advertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_ROPSTEN_ADDRESS;
            appCoinsTimelockAddress = process.env.APPCOINS_TIMELOCK_ROPSTEN_ADDRESS;
            appCoinsCreditsBalanceAddress = process.env.APPCOINS_CREDITS_BALANCE_ROPSTEN_ADDRESS;

            extendedAdvertisementAddress = process.env.EXTENDED_ADVERTISEMENT_ROPSTEN_ADDRESS;
            extendedAdvertisementFinanceAddress = process.env.EXTENDED_ADVERTISEMENT_FINANCE_ROPSTEN_ADDRESS;
            extendedAdvertisementStorageAddress = process.env.EXTENDED_ADVERTISEMENT_STORAGE_ROPSTEN_ADDRESS;

            break;

        case 'main':
            instance = AddressProxy.at(process.env.ADDRESS_PROXY_MAINNET_ADDRESS);
            appCoinsAddress = process.env.APPCOINS_MAINNET_ADDRESS;
            appCoinsIABAddress = process.env.IAB_MAINNET_ADDRESS;
            advertisementAddress = process.env.ADVERTISEMENT_MAINNET_ADDRESS;
            advertisementFinanceAddress = process.env.ADVERTISEMENT_FINANCE_MAINNET_ADDRESS;
            advertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_MAINNET_ADDRESS;
            appCoinsTimelockAddress = process.env.APPCOINS_TIMELOCK_MAINNET_ADDRESS;
            appCoinsCreditsBalanceAddress = process.env.APPCOINS_CREDITS_BALANCE_MAINNET_ADDRESS;

            extendedAdvertisementAddress = process.env.EXTENDED_ADVERTISEMENT_MAINNET_ADDRESS;
            extendedAdvertisementFinanceAddress = process.env.EXTENDED_ADVERTISEMENT_FINANCE_MAINNET_ADDRESS;
            extendedAdvertisementStorageAddress = process.env.EXTENDED_ADVERTISEMENT_STORAGE_MAINNET_ADDRESS;

            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.`;

    }

    if(!instance || !appCoinsAddress || !appCoinsIABAddress || !advertisementAddress) {
        throw 'Missing environment variables';
    }

    const addAddress = function(name, address) {
        instance.addAddress(name, address).then(function(error, success) {
            console.log(`contract ${name} -> ${address}`);
        })
    }

    addAddress(process.env.APPCOINS_CONTRACT_NAME, appCoinsAddress);
    addAddress(process.env.APPCOINSIAB_CONTRACT_NAME, appCoinsIABAddress);
    addAddress(process.env.ADVERTISEMENT_CONTRACT_NAME, advertisementAddress);
    addAddress(process.env.ADVERTISEMENT_FINANCE_CONTRACT_NAME, advertisementFinanceAddress);
    addAddress(process.env.ADVERTISEMENT_STORAGE_CONTRACT_NAME, advertisementStorageAddress);
    addAddress(process.env.APPCOINS_TIMELOCK_CONTRACT_NAME, appCoinsTimelockAddress);
    addAddress(process.env.APPCOINS_CREDITS_BALANCE_CONTRACT_NAME, appCoinsCreditsBalanceAddress);
    addAddress(process.env.EXTENDED_ADVERTISEMENT_CONTRACT_NAME, extendedAdvertisementAddress);
    addAddress(process.env.EXTENDED_ADVERTISEMENT_FINANCE_CONTRACT_NAME, extendedAdvertisementFinanceAddress);
    addAddress(process.env.EXTENDED_ADVERTISEMENT_STORAGE_CONTRACT_NAME, extendedAdvertisementStorageAddress);


};
