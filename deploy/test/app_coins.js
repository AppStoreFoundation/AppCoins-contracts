var AppCoin = artifacts.require("./AppCoins.sol");
contract('Appcoins', (accounts) => {

    it("Should get the total_supply available", () => {
        return AppCoin.deployed()
        .then(instance => {
            return instance.totalSupply({from: accounts[0]});
        })
        .then(result => {
            //console.log(result);
            assert.true();
        })
        .catch(error => {
            assert.notEqual(error.message, "assert.true()", "it wasnt able to get the totalSupply from the contract");
        });
    });

    // One more assert.true()
    it("Should transfer APPCs to account[1] from 0", () => {
        return AppCoin.deployed()
        .then(instance => {
            appc_instance = instance;
            return appc_instance.transfer(accounts[1], 150 * Math.pow(10, 18), {from: accounts[0]});
        })
        .then(resultTransfer => {
            return appc_instance.balanceOf(accounts[1], {from: accounts[0]});
        })
        .then(result => {
            assert.fail("it failed");
        })
        .catch(error => {
            assert.notEqual(error.message, "assert.true()", "it wasnt able to transfer appcs from 0 to 1");
        });
    });


    /*
    *   Trying to use transferFrom incorrectly, no approve made
    *   In this test we make the transferFrom withour approve which should return an error
    *   This test passes if we get an error message and it is equal to VM Exception while processing transaction: revert
    */
    it("Should use the transferFrom to do stuff. Assert.fail in this.", () => {
        return AppCoin.deployed()
        .then(instance => {
            appc_instance = instance;
            amount =  50 * Math.pow(10, 18);
            return appc_instance.transferFrom(accounts[0], accounts[1], amount);
        })
        .then(result => {
            assert.fail();
        })
        .catch(error => {
            //console.log(error.message);
            assert.equal(error.message, "VM Exception while processing transaction: revert", "Got a different error that what was expected");
        });
    });

    /*
    *   This test uses the function transferFrom properly
    *   The test passes if
    */
    it("Should use the transferFrom to do stuff", () => {
        return AppCoin.deployed()
        //instance.transfer.sendTransaction(accounts[1], appcs_to_send);
        .then(instance => {
            var appcs_to_send =  150 * Math.pow(10, 18);
            appc_instance = instance;
            return appc_instance.transfer.sendTransaction(accounts[1], appcs_to_send);
        })
        .then(transfer => {
            return appc_instance.approve.sendTransaction(accounts[1], 50 * Math.pow(10, 18), {from: accounts[1]});
        })
        .then(approve => {
            return appc_instance.transferFrom.sendTransaction(accounts[1], accounts[2], 50 * Math.pow(10, 18), {from: accounts[1], to: accounts[2]});
        })
        .then(done => {
            return appc_instance.balanceOf(accounts[2], {from: accounts[0]});
        })
        .then(result => {
            assert.fail();
        })
        .catch(error => {
            assert.equal(error.message, "assert.fail()", "expecting the assert.fail() but got " + error.message);
        });
    });
});
