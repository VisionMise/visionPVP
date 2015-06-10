/**
 * VisionPVP
 *
 * @author 			VisionMise
 * @version  		0.1.2
 * @description 	First Working Version :: Please see website for more information
 * 
 * @source 			https://github.com/VisionMise/visionPVP/releases/tag/v0.1.2
 * @website			http://visionmise.github.io/visionPVP/
 * 
 * @param  {Oxide.Plugin} 	pluginObject
 * @param  {Oxide.Config} 	configObject
 * @param  {Oxide.rust}		rust
 * @param  {Oxide.DataFile}	data
 * @return {visionPVP_api}
 */
var visionPVP_api 		= function(pluginObject, configObject, rust, data) {

	/**
	 * Time API
	 * @type {visionPVP_time_api}
	 */
	this.time 			= {};

	
	/**
	 * Global Rust Object
	 * @type {Oxide.Rust}
	 */
	this.rust 			= {};


	/**
	 * Global Plugin Object
	 * @type {Oxide.Plugin}
	 */
	this.plugin 		= {};


	/**
	 * Global Config Object
	 * @type {Oxide.Config}
	 */
	this.config 		= {};


	/**
	 * Table
	 * @type {Oxide.DataFile.Table}
	 */
	this.table 			= {};	


	/**
	 * Global Data Object
	 * @type {Oxide.DataFile}
	 */
	this.data 			= {};


	/**
	 * Current PVP Mode
	 * @type {visionPVP_pvpmode_type}
	 */
	this.pvpMode 		= {};


	/**
	 * Is Ready
	 * @type {Boolean}
	 */
	this.ready 			= false;


	/**
	 * init
	 *
	 * Kuhl PVP API Initialization 
	 *@param  {Oxide.Plugin} 	pluginObject
 	 *@param  {Oxide.Config} 	configObject
 	 *@param  {Oxide.rust}		rust
 	 *@param  {Oxide.DataFile}	data
	 *@return {this}
	 */
	this.init 			= function(pluginObject, configObject, rust, data) {

		/**
		 * Print Startup
		 */
		this.console("visionPVP Started");


		/**
		 * Oxide Plugin Object
		 * @type {Oxide.Plugin}
		 */
		this.plugin 	= pluginObject;
		

		/**
		 * Oxide Config Object
		 * @type {Oxide.Config}
		 */
		this.config 	= configObject;
		
		
		/**
		 * Oxide Rust Object
		 * @type {Oxide.Rust}
		 */
		this.rust		= rust;


		/**
		 * Oxide Data Object
		 * @type {Oxide.DataFile}
		 */
		this.data 		= data;
		this.table 		= this.data.GetData("visionPVP") || {};
		

		/**
		 * Time API
		 * @type {visionPVP_time_api}
		 */
		this.time 		= new visionPVP_time_api();


		/**
		 * Set PVP Mode
		 */
		var pvpModeStr 	= configObject.Settings['pvpMode'];
		this.pvpMode 	= new visionPVP_pvpmode_type(pvpModeStr);
		this.console("visionPVP Mode set to " + this.pvpMode.label);


		/**
		 * Set Ready
		 */
		this.ready 		= true;


		/**
		 * Check PVE Settings
		 */
		var mode 		= this.checkPVPMode();
		this.console("PVE Mode: " + mode);

		
		/**
		 * Return this object
		 */
		return this;
	};


	/**
	 * Tick Event
	 * @return {Void}
	 */
	this.timerTick 		= function() {
		if (this.ready == false) return false;
		this.checkPVPMode();
	};


	/**
	 * CHeck the PVP Mode Settings
	 * @return {Integer} PVE Setting Value
	 */
	this.checkPVPMode 	= function() {
		var pve 		= this.serverPveMode();
		var msg 		= '';

		switch (this.pvpMode.name) {

			case 'pvp_night':
				if (this.time.isDay()) {
					if (!pve) {
						msg 	= "Shutting PVP Off. Its Daytime"
						this.serverPveSet(1, msg);
						this.console(msg);
					}
				} else {
					if (pve) {
						msg 	= "Turning PVP On. Its Night";
						this.serverPveSet(0, msg);
						this.console(msg);
					}
				}
			break;

			case 'pvp_day':
				if (this.time.isNight()) {
					if (!pve) {
						msg 	= "Shutting PVP Off. Its Night";
						this.serverPveSet(1, msg);
						this.console(msg);
					}
				} else {
					if (pve) {
						msg 	= "Turning PVP On. Its Daytime";
						this.serverPveSet(0, msg);
						this.console(msg);
					}
				}
			break;

			case 'pvp':
				if (pve) {
					msg 		= "Shutting PVE Off. In PVP Mode";
					this.serverPveSet(0, msg);
					this.console(msg);
				}
			break;

			case 'pve':
				if (!pve) {
					msg 		= "Shutting PVP Off. In PVE Mode";
					this.serverPveSet(1, msg);
					this.console(msg);
				}
			break;

			case 'random':
				var handler 	= new visionPVP_random_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

			case 'interval':
				var handler 	= new visionPVP_interval_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

			case 'event':
				var handler 	= new visionPVP_event_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

		}

		return this.serverPveMode();
	};


	/**
	 * Server PVE Mode
	 * @return {Boolean}
	 */
	this.serverPveMode 		= function() {
		var global 				= importNamespace("");
		var server 				= global.server;
		return server.pve;
	};


	/**
	 * Set Server PVE Mode
	 * @param  {Integer} newMode PVE Mode
	 * @return {Boolean} Global.Server.pve
	 */
	this.serverPveSet 		= function(newMode, reason) {
		var global 				= importNamespace("");
		var server 				= global.server;

		var oldMode 			= server.pve;
		server.pve 				= newMode;
		var changed 			= (oldMode != newMode);
		var currentMode 		= server.pve;

		if (currentMode == 1) {
			this.rust.BroadcastChat("Server", reason);
		} else {
			this.rust.BroadcastChat("Server", reason);
		}

		if (changed) {
			this.console("New Mode: " + newMode);
			this.console("Changed PVE mode to " + this.serverPveMode());
		}

		return currentMode;
	};


	/**
	 * Tester
	 * @return {Void}
	 */
	this.tester 		= function(param) {
		this.console('Test Result: ' + param.length + ' arguments passed');
	};


	/**
	 * Console
	 * Prints to Server Console
	 * @param  {String}
	 * @return {Void}
	 */
	this.console 		= function(text) {
		print("-- visionPVP: " + text);
	};


	/**
	 * Return this as an initialized object
	 */
	return this.init(pluginObject, configObject, rust, data);
};


/**
 * Time API
 * @return {visionPVP_time_api}
 */
var visionPVP_time_api 	= function() {

	/**
	 * Rust TOD_Sky Object
	 * @type {Global.TOD_Sky}
	 */
	this.sky 			= {};


	/**
	 * Initialize Time API
	 * @return {Void}
	 */
	this.init 			= function() {
		var global 				= importNamespace(""); 	
    	this.sky 				= global.TOD_Sky.get_Instance();
	};


	/**
	 * Hour of the day
	 * @return {Integer}
	 */
	this.hour			= function() {
		var hour = parseInt(this.sky.Cycle.Hour);
		return hour;
	};


	/**
	 * Time of Day
	 * @return {Float}
	 */
	this.time			= function() {
		var time = this.sky.Cycle.Hour;
		return time;
	};


	/**
	 * Is it daytime
	 * @return {Boolean}
	 */
	this.isDay 			= function() {
		return this.sky.IsDay;
	};


	/**
	 * Is is night time
	 * @return {Boolean}
	 */
	this.isNight 		= function() {
		return this.sky.IsNight;
	};


	/**
	 * Return this as an initialized object
	 */
	return this.init();
};


/**
 * PVP Mode Type
 * @param  {String}
 * @return {visionPVP_pvpmode_type}
 */
var visionPVP_pvpmode_type		= function(typeName) {

	/**
	 * Numeric Value of Mode
	 * @type {Integer}
	 */
	this.value 			= 0;


	/**
	 * Friendly Name of Mode
	 * @type {String}
	 */
	this.label 			= '';


	/**
	 * System Name of Mode
	 * @type {String}
	 */
	this.name 			= '';


	/**
	 * Reason
	 * @type {String}
	 */
	this.reason 		= '';


	/**
	 * Initialize
	 * @param  {String} typeName Can be the following:
	 * - pvp
	 * - pve
	 * - pvp-night
	 * - pvp-day
	 * - random 	// Not Implemented
	 * - event 		// Not Implemented
	 * - interval 	// Not Implemented
	 * @return {Void}
	 */
	this.init 			= function(typeName) {
		var compStr 	= typeName.toLowerCase().replace(" ", "");

		switch (compStr) {

			case 'pve':
				this.value 	= 0;
				this.label 	= 'PVE';
				this.name 	= 'pve';
			break;

			case 'pvp-day':
				this.value 	= 1;
				this.label 	= 'PVE at Night';
				this.name 	= 'pvp_day';
			break;

			case 'pvp-night':
				this.value 	= 2;
				this.label 	= 'PVP at Night';
				this.name 	= 'pvp_night';
			break;

			case 'pvp':
				this.value 	= 3;
				this.label 	= 'PVP';
				this.name 	= 'pvp';
			break;

			case 'random':
				this.value 	= -1;
				this.label 	= 'Random Times';
				this.name 	= 'random';
			break;

			case 'interval':
				this.value 	= 4;
				this.label 	= 'On an Interval';
				this.name 	= 'interval';
			break;

			case 'event':
				this.value 	= 5;
				this.label 	= 'On an Event';
				this.name 	= 'event';
			break;

		}
	};


	/**
	 * Return initialized self
	 */
	return this.init(typeName);
};


/**
 * Random PVP Mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject API Data
 * @return {visionPVP_random_handler}
 */
var visionPVP_random_handler		= function(dataObject, engine) {

	this.data 			= {};
	this.engine 		= {};

	this.init 			= function(dataObject, engine) {
		this.data 		= dataObject;
		this.engine		= engine;
	};


	this.mode 			= function() {

	};

	return this.init(dataObject, engine);
};


/**
 * Interval PVP Mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject API Data
 * @return {visionPVP_interval_handler}
 */
var visionPVP_interval_handler	= function(dataObject, engine) {

	this.data 			= {};
	this.engine 		= {};

	this.init 			= function(dataObject, engine) {
		this.data = dataObject;
		this.engine		= engine;
	};


	this.mode 			= function() {

	};

	return this.init(dataObject, engine);
};


/**
 * Event PVP Mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject API Data
 * @return {visionPVP_event_handler}
 */
var visionPVP_event_handler		= function(dataObject, engine) {

	this.data 			= {};
	this.engine 		= {};

	this.init 			= function(dataObject, engine) {
		this.data = dataObject;
		this.engine		= engine;
	};

	this.mode 			= function() {

	};

	return this.init(dataobject, engine);
};


/**
 * Oxide Interop Object
 * @type {Object}
 */
var visionPVP = {


	/**
	 * Oxide Plugin Variables
	 */
    Title: 			"visionPVP",
    Author: 		"VisionMise",
    Version: 		V(0, 1, 2),
    HasConfig: 		true,
    api: 			"",
    ready: 			false,


    /**
     * Init Oxide Hook
     */
    Init: 					function () {
    	this.api 	= new visionPVP_api(this.Plugin, this.Config, rust, data);
    	this.ready 	= true;    
    },


    /**
     * OnServerInitialized Oxide Hook
     */
    OnServerInitialized: 	function () {
    	var prefix 			= "visionPVP";
        var consoleCommands = {};
        var chatCommands 	= {};

        for (var cmd in consoleCommands) {
        	var name 	= prefix + "." + cmd;
        	var func 	= consoleCommands[cmd];

        	command.AddConsoleCommand(name, this.Plugin, func);
        	print("-- visionPVP: Added Console Command (" + name + ")");
        }

        for (var cmd in chatCommands) {
        	var name 	= prefix + "." + cmd;
        	var func 	= chatCommands[cmd];

        	command.AddChatCommand(name, this.Plugin, func);
        	print("-- visionPVP: Added Chat Command (" + name + ")");
        }
    },


    /**
     * OnTick Oxide Hook
     */
    OnTick: 				function() {
    	if (this.ready) this.api.timerTick();
    },


    /**
     * LoadDefaultConfig Oxide Hook
     */
    LoadDefaultConfig: 		function () {
    	this.Config.Settings 	= this.Config.Settings || {
    		"pvpMode": 		"pvp"
    	};
    }
};
