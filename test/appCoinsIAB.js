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

})
