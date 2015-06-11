/**
 * VisionPVP
 *
 * @author 			VisionMise
 * @version  		0.1.2
 * @description 	First Working Version :: Please README.md for More Information
 * @url 			http://visionmise.github.io/visionPVP/
 * 
 * @param  {Oxide.Plugin} 	pluginObject
 * @param  {Oxide.Config} 	configObject
 * @param  {Oxide.rust}		rust
 * @return {visionPVP_engine}
 */
var visionPVP_engine 				= function(pluginObject, configObject, rust, data, prefix) {

	/**
	 * Prefix
	 * @type {String}
	 */
	this.prefix 		= '';


	/**
	 * Time API
	 * @type {visionPVP_time_object}
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
 	 *@param  {String}			prefix
	 *@return {this}
	 */
	this.init 			= function(pluginObject, configObject, rust, data, prefix) {

		/**
		 * Name
		 */
		this.prefix 	= prefix;


		/**
		 * Print Startup
		 */
		this.console(this.prefix + " Started");


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
		this.table 		= this.data.GetData(this.prefix) || {};
		

		/**
		 * Time API
		 * @type {visionPVP_time_object}
		 */
		this.time 		= new visionPVP_time_object();


		/**
		 * Set PVP Mode
		 */
		var pvpModeStr 	= this.config.Settings['pvpMode'];
		this.pvpMode 	= new visionPVP_pvpmode_type(pvpModeStr);
		this.console(this.prefix + " Mode set to " + this.pvpMode.label);


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

			case 'pvp-night':
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

			case 'pvp-day':
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
				var handler 	= new visionPVP_random_handler(this.table, this);
				this.serverPveSet(handler.mode());
			break;

			case 'interval':
				var handler 	= new visionPVP_interval_handler(this.table, this);
				this.serverPveSet(handler.mode());
			break;

			case 'event':
				var handler 	= new visionPVP_event_handler(this.table, this);
				this.serverPveSet(handler.mode());
			break;

			case 'hour':
				var handler 	= new visionPVP_hour_handler(this.table, this);
				this.serverPveSet(handler.mode());
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
	 * Server PVP Mode
	 * @return {visionPVP_pvpmode_type}
	 */
	this.serverPvpMode 		= function() {
		return this.pvpMode;
	}


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
			this.rust.BroadcastChat(this.prefix, reason);
		} else {
			this.rust.BroadcastChat(this.prefix, reason);
		}

		if (changed) {
			this.console("New Mode: " + newMode);
			this.console("Changed PVE mode to " + this.serverPveMode());
		}

		return currentMode;
	};


	/**
	 * pvpSet
	 * @param  {String} 		newMode 
	 * @return {Boolean}		True on Success
	 */
	this.pvpSet 		= function(newMode) {
		var mode 		= new visionPVP_pvpmode_type(newMode);

		if (this.updateConfig('pvpMode', mode.name)) {
			var msg 		= "Changed PVP Configuration to " + mode.label;
			this.pvpMode 	= mode;

			this.console(msg).broadcast(msg);
			return true;
		}

		return false;
	}


	/**
	 * updateConfig
	 * @param  {String} 	key
	 * @param  {Mixed} 		value
	 * @return {Boolean} 	True on Update
	 */
	this.updateConfig		= function(key, value) {
		if (!key || !value) return false;

		this.config.Settings[key]	= value;
		return true;
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
		print(this.prefix + ": " + text);
		return this;
	};


	/**
	 * Broadcast Global Chat
	 * @param  {String} text 
	 * @return {Void}      
	 */
	this.broadcast 		= function(text) {
		this.rust.BroadcastChat(this.prefix, text);
		return this;
	};


	/**
	 * Return this as an initialized object
	 */
	return this.init(pluginObject, configObject, rust, data, prefix);
};


/**
 * Time Object
 * @return {visionPVP_time_object}
 */
var visionPVP_time_object 			= function() {

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
	 * PVE 
	 * @type {Boolean}
	 */
	this.pve 			= false;


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
				this.pve 	= true;
			break;

			case 'pvp-day':
				this.value 	= 2;
				this.label 	= 'Daytime PVP';
				this.name 	= 'pvp-day';
				this.pve 	= false;
			break;

			case 'pvp-night':
				this.value 	= 3;
				this.label 	= 'Nighttime PVP';
				this.name 	= 'pvp-night';
				this.pve 	= false;
			break;

			case 'pvp':
				this.value 	= 1;
				this.label 	= 'PVP';
				this.name 	= 'pvp';
				this.pve 	= false;
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

			case 'hour':
				this.value 	= 6;
				this.label 	= 'During Time';
				this.name 	= 'hour';
				this.pve 	= true;
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
var visionPVP_random_handler	= function(dataObject, engine) {

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
 * Hour PVP mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject 
 * @param  {visionPVP_engine} 	engine
 * @return {visionPVP_hour_handler}
 */
var visionPVP_hour_handler 		= function(dataObject, engine) {

	this.data 			= {};
	this.engine 		= {};

	this.init 					= function(dataObject, engine) {
		this.data 		= dataObject;
		this.engine		= engine;
	};

	this.createHandler			= function(startHour, stopHour, pve) {
		var mode 						= new visionPVP_pvpmode_type(!pve);
		this.data.hour_handler.start 	= startHour;
		this.data.hour_handler.stop 	= stopHour;
		this.data.hour_handler.mode 	= mode.value;
		this.data.hour_handler.enabled 	= true;

		engine.data.SaveData(engine.prefix);
	};

	this.mode 					= function() {

		if (!this.data.hour_handler || (this.data.hour_handler.enabled == false)) {
			return this.engine.serverPveMode();
		}

		var startHour 			= this.data.hour_handler.start;
		var stopHour 			= this.data.hour_handler.stop;
		var currentHour 		= this.engine.time.hour();

		var activeMode 			= new visionPVP_pvpmode_type(this.data.hour_handler.mode);

		if (currentHour >= startHour && currentHour <= stopHour) {
			return activeMode.pve;
		} else {
			return !activeMode.pve;
		}
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


    /**
     * API Variables
     */
    engine: 		"",
    ready: 			false,
    prefix: 		"visionPVP",
    modes: 			['pvp', 'pve', 'pvp-night', 'pvp-day'],


    /**
     * Init Oxide Hook
     */
    Init: 					function () {
    	  
    },


    /**
     * OnServerInitialized Oxide Hook
     */
    OnServerInitialized: 	function () {

    	this.engine 	= new visionPVP_engine(this.Plugin, this.Config, rust, data, this.prefix);
    	this.ready 		= true;  
    	
        var consoleCommands = {
        	'pvp': 			'setPvpMode'
        };

        var chatCommands 	= {
        	'pvp': 			'getPvpMode'
        };

        for (var cmd in consoleCommands) {
        	var name 	= this.prefix + "." + cmd;
        	var func 	= consoleCommands[cmd];

        	command.AddConsoleCommand(name, this.Plugin, func);
        	print("-- " + this.prefix + ": Added Console Command (" + name + ")");
        }

        for (var cmd in chatCommands) {
        	var name 	= cmd;
        	var func 	= chatCommands[cmd];

        	command.AddChatCommand(name, this.Plugin, func);
        	print("-- " + this.prefix + ": Added Chat Command (" + name + ")");
        }
    },


    /**
     * OnTick Oxide Hook
     */
    OnTick: 				function() {
    	if (this.ready) this.engine.timerTick();
    },


    /**
     * LoadDefaultConfig Oxide Hook
     */
    LoadDefaultConfig: 		function () {
    	this.Config.Settings 	= this.Config.Settings || {
    		"pvpMode": 		"pvp"
    	};
    },


    /** Chat Commands */

	    /**
	     * getPvpMode
	     * @param  {Oxide.Player} 	player 
	     * @param  {String} 		cmd    
	     * @param  {Array} 			args   
	     * @return {Void} 
	     */
	    getPvpMode: 			function(player, cmd, args) {
	    	var pvp 	= this.engine.serverPvpMode();
	    	var mode 	= (pvp.value == 0) ? ["PVE","Players cannot hurt other players."] : ["PVP", "Players can kill you!"];
	    	rust.SendChatMessage(player, this.prefix, "The Current Server Mode is " + mode[0] + ". " + mode[1] + " " + pvp.reason);
	    },


    /** Console Commands */


    	/**
    	 * setPvpMode
    	 * @param {Oxide.Object} param
    	 */
	    setPvpMode: 			function(param) {
	    	if (!param.Args) {
	    		print("No Mode Set");
	    		print("Usage: ");
	    		print(this.prefix + ".pvp pvp-night");
	    		print("The available modes are " + this.modes.join(', '));
	    		return false;
	    	}

	    	var modeStr 		= param.Args[0];
	    	if (this.engine.pvpSet(modeStr)) {
	    		this.SaveConfig();
	    	}
	    }

};
