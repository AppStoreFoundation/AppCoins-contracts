const appCoinIAB = artifacts.require("./AppCoinsIAB.sol");
const network = process.argv[5] || 'development';
const newAddress = process.argv[7] ;
const web3 = require('web3');

if(!newAddress) {
    throw 'Missing address';
}

require('dotenv').config();

module.exports = function(callback) {
    let appcoinsIABInstance;

    switch (network) {

        case 'development':
            appcoinsIABInstance = appCoinIAB.at(process.env.IAB_DEVELOPMENT_ADDRESS);
            break;

        case 'ropsten':
            appcoinsIABInstance = appCoinIAB.at(process.env.IAB_ROPSTEN_ADDRESS);
            break;

        case 'main':
            appcoinsIABInstance = appCoinIAB.at(process.env.IAB_MAINNET_ADDRESS);
            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.`;

    }

    if(!appcoinsIABInstance) {
        throw 'Missing environment variables';
    }
    
    const addNewAddress = function(allowedAddress) {
        appcoinsIABInstance.addAllowedAddress(allowedAddress).then(function(error, success) {
            console.log(`New address ${allowedAddress} added to the AppCoinsIAB!`);
        })
    }


    addNewAddress(newAddress);
};
