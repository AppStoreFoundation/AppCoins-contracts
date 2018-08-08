var AppCoinsB = artifacts.require("./AppCoinsBClass.sol");
var AppCoins = artifacts.require("./AppCoins.sol");
var expect = require("chai").expect;

var startTime, endTime;  // For time tracking

contract('AppCoinsBClass', function(accounts) {

	startTime = new Date();


	beforeEach('Setting AppCoinsBClass test...', async function(){
		appc = await AppCoins.new();
		instance = await AppCoinsB.new(appc.address);
		var appcsToSend =  10 * Math.pow(10, 18);
		await appc.approve(instance.address,appcsToSend,{from: accounts[0]});
		await instance.convertAndTransfer(accounts[0],appcsToSend,{from: accounts[0]});
	})

	it("Testing the TotalSupply get() along with checking if the owner has TotalSupply", async function(){
		var total_supply = await instance.totalSupply.call();
		var balance1 = await instance.balanceOf.call(accounts[0], {from: accounts[0]});

		expect(Number(balance1)).to.be.equal(Number(total_supply));
	})


	it("Should transfer class B APPCs to account[1] - transfer()", async function(){
		// Getting the initial balances
		var sender = await instance.balanceOf.call(accounts[0], {from: accounts[0]});
		var receiver = await instance.balanceOf.call(accounts[1], {from: accounts[1]});

		// Making the transaction
		var appcs_to_send =  5 * Math.pow(10, 18);
		var transfer_result = await instance.transfer.sendTransaction(accounts[1], appcs_to_send);

		// Getting balances after the transaction
		var sender_new_balance = await instance.balanceOf.call(accounts[0], {from: accounts[0]});
		var receiver_new_balance = await instance.balanceOf.call(accounts[1], {from: accounts[1]});

		var accounting = sender - appcs_to_send;

		expect(Number(sender_new_balance)).to.be.equal(Number(accounting));
	})


	// Will need approve
	it("Testing the transfer of class B APPCs between accounts - transferFrom()", async function(){
		var appcs_to_send =  3 * Math.pow(10, 18);
		var transfer_result = await instance.transfer.sendTransaction(accounts[1], appcs_to_send);

		var approval = await instance.approve.sendTransaction(accounts[1], appcs_to_send, {from: accounts[1]});

		var transfer_from = await instance.transferFrom.sendTransaction(accounts[1], accounts[2], appcs_to_send, {from: accounts[1], to: accounts[2]});

		var account2 = await instance.balanceOf.call(accounts[2], {from: accounts[2]});

		expect(Number(account2)).to.be.equal(appcs_to_send);
	})

	it("should increase total supply when class A tokens are converted to class B tokens", async function(){
		var appcsToSend =  10 * Math.pow(10, 18);
		var initialSupply = Number(await instance.totalSupply.call());
		var initialBalanceA = Number(await appc.balanceOf.call(accounts[0],{from: accounts[0]}));
		var initialBalanceB = Number(await instance.balanceOf.call(accounts[0],{from: accounts[0]}));
		await appc.approve(instance.address,appcsToSend,{from: accounts[0]}).then( async () => {
			return await instance.convertAndTransfer(accounts[0],appcsToSend,{from: accounts[0]});
		});

		var finalSupply = Number(await instance.totalSupply.call());
		var finalBalanceA = Number(await appc.balanceOf.call(accounts[0],{from: accounts[0]}));
		var finalBalanceB = Number(await instance.balanceOf.call(accounts[0],{from: accounts[0]}));

		var expectedSupply = initialSupply+appcsToSend;
		var expectedBalanceB = initialBalanceB+appcsToSend;
		var expectedBalanceA = initialBalanceA-appcsToSend;
		expect(finalSupply).to.be.equal(expectedSupply,"Supply should increase");
		expect(finalBalanceB).to.be.equal(expectedBalanceB,"Balance in class B token should increase");
		expect(finalBalanceA).to.be.equal(expectedBalanceA,"Balance in class A token should decrease");

	});

	it("should decrease total supply when class B tokens are converted to class A tokens", async function(){
		var appcsToSend =  10 * Math.pow(10, 18);
		await appc.approve(instance.address,appcsToSend,{from: accounts[0]});
		await instance.convertAndTransfer(accounts[0],appcsToSend,{from: accounts[0]});
		var initialSupply = Number(await instance.totalSupply.call());
		var initialSupplyA = Number(await appc.totalSupply.call());
		var initialBalanceA = Number(await appc.balanceOf.call(accounts[0],{from: accounts[0]}));
		var initialBalanceB = Number(await instance.balanceOf.call(accounts[0],{from: accounts[0]}));

		await instance.revertAndTransfer(accounts[0],appcsToSend,{from: accounts[0]});

		var finalSupply = Number(await instance.totalSupply.call());
		var finalSupplyA = Number(await appc.totalSupply.call());
		var finalBalanceA = Number(await appc.balanceOf.call(accounts[0],{from: accounts[0]}));
		var finalBalanceB = Number(await instance.balanceOf.call(accounts[0],{from: accounts[0]}));

		var expectedSupply = initialSupply-appcsToSend;
		var expectedBalanceB = initialBalanceB-appcsToSend;
		var expectedBalanceA = initialBalanceA+appcsToSend;
		expect(finalSupply).to.be.equal(expectedSupply,"Supply of class B token should decrease");
		expect(finalSupplyA).to.be.equal(initialSupplyA,"Supply of class A token should not change");
		expect(finalBalanceB).to.be.equal(expectedBalanceB,"Balance in class B token should decrease");
		expect(finalBalanceA).to.be.equal(expectedBalanceA,"Balance in class A token should increase");

	});

	endTime = new Date();

	it("Burning tokens from the contract itself", async function(){
		var account0_initial = Number(await instance.balanceOf.call(accounts[0], {from: accounts[0]}));
		var amount_to_burn = 2 * Math.pow(10, 18);  // Burning 2 appcoins
		// Burn time. Should burn from accounts[0] being this the default account
		var burn_result = await instance.burn.sendTransaction(amount_to_burn);
		var account0 = Number(await instance.balanceOf.call(accounts[0], {from: accounts[0]}));

		expect(account0).to.be.equal(account0_initial - amount_to_burn,"Should burn class B tokens");
	})
});
