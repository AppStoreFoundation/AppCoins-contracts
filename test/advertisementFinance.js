var AdvertisementFinance = artifacts.require("./AdvertisementFinance.sol");
var AppCoins = artifacts.require("./AppCoins.sol");
var chai = require('chai');
var web3 = require('web3');
var expect = chai.expect;
var chaiAsPromissed = require('chai-as-promised');
chai.use(chaiAsPromissed);

var TestUtils = require('./TestUtils.js');

var AdvertisementFinanceInstance;
var appcInstance;

var testCampaign = {
    bidId: 123,
    price: 1,
    budget: 10,
    startDate: 500000,
    endDate: 600000,
    valid: true,
    owner: '0x1DD02B96E9D55E16c646d2F21CA93A705ac667Bf',
    ipValidator: 1,
    filters: {
        packageName: "com.test.pn",
        countries: [409], // PT
        vercodes: [1, 2]
    }
};

var expectRevert = RegExp('revert');

contract('AdvertisementFinance', function(accounts) {
    beforeEach('Setting Advertisement test...',async () => {
        appcInstance = await AppCoins.new();
        AdvertisementFinanceInstance = await AdvertisementFinance.new(appcInstance.address);

        AdvertisementFinanceInstance.setAdsStorageAddress(accounts[9]);
        TestUtils.setAppCoinsInstance(appcInstance);
        TestUtils.setContractInstance(AdvertisementFinanceInstance);

    });


    it('should store a dev balance if it is done from a valid address', async function () {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[2];

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget, { from: allowedAddress});

        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});

    })
    it('should revert if the balance is updated by anyone other than the Advertisement Contract', async function () {
    	var reverted = false;
        var invalidAddress = accounts[2];

        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[2];

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget, { from: allowedAddress});

        await AdvertisementFinanceInstance
        .increaseBalance(developer, budget)
        .catch(
    		(err) => {
    			reverted = expectRevert.test(err.message);
    		});

    	expect(reverted).to.be.equal(true,"Revert expected");
    });

    it('should allow the contract owner to refund a developer', async function(){
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[2];
        var initDevBalance = await TestUtils.getBalance(developer);
       
        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);
        
        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget);
       
        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});
        var contractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);
        expect(contractBalance).to.be.equal(budget,"Contract should hold funds after transfer");
        
        await AdvertisementFinanceInstance.withdraw(developer,budget);
        var finalDevBalance = await TestUtils.getBalance(developer);
        var contractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);

        expect(contractBalance).to.be.equal(0,"Contract should hold no funds after refund");
        expect(finalDevBalance).to.be.equal(initDevBalance+budget, "Developer should have the funds he deposited");

    });
    


    it('should allow the Advertisement Contract to refund a developer', async function() {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[2];
        var initDevBalance = await TestUtils.getBalance(developer);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget);

        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});
        
        await AdvertisementFinanceInstance.withdraw(developer,budget,{ from: allowedAddress});
        var finalDevBalance = await TestUtils.getBalance(developer);

        expect(finalDevBalance).to.be.equal(initDevBalance+budget);

    });

    it('should allow the contract owner to reset the contract refunding the developers with open campaigns', async function() {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developers = new Array();
        developers.push(accounts[2]);
        developers.push(accounts[3]);
        var ownerInitialBalance =  await TestUtils.getBalance(accounts[0]);
        var initialbalance2 = await TestUtils.getBalance(developers[0]);
        var initialbalance3 = await TestUtils.getBalance(developers[1]);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, developers.length*budget)
        
        for (var i = 0; i < developers.length ; i++) {
            await AdvertisementFinanceInstance.increaseBalance(developers[i], budget,{ from: allowedAddress});
        }

        expect(await TestUtils.getBalance(AdvertisementFinanceInstance.address)).to.be.equal(developers.length * budget,"Coins were not transfered to Finance contract");
        
        await AdvertisementFinanceInstance.reset();

        expect(await TestUtils.getBalance(AdvertisementFinanceInstance.address)).to.be.equal(0,"Coins were not transfered out of the Finance contract");
        expect(await TestUtils.getBalance(accounts[2])).to.be.equal(initialbalance2 + budget,"Coins were not transfered to developer 2");
        expect(await TestUtils.getBalance(accounts[3])).to.be.equal(initialbalance3 + budget,"Coins were not transfered to developer 3");
      
    });

    it('should allow the Advertisement Contract to reset the contract refunding the developers with open campaigns', async function() {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developers = new Array();
        developers.push(accounts[2]);
        developers.push(accounts[3]);
        var initialbalance2 = await TestUtils.getBalance(accounts[2]);
        var initialbalance3 = await TestUtils.getBalance(accounts[3]);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);
        
        await appcInstance.transfer(AdvertisementFinanceInstance.address, developers.length*budget)

        for (var i = 0; i < developers.length ; i++) {
            await AdvertisementFinanceInstance.increaseBalance(developers[i], budget,{ from: allowedAddress});
        }

        expect(await TestUtils.getBalance(AdvertisementFinanceInstance.address)).to.be.equal(developers.length*budget,"Coins were not transfered to Finance contract");
        
        await AdvertisementFinanceInstance.reset({ from: allowedAddress });

        expect(await TestUtils.getBalance(accounts[2])).to.be.equal(initialbalance2 + budget,"Coins were not transfered to developer 2");
        expect(await TestUtils.getBalance(accounts[3])).to.be.equal(initialbalance3 + budget,"Coins were not transfered to developer 3");
        expect(await TestUtils.getBalance(AdvertisementFinanceInstance.address)).to.be.equal(0,"Coins were not transfered out of the Finance contract");
      
    });

    it('should allow the Advertisement Contract to make payments through the Advertisement Finance Contract', async function() {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[2];
        var initDevBalance = TestUtils.getBalance(developer);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget);

        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});
        
        await AdvertisementFinanceInstance.pay(developer, accounts[3], budget*0.1, { from: allowedAddress});
        await AdvertisementFinanceInstance.pay(developer, accounts[4], budget*0.85, { from: allowedAddress});
        await AdvertisementFinanceInstance.pay(developer, accounts[5], budget*0.05, { from: allowedAddress});

        var contractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);
        expect(contractBalance).to.be.equal(0,'Contract should have no money remaining');

        expect(await TestUtils.getBalance(accounts[3])).to.be.equal(budget*0.1);
        expect(await TestUtils.getBalance(accounts[4])).to.be.equal(budget*0.85);
        expect(await TestUtils.getBalance(accounts[5])).to.be.equal(budget*0.05);
    });
    
    it('should revert if paying from a developer without coins deposited', async function() {
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[4];
        var initDevBalance = TestUtils.getBalance(developer);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget);

        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});
        
        await AdvertisementFinanceInstance.pay(developer, accounts[3], budget*0.1, { from: allowedAddress});
        await AdvertisementFinanceInstance.pay(developer, accounts[4], budget*0.85, { from: allowedAddress});
        await AdvertisementFinanceInstance.pay(developer, accounts[5], budget*0.05, { from: allowedAddress});

        var contractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);
        expect(contractBalance).to.be.equal(0,'Contract should have no money remaining');

        expect(await TestUtils.getBalance(accounts[3])).to.be.equal(budget*0.1, 'AppStore did not receive the funds');
        expect(await TestUtils.getBalance(accounts[4])).to.be.equal(budget*0.85, 'User did not receive the funds');
        expect(await TestUtils.getBalance(accounts[5])).to.be.equal(budget*0.05, 'OEM did not receive the funds');
        await AdvertisementFinanceInstance.pay(developer, accounts[3], budget*0.1)
            .catch((err) => {
                reverted = expectRevert.test(err.message);
            });

        expect(reverted).to.be.equal(true,"Revert expected");
    });

    it('should allow to update Storage and reset finance', async function(){
        var allowedAddress = accounts[1];
        var budget = 50000000000000000;
        var developer = accounts[4];
        var initDevBalance =await TestUtils.getBalance(developer);

        await AdvertisementFinanceInstance.setAdsContractAddress(allowedAddress);

        await appcInstance.transfer(AdvertisementFinanceInstance.address, budget);

        await AdvertisementFinanceInstance.increaseBalance(developer, budget,{ from: allowedAddress});
            
        var initContractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);

        await AdvertisementFinanceInstance.setAdsStorageAddress(accounts[8]);

        var finalContractBalance = await TestUtils.getBalance(AdvertisementFinanceInstance.address);

        expect(await TestUtils.getBalance(AdvertisementFinanceInstance.address)).to.be.equal(0, 'Contract should refund developers');
        expect(await TestUtils.getBalance(developer)).to.be.equal(initDevBalance + budget, 'Developer should receive his share');

    })
    
});
