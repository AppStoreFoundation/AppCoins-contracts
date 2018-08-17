var AppCoins = artifacts.require("./AppCoins.sol");
var AdvertisementStorage = artifacts.require("./AdvertisementStorage.sol");
var AdvertisementFinance = artifacts.require("./AdvertisementFinance.sol");
var Advertisement = artifacts.require("./Advertisement.sol");

require('dotenv').config();

module.exports = function(deployer, network) {
    switch (network) {
        case 'development':
            AppCoins.deployed()
            .then(function() {
                return  deployer.deploy(AdvertisementStorage);
            })
            .then(function() {
                return deployer.deploy(AdvertisementFinance,AppCoins.address);
            })
            .then(function() {
                return deployer.deploy(Advertisement, AppCoins.address, AdvertisementStorage.address,AdvertisementFinance.address);
            });

            break;

        case 'ropsten':
            AppCoinsAddress = process.env.APPCOINS_ROPSTEN_ADDRESS;
            AdvertisementFinanceAddress =  process.env.ADVERTISEMENT_FINANCE_ROPSTEN_ADDRESS;
            AdvertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_ROPSTEN_ADDRESS;

            if(!AppCoinsAddress) {
                throw 'AppCoins Address not found!'
            }

            if (!AdvertisementFinanceAddress.startsWith("0x") || !AdvertisementStorageAddress.startsWith("0x")) {
                deployer.deploy(AdvertisementFinance, AppCoinsAddress)
                .then(function() {
                    return deployer.deploy(AdvertisementStorage)
                    .then(function() {
                        return deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorage.address,AdvertisementFinance.address);

                    })
                })
            } else {
                return deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorageAddress, AdvertisementFinanceAddress);
            }

            break;
        case 'kovan':
            AppCoinsAddress = process.env.APPCOINS_KOVAN_ADDRESS;
            AdvertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_KOVAN_ADDRESS;

            if(!AppCoinsAddress) {
                throw 'AppCoins Address not found!'
            }

            if (!AdvertisementStorageAddress.startsWith("0x")) {
                deployer.deploy(AdvertisementStorage)
                .then(function() {
                    return deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorage.address);
                })
            } else {
                deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorageAddress);
            }

            break;

        case 'main':
            AppCoinsAddress = process.env.APPCOINS_MAINNET_ADDRESS;
            AdvertisementFinanceAddress =  process.env.ADVERTISEMENT_FINANCE_MAINNET_ADDRESS;
            AdvertisementStorageAddress = process.env.ADVERTISEMENT_STORAGE_MAINNET_ADDRESS;

            if(!AppCoinsAddress) {
                throw 'AppCoins Address not found!'
            }

            if (!AdvertisementFinanceAddress.startsWith("0x") || !AdvertisementStorageAddress.startsWith("0x")) {
                deployer.deploy(AdvertisementFinance, AppCoinsAddress)
                .then(function() {
                    return deployer.deploy(AdvertisementStorage)
                    .then(function() {
                        return deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorage.address,AdvertisementFinance.address);

                    })
                })
            } else {
                return deployer.deploy(Advertisement, AppCoinsAddress, AdvertisementStorageAddress, AdvertisementFinanceAddress);
            }

            break;

        default:
            throw `Unknown network "${network}". See your Truffle configuration file for available networks.` ;

    }
};
