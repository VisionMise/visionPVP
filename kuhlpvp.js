/**
 * kuhlPVP
 *
 * @author VisionMise
 * @version  0.1.1
 * 
 * @param  {Oxide.Plugin} 	pluginObject
 * @param  {Oxide.Config} 	configObject
 * @param  {Oxide.Data}		dataObject
 * @param  {Oxide.rust}		rust
 * @return {kuhlpvp_api}
 */
var kuhlpvp_api 		= function(pluginObject, configObject, dataObject, rust) {

	/**
	 * Time API
	 * @type {kuhlpvp_time_api}
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
	 * Global Data Object
	 * @type {Oxide.Data}
	 */
	this.data 			= {};


	/**
	 * Table
	 * @type {Object}
	 */
	this.table 			= {};	


	/**
	 * Current PVP Mode
	 * @type {kuhlpvp_pvpmode_type}
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
 	 *@param  {Oxide.Data}		dataObject
 	 *@param  {Oxide.rust}		rust
	 *@return {this}
	 */
	this.init 			= function(pluginObject, configObject, dataObject, rust) {

		/**
		 * Print Startup
		 */
		this.console("KuhlPVP Started");


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
		 * Oxide Datafile
		 * @type {Oxide.datafile}
		 */
		this.data 		= dataObject;

		
		/**
		 * Oxide Rust Object
		 * @type {Oxide.Rust}
		 */
		this.rust		= rust;


		/**
		 * Time API
		 * @type {kuhlpvp_time_api}
		 */
		this.time 		= new kuhlpvp_time_api();


		/**
		 * Set PVP Mode
		 */
		var pvpModeStr 	= configObject.Settings['pvpMode'];
		this.pvpMode 	= new kuhlpvp_pvpmode_type(pvpModeStr);
		this.console("KuhlPVP Mode set to " + this.pvpMode.label);


		/**
		 * Set Data Table 
		 * @type {Oxide.Datafile}
		 */
		this.table 		= this.initData();


		/**
		 * Set Ready
		 */
		this.ready 		= true;


		/**
		 * Check PVE Settings
		 */
		var pve 		= this.checkPVPMode();
		if (pve == 1) {
			this.console("Server In PVE Mode");
		} else {
			this.console("Server In PVP Mode");
		}

		
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
		if (!this.ready == false) return false;
		this.checkPVPMode();
	};

	/**
	 * CHeck the PVP Mode Settings
	 * @return {Integer} PVE Setting Value
	 */
	this.checkPVPMode 	= function() {
		var pve 		= this.serverPveMode();

		switch (this.pvpMode.name) {

			case 'pvp_night':
				if (this.time.isDay()) {
					if (!pve) this.serverPveSet(1);
				} else {
					if (pve) this.serverPveSet(0);
				}
			break;

			case 'pvp_day':
				if (this.time.isNight()) {
					if (!pve) this.serverPveSet(1);
				} else {
					if (pve) this.serverPveSet(0);
				}
			break;

			case 'pvp':
				if (pve) this.serverPveSet(0);
			break;

			case 'pve':
				if (!pve) this.serverPveSet(1);
			break;

			case 'random':
				var handler 	= new kuhlpvp_random_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

			case 'interval':
				var handler 	= new kuhlpvp_interval_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

			case 'event':
				var handler 	= new kuhlpvp_event_handler(this.data);
				if (handler.mode() != pve) this.serverPveSet(handler.mode());
			break;

		}

		return pve;
	};


	this.initData 		= function() {
		this.tabe 		= this.data.GetDataTable("kuhlpvp");
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


	this.serverPveSet 		= function(newMode) {
		this.console("Changed PVE mode to " + newMode);
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
		print("-- KuhlPVP: " + text);
	};


	/**
	 * Return this as an initialized object
	 */
	return this.init(pluginObject, configObject, dataObject, rust);
};


/**
 * Time API
 * @return {kuhlpvp_time_api}
 */
var kuhlpvp_time_api 	= function() {

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
 * @return {kuhlpvp_pvpmode_type}
 */
var kuhlpvp_pvpmode_type		= function(typeName) {

	this.value 			= 0;
	this.label 			= '';
	this.name 			= '';

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

	return this.init(typeName);
};


var kuhlpvp_random_handler		= function(dataObject) {

	this.data 			= {};

	this.init 			= function(dataObject) {
		this.data = dataObject;
	};


	this.mode 			= function() {

	};

	return this.init(dataObject);
};

var kuhlpvp_interval_handler	= function(dataObject) {

	this.data 			= {};

	this.init 			= function(dataObject) {
		this.data = dataObject;
	};


	this.mode 			= function() {

	};

	return this.init(dataObject);
};

var kuhlpvp_event_handler		= function(dataObject) {

	this.data 			= {};

	this.init 			= function(dataObject) {
		this.data = dataObject;
	};

	this.mode 			= function() {

	};

	return this.init();
};


/**
 * Oxide Interop Object
 * @type {Object}
 */
var kuhlpvp = {

    Title: 			"kuhlPVP",
    Author: 		"VisionMise",
    Version: 		V(0, 1, 1),
    HasConfig: 		true,
    api: 			"",
    ready: 			false,

    Init: 					function () {
    	this.api 	= new kuhlpvp_api(this.Plugin, this.Config, datafile, rust);
    	this.ready 	= true;
    },

    OnServerInitialized: 	function () {
    	var prefix 			= "kuhlpvp";

        var consoleCommands = {
        	'test': 		'test',
        	'time': 		'timeOfDay'
        };

        for (var cmd in consoleCommands) {
        	var name 	= prefix + "." + cmd;
        	var func 	= consoleCommands[cmd];

        	command.AddConsoleCommand(name, this.Plugin, func);
        	print("-- KuhlPVP: Added Console Command (" + name + ")");
        }
    },

    OnTick: 				function() {
    	if (this.ready) this.api.timerTick();
    },

    LoadDefaultConfig: 		function () {
    	this.Config.Settings 	= this.Config.Settings || {
    		"pvpMode": 		"pvp"
    	};
    },





    /** for testing -- needs removed **/
    test: function(param) {
    	this.api.tester(param.Args);
    },

    timeOfDay: function() {
    	var apiTime = new kuhlpvp_time_api();
    	print("The Time is " + apiTime.time());
    }
};
