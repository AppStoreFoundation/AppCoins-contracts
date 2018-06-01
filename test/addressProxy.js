var AddressProxy = artifacts.require("./AddressProxy.sol");
var expect = require("chai").expect;

contract('AddressProxy', function(accounts) {
	var instance;
	var testAddresses = [
			"0x73215a5f1b95ecfb79d37c94fea5c310b039f527",
			"0x74901a5f1b95ecfb79d37c94fea5c310b039f527"
	];

	beforeEach('Setting AddressProxy test...', async function(){
		instance = await AddressProxy.new();
	})

	it("should set a new Custom Address correctly", async function(){
		await instance.addAddress.sendTransaction("testeContractAddress", testAddresses[0]);
		var availableIds = await instance.getAvailableIds.call();
		var testAddr = await instance.getContractAddressById.call(availableIds[0]);

		expect(testAddr).to.be.equal(testAddresses[0]);
	})

	it("should update an Address when added a duplicated name", async function(){
		await instance.addAddress.sendTransaction("testeContractAddress", testAddresses[0]);

		//	How many Ids are after adding a new Address
		var availableIds = await instance.getAvailableIds.call();

		var auxAddr = await instance.getContractAddressById.call(availableIds[0]);
		expect(auxAddr).to.be.equal(testAddresses[0]);


		//	Tried to add an address with the same name, it should update it
		await instance.addAddress.sendTransaction("testeContractAddress", testAddresses[1]);
		var auxAddr2 = await instance.getContractAddressById.call(availableIds[0]);
		expect(auxAddr2).to.not.equal(auxAddr);
		expect(auxAddr2).to.be.equal(testAddresses[1]);

		//	How many Ids are after updating a Address
		var newAvailableIds = await instance.getAvailableIds.call();
		expect(availableIds.length).to.be.equal(newAvailableIds.length);
	})

});
