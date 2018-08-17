var appcInstance = null;
var contractInstance = null;

module.exports = {
	setAppCoinsInstance: function (instance){
		appcInstance = instance;
	},
	setContractInstance: function (instance){
		contractInstance = instance;
	},
	getBalance: async function (account) {
			var balance = await appcInstance.balanceOf.call(account);
			return JSON.parse(balance);
		},
	expectErrorMessageTest: async function (errorMessage,callback){
			var events = contractInstance.allEvents();

			await callback();
			var eventLog = await new Promise(
					function(resolve, reject){
			        events.watch(function(error, log){ events.stopWatching(); resolve(log); });
			    });

		    assert.equal(eventLog.event, "Error", "Event must be an Error");
		    assert.equal(eventLog.args.message, errorMessage, "Event message should be: "+errorMessage);
		},
	expectEventTest: async function (eventName, callback){
		var events = contractInstance.allEvents();

		await callback();
		var eventLog = await new Promise(
				function(resolve,reject){
					events.watch(function(error,log){ events.stopWatching(); resolve(log); });
		});

		assert.equal(eventLog.event, eventName, "Expected event of type "+eventName);
	}
}
