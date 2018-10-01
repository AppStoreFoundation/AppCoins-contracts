var Advertisement = artifacts.require("./Advertisement.sol");
var AdvertisementStorage = artifacts.require("./AdvertisementStorage.sol");
var AdvertisementFinance = artifacts.require("./AdvertisementFinance.sol");
var AppCoins = artifacts.require("./AppCoins.sol");
var chai = require('chai');
var web3 = require('web3');
var TestUtils = require('./TestUtils.js');
var expect = chai.expect;
var chaiAsPromissed = require('chai-as-promised');
chai.use(chaiAsPromissed);

var BigNumber = require('big-number');
var appcInstance;
var addInstance;
var adFinanceInstance;
var devShare = 0.85;
var appStoreShare = 0.1;
var oemShare = 0.05;

var expectRevert = RegExp('revert');

var campaignPrice;
var campaignBudget;
var startDate;
var endDate;
var packageName;

function convertCountryCodeToIndex(countryCode) {
	var begin = new Buffer("AA");
	var one = new Buffer("A");
	var buffer = new  Buffer(countryCode);
	var first = new  Buffer(countryCode[0]);

	return buffer.readUInt16BE() - begin.readUInt16BE() - 230*(first.readUInt8()-one.readUInt8());
}

contract('Advertisement', function(accounts) {
  beforeEach('Setting Advertisement test...',async () => {

		nonceWrongTs = [ 70356,
						45021,
						32669,
						37785,
						15906,
						10179,
						17014,
						167317,
						63419,
						381,
						31182,
						52274];

		nonceList = [ 75824,
					111779,
					188882,
					15136,
					5936,
					41188,
					55418,
					162348,
					29001,
					99111,
					119649,
					30337];

		timestamp = [ 1524042553578,
					  1524042563843,
					  1524042574305,
					  1524042584823,
					  1524042595355,
					  1524042605651,
					  1524042615837,
					  1524042626245,
					  1524042636491,
					  1524042646740,
					  1524042657099,
					  1524042667471 ];

		wrongTimestamp = [ 1524042553761,
						  1524042554294,
						  1524042554557,
						  1524042555200,
						  1524042555437,
						  1524042555714,
						  1524042556061,
						  1524042556318,
						  1524042556654,
						  1524042557044,
						  1524042557465,
						  1524042557509 ];

        appcInstance = await AppCoins.new();
        AdvertisementStorageInstance = await AdvertisementStorage.new();
		adFinanceInstance = await AdvertisementFinance.new(appcInstance.address);
		addInstance = await	Advertisement.new(appcInstance.address, AdvertisementStorageInstance.address,adFinanceInstance.address);

        await adFinanceInstance.setAllowedAddress(addInstance.address);
        await adFinanceInstance.setAdsStorageAddress(AdvertisementStorageInstance.address);
        await AdvertisementStorageInstance.addAddressToWhitelist(addInstance.address);

		TestUtils.setAppCoinsInstance(appcInstance);
		TestUtils.setContractInstance(addInstance);

		campaignPrice = 50000000000000000;
		campaignBudget = 1000000000000000000;

		var countryList = []

		countryList.push(convertCountryCodeToIndex("PT"))
		countryList.push(convertCountryCodeToIndex("GB"))
		countryList.push(convertCountryCodeToIndex("FR"))

        countryCode = countryList[0]

		startDate = 20;
		endDate = 1922838059980;
		packageName = "com.facebook.orca";

		await appcInstance.approve(addInstance.address,campaignBudget);

		await addInstance.createCampaign(packageName,countryList,[1,2],campaignPrice,campaignBudget,startDate,endDate);

		await appcInstance.transfer(accounts[1],campaignBudget);
		await appcInstance.approve(addInstance.address,campaignBudget,{ from : accounts[1]});
		await addInstance.createCampaign(packageName,countryList,[1,2],campaignPrice,campaignBudget,startDate,endDate, { from : accounts[1]});

		examplePoA = new Object();
		examplePoA.packageName = "com.facebook.orca";
		// Need to get bid generated by create Campaign
		examplePoA.bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000000");
		examplePoA.timestamp = new Array();
		examplePoA.nonce = new Array();

		example2PoA = new Object();
		example2PoA.packageName = "com.facebook.orca";
		example2PoA.bid = examplePoA.bid;
		example2PoA.timestamp = new Array();
		example2PoA.nonce = new Array();

		wrongTimestampPoA = new Object();
		wrongTimestampPoA.packageName = "com.facebook.orca";
		wrongTimestampPoA.bid = examplePoA.bid;
		wrongTimestampPoA.timestamp = new Array();
		wrongTimestampPoA.nonce = new Array();

		wrongNoncePoA = new Object();
		wrongNoncePoA.packageName = examplePoA.packageName;
		wrongNoncePoA.bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000000");
		wrongNoncePoA.timestamp = new Array();
		// any nounce list except the correct one will work here
		wrongNoncePoA.nonce = new Array();

		walletName = "com.asfoundation.wallet.dev"

		for(var i = 0; i < 12; i++){
			//var timeNow = new Date().getTime();
			var time = timestamp[i];
			//var time = 158326;

			var wrongTime = wrongTimestamp[i];
			//var correctNonce = Math.floor(Math.random()*520*i);
			var correctNonce = nonceList[i];
			var wrongTimeNonce = nonceWrongTs[i];
			examplePoA.timestamp.push(time);
			examplePoA.nonce.push(correctNonce);
			example2PoA.timestamp.push(time);
			example2PoA.nonce.push(correctNonce);
			wrongTimestampPoA.timestamp.push(wrongTime);
			wrongTimestampPoA.nonce.push(wrongTimeNonce);
			wrongNoncePoA.timestamp.push(time);
			wrongNoncePoA.nonce.push(nonceWrongTs[i]);
		}
	});

  	it('should create a campaign', async function() {
		var bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000002");
  		var countryList = []
  		var contractBalance = await TestUtils.getBalance(adFinanceInstance.address);

		countryList.push(convertCountryCodeToIndex("PT"))
		countryList.push(convertCountryCodeToIndex("GB"))
		countryList.push(convertCountryCodeToIndex("FR"))
		countryList.push(convertCountryCodeToIndex("PA"))

		await appcInstance.approve(addInstance.address,campaignBudget);

		var eventsStorage = AdvertisementStorageInstance.allEvents();
		var eventsInfo = addInstance.allEvents();
		var packageName1 = "com.instagram.android";
		await addInstance.createCampaign(packageName1,countryList,[1,2],campaignPrice,campaignBudget,20,1922838059980);

		var eventStorageLog = await new Promise(
				function(resolve, reject){
		        eventsStorage.watch(function(error, log){ eventsStorage.stopWatching(); resolve(log); });
		    });
		var eventInfoLog = await new Promise(
				function(resolve, reject){
		        eventsInfo.watch(function(error, log){ eventsInfo.stopWatching(); resolve(log); });
		    });

	    assert.equal(eventStorageLog.event,"CampaignCreated", "Event must be a CampaignCreated event");
	    assert.equal(eventStorageLog.args.bidId,bid,"BidId on campaign create event is not correct");
	    assert.equal(eventStorageLog.args.price,campaignPrice,"Price on campaign create event is not correct");
	    assert.equal(eventStorageLog.args.budget,campaignBudget,"Budget on campaign create event is not correct");
	    assert.equal(eventStorageLog.args.startDate,startDate,"Start date on campaign create event is not correct");
	    assert.equal(eventStorageLog.args.endDate,endDate,"Finish date on campaign create event is not correct");

		assert.equal(eventInfoLog.event,"CampaignInformation", "Event must be a CampaignInformation event");
	    assert.equal(eventInfoLog.args.bidId,bid,"BidId on campaign info event is not correct");
	    assert.equal(eventInfoLog.args.owner,accounts[0],"owner on campaign info event is not correct");
	    assert.equal(eventInfoLog.args.packageName,packageName1,"Package name on campaign info event is not correct");
	    assert.equal(eventInfoLog.args.countries[0],countryList[0],"Countries 1 on campaign info event are not correct");
	    assert.equal(eventInfoLog.args.countries[1],countryList[1],"Countries 2 on campaign info event are not correct");
	    assert.equal(eventInfoLog.args.countries[2],countryList[2],"Countries 3 on campaign info event are not correct");


		var budget = await addInstance.getBudgetOfCampaign.call(bid);

		await addInstance.createCampaign("com.instagram.android",countryList,[1,2],campaignPrice,campaignBudget,20,1922838059980);

		expect(JSON.parse(budget)).to.be.equal(campaignBudget,"Campaign budget is incorrect");
		expect(await TestUtils.getBalance(adFinanceInstance.address)).to.be.equal(contractBalance+campaignBudget,"AppCoins are not being stored on AdvertisementFinance.");
		expect(await TestUtils.getBalance(addInstance.address)).to.be.equal(0,"AppCoins should not be stored on Advertisement contract.");
  	});

	it('should cancel a campaign as contract owner', async function () {
		var bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000001");

		var userInitBalance = await TestUtils.getBalance(accounts[1]);
		var contractBalance = await TestUtils.getBalance(adFinanceInstance.address);
		var campaignBalance = JSON.parse(await addInstance.getBudgetOfCampaign.call(bid));
		var contractBalance = await TestUtils.getBalance(adFinanceInstance.address);
		await addInstance.cancelCampaign(bid);

		var newUserBalance = await TestUtils.getBalance(accounts[1]);
		var newContractBalance = await TestUtils.getBalance(adFinanceInstance.address);
		var newCampaignBalance = JSON.parse(await addInstance.getBudgetOfCampaign.call(bid));
		var validity =  await addInstance.getCampaignValidity.call(bid);


		expect(validity).to.be.equal(false);
		expect(await TestUtils.getBalance(adFinanceInstance.address)).to.be.equal(contractBalance-campaignBudget,"AppCoins are not being stored on AdvertisementFinance.");
		expect(campaignBalance).to.be.not.equal(0,"Campaign balance is 0");
		expect(newCampaignBalance).to.be.equal(0,"Campaign balance after cancel should be 0");
		expect(userInitBalance+campaignBalance).to.be.equal(newUserBalance,"User balance should be updated");
		expect(contractBalance-campaignBalance).to.be.equal(newContractBalance,"Contract balance not updated");
	})

	it('should cancel a campaign as campaign owner', async function () {
		var bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000001");

		var userInitBalance = await TestUtils.getBalance(accounts[1]);
		var contractBalance = await TestUtils.getBalance(adFinanceInstance.address);
		var campaignBalance = JSON.parse(await addInstance.getBudgetOfCampaign.call(bid));

		await addInstance.cancelCampaign(bid, { from : accounts[1]});

		var newUserBalance = await TestUtils.getBalance(accounts[1]);
		var newContractBalance = await TestUtils.getBalance(adFinanceInstance.address);
		var newCampaignBalance = JSON.parse(await addInstance.getBudgetOfCampaign.call(bid));
		var validity =  await addInstance.getCampaignValidity.call(bid);

		expect(validity).to.be.equal(false);
		expect(await TestUtils.getBalance(adFinanceInstance.address)).to.be.equal(contractBalance-campaignBudget,"AppCoins are not being stored on AdvertisementFinance.");
		expect(await TestUtils.getBalance(addInstance.address)).to.be.equal(0,"AppCoins should not be stored on Advertisement contract.");
		expect(campaignBalance).to.be.not.equal(0,"Campaign balance is 0");
		expect(newCampaignBalance).to.be.equal(0,"Campaign balance after cancel should be 0");
		expect(userInitBalance+campaignBalance).to.be.equal(newUserBalance,"User balance should be updated");
		expect(contractBalance-campaignBalance).to.be.equal(newContractBalance,"Contract balance not updated");
	})

	it('should revert cancel campaign if it is not issued from campaign owner nor from contract owner', async function () {
		var reverted = false;
		var bid = web3.utils.toHex("0x0000000000000000000000000000000000000000000000000000000000000001");
		await addInstance.cancelCampaign(bid,{ from : accounts[2]}).catch(
			(err) => {
				reverted = expectRevert.test(err.message);
			});
		expect(reverted).to.be.equal(true,"Revert expected");
	});

	it('should revert and emit an error event when a campaign is created without allowance', async function(){
		var userInitBalance = await TestUtils.getBalance(accounts[0]);

		await TestUtils.expectErrorMessageTest('Not enough allowance',async () => {
			var countryList = [];
			countryList.push(convertCountryCodeToIndex("GB"));
			countryList.push(convertCountryCodeToIndex("FR"));
			await addInstance.createCampaign.sendTransaction("org.telegram.messenger",countryList,[1,2],campaignPrice,campaignBudget,20,1922838059980);
		})

		var newUserBalance = await TestUtils.getBalance(accounts[0]);

		expect(userInitBalance).to.be.equal(newUserBalance);

	});

	it('should emit an event when PoA is received', function () {
		return addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode).then( instance => {
			expect(instance.logs.length).to.be.equal(1);
		});
	});

	it('should set the Campaign validity to false when the remaining budget is smaller than the price', function () {
		return addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode).then( instance => {
			expect(instance.logs.length).to.be.equal(1);
		});

		expect(addInstance.valid).to.be.false;
	});

	it('should registerPoA and transfer the equivalent to one installation to the user registering a PoA', async function () {
		var userInitBalance = await TestUtils.getBalance(accounts[0]);
		var appSInitBalance = await TestUtils.getBalance(accounts[1]);
		var oemInitBalance = await TestUtils.getBalance(accounts[2]);
		var campaignBudget = JSON.parse(await addInstance.getBudgetOfCampaign.call(examplePoA.bid));
		var contractBalance = await TestUtils.getBalance(adFinanceInstance.address);

		await addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode);

		var newUserBalance = await TestUtils.getBalance(accounts[0]);
		var newAppStoreBalance = await TestUtils.getBalance(accounts[1]);
		var newOemBalance = await TestUtils.getBalance(accounts[2]);
		var newCampaignBudget = JSON.parse(await addInstance.getBudgetOfCampaign.call(examplePoA.bid));
		var newContractBalance = await TestUtils.getBalance(adFinanceInstance.address);

		expect(campaignBudget-campaignPrice).to.be.equal(newCampaignBudget,"Campaign budget not updated.");
		expect(contractBalance-campaignPrice).to.be.equal(newContractBalance,"Contract balance not updated.");
		expect(await TestUtils.getBalance(addInstance.address)).to.be.equal(0,"AppCoins should not be stored on Advertisement contract.");

		var error = new Number("1.99208860077274e-9");
		var expectedUserBalance = userInitBalance+(campaignPrice*devShare)
		expect(newUserBalance).to.be.within(expectedUserBalance - (expectedUserBalance*error), expectedUserBalance + (expectedUserBalance*error),"User balance not updated.");

		expect(appSInitBalance+(campaignPrice*appStoreShare)).to.be.equal((newAppStoreBalance),"AppStore balance not updated.");
		expect(oemInitBalance+(campaignPrice*oemShare)).to.be.equal((newOemBalance),"OEM balance not updated.");
	});

	it('should revert registerPoA and emit an error event when the campaing is invalid', async () => {


		await addInstance.cancelCampaign(examplePoA.bid);
		await TestUtils.expectErrorMessageTest("Registering a Proof of attention to a invalid campaign", async () => {
			await addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode);
		})
	});

	it('should revert registerPoA and emit an error event when nonce list and timestamp list have diferent lengths', async function () {
		var userInitBalance = await TestUtils.getBalance(accounts[0]);


		await TestUtils.expectErrorMessageTest("Nounce list and timestamp list must have same length", async () => {
			await addInstance.registerPoA.sendTransaction(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce.splice(2,3),accounts[1],accounts[2],walletName, countryCode);
		})
		var newUserBalance = await TestUtils.getBalance(accounts[0]);
		expect(userInitBalance).to.be.equal(newUserBalance);

	});

	it('should revert registerPoA and emit an error event when same user sends duplicate registerPoA', async function () {

		await addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode);

		var userInitBalance = await TestUtils.getBalance(accounts[0]);

		await TestUtils.expectErrorMessageTest("User already registered a proof of attention for this campaign", async () =>{
			await addInstance.registerPoA(example2PoA.packageName,example2PoA.bid,example2PoA.timestamp,example2PoA.nonce,accounts[1],accounts[2],walletName, countryCode);
		})
		var newUserBalance = await TestUtils.getBalance(accounts[0]);
		expect(userInitBalance).to.be.equal(newUserBalance);

	});

	it('should revert registerPoA and emit an error event if timestamps are not spaced exactly 10 secounds from each other', async function () {

        var userInitBalance = await TestUtils.getBalance(accounts[0]);

		await TestUtils.expectErrorMessageTest("Timestamps should be spaced exactly 10 secounds", async () => {
			await addInstance.registerPoA(wrongTimestampPoA.packageName,wrongTimestampPoA.bid,wrongTimestampPoA.timestamp,wrongTimestampPoA.nonce,accounts[1],accounts[2],walletName, countryCode);
		});
		var newUserBalance = await TestUtils.getBalance(accounts[0]);
		expect(userInitBalance).to.be.equal(newUserBalance);

	})

    // TODO: enable this test after we start verifying nouces when registering PoAs.
	// it('should revert registerPoA and emit an error event if nounces do not generate correct leading zeros', async function () {
    //
    //     var userInitBalance = await TestUtils.getBalance(accounts[0]);
    //
	// 	await TestUtils.expectErrorMessageTest("Incorrect nounces for submited proof of attention", async () => {
	// 		await addInstance.registerPoA(wrongNoncePoA.packageName,wrongNoncePoA.bid,wrongNoncePoA.timestamp,wrongNoncePoA.nonce,accounts[1],accounts[2],walletName, countryCode);
	// 	});
	// 	var newUserBalance = await TestUtils.getBalance(accounts[0]);
	// 	expect(userInitBalance).to.be.equal(newUserBalance);
    //
	// })

	it('should revert registerPoA and emit an error event if PoA pairs are not exactly 12', async () => {
		var userInitBalance = await TestUtils.getBalance(accounts[0]);

		examplePoA.timestamp.pop();
		examplePoA.nonce.pop();

		await TestUtils.expectErrorMessageTest("Proof-of-attention should have exactly 12 proofs", async () => {
			await addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,accounts[1],accounts[2],walletName, countryCode);
		});

		var newUserBalance = await TestUtils.getBalance(accounts[0]);
		expect(userInitBalance).to.be.equal(newUserBalance);

	})

	it('should upgrade advertisement storage and cancel all campaigns', async function() {
		var addsBalance = await TestUtils.getBalance(AdvertisementStorageInstance.address);
		var user0Balance = await TestUtils.getBalance(accounts[0]);
		var user1Balance = await TestUtils.getBalance(accounts[1]);


        AdvertisementStorageInstance = await AdvertisementStorage.new();

		await addInstance.upgradeStorage(AdvertisementStorageInstance.address);
        await AdvertisementStorageInstance.addAddressToWhitelist(addInstance.address);

		var addsFinalBalance = await TestUtils.getBalance(AdvertisementStorageInstance.address);
		var user0FinalBalance = await TestUtils.getBalance(accounts[0]);
		var user1FinalBalance = await TestUtils.getBalance(accounts[1]);
		var bidIdList = await addInstance.getBidIdList.call();

		expect(addsFinalBalance).to.be.equal(0,'Advertisement contract balance should be 0');
		expect(await TestUtils.getBalance(adFinanceInstance.address)).to.be.equal(0,"AdvertisementFinance contract balance should be 0");
		expect(user0FinalBalance).to.be.equal(user0Balance+campaignBudget,'User 0 should receive campaignBudget value of his campaign');
		expect(user1FinalBalance).to.be.equal(user1Balance+campaignBudget,'User 1 should receive campaignBudget value of his campaign');
		expect(bidIdList.length).to.be.equal(0,'Campaign list should be 0');
	})


	it('should upgrade advertisement contract without changing storage nor finance contracts', async function() {
		addInstance = await	Advertisement.new(appcInstance.address, AdvertisementStorageInstance.address,adFinanceInstance.address);

		var oem = accounts[2];
		var user = accounts[3];
		var appstore = accounts[4];

		var balanceAppS = await TestUtils.getBalance(appstore);
		var balanceOEM = await TestUtils.getBalance(oem);
		var balanceUser = await TestUtils.getBalance(user);

		await appcInstance.transfer(accounts[1],campaignBudget);
		await adFinanceInstance.setAllowedAddress(addInstance.address);

		var budget = await addInstance.getBudgetOfCampaign.call(examplePoA.bid);

		expect(JSON.parse(budget)).to.be.equal(campaignBudget,"Campaign budget is incorrect");

		await AdvertisementStorageInstance.addAddressToWhitelist(addInstance.address);

		return addInstance.registerPoA(examplePoA.packageName,examplePoA.bid,examplePoA.timestamp,examplePoA.nonce,appstore,oem,walletName, countryCode, { from : user }).then( async instance => {
			expect(instance.logs.length).to.be.equal(1);
			expect(await TestUtils.getBalance(appstore)).to.be.equal(balanceAppS + campaignPrice*appStoreShare, 'AppStore did not receive reward');
			expect(await TestUtils.getBalance(oem)).to.be.equal(balanceOEM + campaignPrice*oemShare,'OEM did not receive reward');
			expect(await TestUtils.getBalance(user)).to.be.equal(balanceUser + campaignPrice*devShare,'User did not receive reward');
		});
	})

	it('should upgrade advertisement finance and transfer campaign money to the new contract', async function () {
		var addsBalance = await TestUtils.getBalance(AdvertisementStorageInstance.address);
		var oldFinanceInitBalance = await TestUtils.getBalance(adFinanceInstance.address);
		
		var advertisementFinanceInstance = await AdvertisementFinance.new(appcInstance.address);
		
		await advertisementFinanceInstance.setAllowedAddress.sendTransaction(addInstance.address)

		var newFinanceInitBalance = await TestUtils.getBalance(advertisementFinanceInstance.address);
		var bidIdListBeforeUpgrade = await addInstance.getBidIdList.call();
		
		expect(newFinanceInitBalance).to.be.equal(0,'New advertisement finance contract should have an initial balance of 0');

		await addInstance.upgradeFinance(advertisementFinanceInstance.address);

		var oldFinanceFinalBalance = await TestUtils.getBalance(adFinanceInstance.address);
		var newFinanceFinalBalance = await TestUtils.getBalance(advertisementFinanceInstance.address);

		var bidIdListAfterUpgrade = await addInstance.getBidIdList.call();
		
		expect(newFinanceFinalBalance).to.equal(oldFinanceInitBalance,'New finance contract after upgrade should have the same balance as the old finance contract before upgrade');
		expect(oldFinanceFinalBalance).to.equal(0,'Old finance contract should have a balance of 0 after upgrade');
		expect(bidIdListAfterUpgrade).to.eql(bidIdListBeforeUpgrade,'Bid Id List should suffer no change from this upgrade');

		var devsBalance = {}
		var devsList = []

		for(var i = 0; i < bidIdListAfterUpgrade.length; i++){
			var id = bidIdListAfterUpgrade[i];
			var dev = await addInstance.getOwnerOfCampaign.call(id);
			var campaignBalance = JSON.parse(await addInstance.getBudgetOfCampaign.call(id));

			if(devsList.indexOf(dev) < 0){
				devsBalance[dev] = campaignBalance;
				devsList.push(dev);
			} else {
				devsBalance[dev] += campaignBalance;
			}

		}

		for(var j = 0; j < devsList.length; j++){
			var dev = devsList[j];
			await advertisementFinanceInstance.withdraw.sendTransaction(dev,devsBalance[dev]);
		}
		
		var newFinanceResetBalance = await TestUtils.getBalance(advertisementFinanceInstance.address);
		expect(newFinanceResetBalance).to.be.equal(0,'Each developer should have the same money each deposited after the upgrade on the new finance contract');

	})
});
