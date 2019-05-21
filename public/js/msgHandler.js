__resources__["/msgHandler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {

	var pomelo   = window.pomelo;
	exports.init = init;

	function init()
	{
		/**
		 * Handle kick out messge, occours when the current player is kicked out
		 */
		pomelo.on('onKick', function() {
			console.log('You have been kicked offline for the same account logined in other place.');
			console.debug(arguments);
//			location.reload();
		});


		/**
		 * Handle disconect message, occours when the client is disconnect with servers
		 * @param reason {Object} The disconnect reason
		 */
		pomelo.on('disconnect', function(reason) {
			//location.reload();
		});
	}
}};
