var AppCoinsIAB = artifacts.require("./AppCoinsIAB.sol");
var AppCoins = artifacts.require("./AppCoins.sol");
var chai = require('chai');
var web3 = require('web3');
var TestUtils = require('./TestUtils.js');
var expect = chai.expect;
var chaiAsPromissed = require('chai-as-promised')
chai.use(chaiAsPromissed);

var appcInstance;
var appIABInstance;
var userAcc;
var devAcc;
var appStoreAcc;
var oemAcc;

var devShare = 0.85;
var appSShare = 0.1;
var oemShare = 0.05;
var allowedAddress;

contract('AppCoinsIAB', function(accounts) {
	beforeEach( async () => {
		appcInstance = await AppCoins.new();
		appIABInstance = await AppCoinsIAB.new();

		userAcc = accounts[0];
		devAcc = accounts[1];
		appStoreAcc = accounts[2];
		oemAcc = accounts[3];

		TestUtils.setAppCoinsInstance(appcInstance);
		TestUtils.setContractInstance(appIABInstance);

		allowedAddress = accounts[7];

		await appIABInstance.addAllowedAddress(allowedAddress);


	})

	it('should make a buy',async function () {
		var userInitBalance = await TestUtils.getBalance(userAcc);
		var devInitBalance = await TestUtils.getBalance(devAcc);
		var appSInitBalance = await TestUtils.getBalance(appStoreAcc);
		var oemInitBalance = await TestUtils.getBalance(oemAcc);

		var price = 10000000;
		await appcInstance.approve(appIABInstance.address,price);
		await appIABInstance.buy.sendTransaction(price,"e",appcInstance.address,devAcc,appStoreAcc,oemAcc);

		var userFinalBalance = await TestUtils.getBalance(userAcc);
		var devFinalBalance = await TestUtils.getBalance(devAcc);
		var appSFinalBalance = await TestUtils.getBalance(appStoreAcc);
		var oemFinalBalance = await TestUtils.getBalance(oemAcc);

		expect(userFinalBalance).to.be.equal(userInitBalance-price);
		expect(devFinalBalance).to.be.equal(devInitBalance+(price*devShare));
		expect(appSFinalBalance).to.be.equal(appSInitBalance+(price*appSShare));
		expect(oemFinalBalance).to.be.equal(oemInitBalance+(price*oemShare));
	})

	it('should revert and emit an Error event when there is no allowance', async function () {
		var price = 10000000;

		await TestUtils.expectErrorMessageTest("Not enough allowance",() => {
			return appIABInstance.buy.sendTransaction(price,"example",appcInstance.address,devAcc,appStoreAcc,oemAcc);
		});
	})

	it('should allow the contract owner to add allowed addresses', async function () {
		var allowedAddress = accounts[8];
		await appIABInstance.addAllowedAddress(allowedAddress);
	})

	it('should revert if a non contract owner tries to add allowed addresses', async function () {
		var newAllowedAddress = accounts[8];
		await TestUtils.expectErrorMessageTest("Operation can only be performed by contract owner", () => {
			return appIABInstance.addAllowedAddress.sendTransaction(newAllowedAddress, { from : allowedAddress });
		});
	})
	
	it('should allow the contract owner to remove allowed addresses', async function () {
		await appIABInstance.removeAllowedAddress(allowedAddress);
	})

	it('should revert if a non contract owner tries to remove allowed addresses', async function () {
		var issuer = accounts[9];
		await TestUtils.expectErrorMessageTest("Operation can only be performed by contract owner", () => {
			return appIABInstance.removeAllowedAddress.sendTransaction(allowedAddress, { from : issuer });
		});
	})

	it('should enable allowed addresses to call offchain transaction event function', async function () {
		var walletAddress1 = accounts[4];
		var walletAddress2 = accounts[5];
		await TestUtils.expectEventTest("OffChainBuy", () => {
			return appIABInstance.informOffChainBuy.sendTransaction([walletAddress1,walletAddress2],[walletAddress1,walletAddress2], { from : allowedAddress });
		});
	})

	it('should revert if a non allowed address calls offchain transaction event function', async function () {
		var walletAddress1 = accounts[4];
		var walletAddress2 = accounts[5];
		await TestUtils.expectErrorMessageTest("Operation can only be performed by allowed Addresses", () => {
			return appIABInstance.informOffChainBuy.sendTransaction([walletAddress1,walletAddress2],[walletAddress1,walletAddress2]);
		});
	})

	it('should revert if offchain transaction event function is called with different wallet and roothash list lengths', async function() {
		var walletAddress1 = accounts[4];
		var walletAddress2 = accounts[5];
		await TestUtils.expectErrorMessageTest("Wallet list and Roothash list must have the same lengths", () => {
			return appIABInstance.informOffChainBuy.sendTransaction([walletAddress1,walletAddress2],[walletAddress1], {from: allowedAddress});
		});
	})

	it('should revert if a previously allowed address has its access revoked to offchain transaction event function', async function () {
		var walletAddress1 = accounts[4];
		var walletAddress2 = accounts[5];
		await appIABInstance.informOffChainBuy.sendTransaction([walletAddress1,walletAddress2],[walletAddress1,walletAddress2], {from: allowedAddress});

		await appIABInstance.removeAllowedAddress(allowedAddress);
		await TestUtils.expectErrorMessageTest("Operation can only be performed by allowed Addresses", () => {
			return appIABInstance.informOffChainBuy.sendTransaction([walletAddress1,walletAddress2],[walletAddress1,walletAddress2], {from: allowedAddress});
		})
	})


})
