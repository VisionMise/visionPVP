/**
 * VisionPVP
 *
 * @author          VisionMise
 * @version         0.1.4
 * @description     Please README.md for More Information
 * @url             http://visionmise.github.io/visionPVP/
 * 
 * @param  {Oxide.Plugin}   pluginObject
 * @param  {Oxide.Config}   configObject
 * @param  {Oxide.rust}     rust
 * @return {visionPVP_engine}
 */
var visionPVP_engine                = function(pluginObject, configObject, rust, data, prefix) {

    /**
     * Prefix
     * @type {String}
     */
    this.prefix         = '';


    /**
     * Time API
     * @type {visionPVP_time_object}
     */
    this.time           = {};

    
    /**
     * Global Rust Object
     * @type {Oxide.Rust}
     */
    this.rust           = {};


    /**
     * Global Plugin Object
     * @type {Oxide.Plugin}
     */
    this.plugin         = {};


    /**
     * Global Config Object
     * @type {Oxide.Config}
     */
    this.config         = {};


    /**
     * Global Data Object
     * @type {Oxide.DataFile}
     */
    this.data           = {};


    /**
     * Permanent Storage
     * @type {visionPVP_data}
     */
    this.store          = {};


    /**
     * Current PVP Mode
     * @type {visionPVP_pvpmode_type}
     */
    this.pvpMode        = {};


    /**
     * Is Ready
     * @type {Boolean}
     */
    this.ready          = false;


    this.handler        = {};


    /**
     * init
     *
     * Kuhl PVP API Initialization 
     *@param  {Oxide.Plugin}    pluginObject
     *@param  {Oxide.Config}    configObject
     *@param  {Oxide.rust}      rust
     *@param  {String}          prefix
     *@return {this}
     */
    this.init           = function(pluginObject, configObject, rust, data, prefix) {

        /**
         * Name
         */
        this.prefix     = prefix;


        /**
         * Print Startup
         */
        this.console(this.prefix + " Started");


        /**
         * Oxide Plugin Object
         * @type {Oxide.Plugin}
         */
        this.plugin     = pluginObject;
        

        /**
         * Oxide Config Object
         * @type {Oxide.Config}
         */
        this.config     = configObject;
        
        
        /**
         * Oxide Rust Object
         * @type {Oxide.Rust}
         */
        this.rust       = rust;


        /**
         * Oxide Data Object
         * @type {Oxide.DataFile}
         */
        this.data       = data;


        /**
         * Permanent Storage
         * @type {visionPVP_data}
         */
        this.store      = new visionPVP_data(this);
        

        /**
         * Time API
         * @type {visionPVP_time_object}
         */
        this.time       = new visionPVP_time_object();


        /**
         * Set PVP Mode
         */
        var pvpModeStr  = this.config.Settings['pvpMode'];
        this.pvpMode    = new visionPVP_pvpmode_type(pvpModeStr);
        this.console(this.prefix + " Mode set to " + this.pvpMode.label);


        /**
         * Set Ready
         */
        this.ready      = true;


        /**
         * Check PVE Settings
         */
        var mode        = this.checkPVPMode();
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
    this.timerTick      = function() {
        if (this.ready == false) return false;
        this.checkPVPMode();
    };


    /**
     * CHeck the PVP Mode Settings
     * @return {Integer} PVE Setting Value
     */
    this.checkPVPMode   = function() {
        var pve         = this.serverPveMode();
        var msg         = '';

        switch (this.pvpMode.name) {

            case 'pvp-night':
                if (this.time.isDay()) {
                    if (!pve) {
                        msg     = "Shutting PVP Off. Its Daytime"
                        this.serverPveSet(1, msg);
                        this.console(msg);
                    }
                } else {
                    if (pve) {
                        msg     = "Turning PVP On. Its Night";
                        this.serverPveSet(0, msg);
                        this.console(msg);
                    }
                }
            break;

            case 'pvp-day':
                if (this.time.isNight()) {
                    if (!pve) {
                        msg     = "Shutting PVP Off. Its Night";
                        this.serverPveSet(1, msg);
                        this.console(msg);
                    }
                } else {
                    if (pve) {
                        msg     = "Turning PVP On. Its Daytime";
                        this.serverPveSet(0, msg);
                        this.console(msg);
                    }
                }
            break;

            case 'pvp':
                if (pve) {
                    msg         = "Shutting PVE Off. In PVP Mode";
                    this.serverPveSet(0, msg);
                    this.console(msg);
                }
            break;

            case 'pve':
                if (!pve) {
                    msg         = "Shutting PVP Off. In PVE Mode";
                    this.serverPveSet(1, msg);
                    this.console(msg);
                }
            break;

            case 'random':
                this.handler    = new visionPVP_random_handler(this.store, this);
                var mode        = this.handler.mode();

                /*if (mode != this.serverPveMode()) {
                    this.serverPveSet(mode, this.handler.msg);
                }*/
            break;

            case 'interval':
                ///var handler     = new visionPVP_interval_handler(this.table, this);
                //this.serverPveSet(handler.mode());
            break;

            case 'event':
                //var handler     = new visionPVP_event_handler(this.table, this);
                //this.serverPveSet(handler.mode());
            break;

            case 'hour':
                //var handler     = new visionPVP_hour_handler(this.table, this);
                //this.serverPveSet(handler.mode());
            break;

        }

        return this.serverPveMode();
    };


    /**
     * Server PVE Mode
     * @return {Boolean}
     */
    this.serverPveMode      = function() {
        var global              = importNamespace("ConVar");
        var server              = global.Server;

        if (!server || typeof server == 'undefined') {
            this.console("! Could not get server namespace 'ConVar' !")
            return -1;
        }

        var mode                = server.pve;

        if (typeof mode == 'undefined') {
            this.console("! Could not get Server PVE mode !" + mode);
            return -1;
        }

        return server.pve;
    };


    /**
     * Server PVP Mode
     * @return {visionPVP_pvpmode_type}
     */
    this.serverPvpMode      = function() {
        return this.pvpMode;
    };


    /**
     * Set Server PVE Mode
     * @param  {Integer} newMode PVE Mode
     * @return {Boolean} Global.Server.pve
     */
    this.serverPveSet       = function(newMode, reason) {

        var global              = importNamespace("ConVar");
        var server              = global.Server;
        var oldMode             = this.serverPveMode();

        if (oldMode == -1) {
            this.console("! Unable to change modes !");
            return 0;
        }

        if (!server || typeof server == 'undefined') {
            this.console("! Could not get server namespace 'ConVar' !");
            return 0;
        }


        server.pve              = newMode;
        var currentMode         = server.pve;
        var changed             = (oldMode != currentMode);

        if (currentMode == 1) {
            this.rust.BroadcastChat(this.prefix, reason);
        } else {
            this.rust.BroadcastChat(this.prefix, reason);
        }

        if (changed) {
            this.console("New Mode: " + currentMode);
            this.console("Changed PVE mode to " + currentMode);
        }

        return currentMode;
    };


    /**
     * pvpSet
     * @param  {String}         newMode 
     * @return {Boolean}        True on Success
     */
    this.pvpSet         = function(newMode) {
        var mode        = new visionPVP_pvpmode_type(newMode);

        if (this.updateConfig('pvpMode', mode.name)) {
            var msg         = "Changed PVP Configuration to " + mode.label;
            this.pvpMode    = mode;

            this.console(msg).broadcast(msg);
            return true;
        }

        return false;
    };


    /**
     * updateConfig
     * @param  {String}     key
     * @param  {Mixed}      value
     * @return {Boolean}    True on Update
     */
    this.updateConfig       = function(key, value) {
        if (!key || !value) return false;

        this.config.Settings[key]   = value;
        return true;
    };


    /**
     * Tester
     * @return {Void}
     */
    this.tester         = function(param) {

        var d = new visionPVP_data(this);
        this.console(d.set("test", ["test-value"]));
        this.console('Test Result: ' + param.length + ' arguments passed');
    };


    /**
     * Console
     * Prints to Server Console
     * @param  {String}
     * @return {Void}
     */
    this.console        = function(text) {
        print(this.prefix + ": " + text);
        return this;
    };


    /**
     * Broadcast Global Chat
     * @param  {String} text 
     * @return {Void}      
     */
    this.broadcast      = function(text) {
        this.rust.BroadcastChat(this.prefix, text);
        return this;
    };


    /**
     * Return this as an initialized object
     */
    return this.init(pluginObject, configObject, rust, data, prefix);
};


/**
 * [visionPVP_data description]
 * @param  {visionPVP_engine} engine 
 * @return {visionPVP_engine} self
 */
var visionPVP_data                  = function(engine) {

    this.prefix             = '';
    this.engine             = {};
    this.table              = {};

    this.init               = function(engine) {
        this.engine         = engine;
        this.prefix         = this.engine.prefix;
        this.table          = this.engine.data.GetData(this.prefix) || {};

        return this;
    };

    this.get                = function(key) {
        if (key) return this.table[key];
        return this.table;
    };

    this.set                = function(key, value) {
        if (!key || !value) return false;
        this.table[key]     = value;

        var ret = this.get(key);
        if (ret == value) this.save();

        return ret;
    };

    this.save               = function() {
        this.engine.data.SaveData(this.prefix);
    };

    return this.init(engine);
};


/**
 * Time Object
 * @return {visionPVP_time_object}
 */
var visionPVP_time_object           = function() {

    /**
     * Rust TOD_Sky Object
     * @type {Global.TOD_Sky}
     */
    this.sky            = {};


    /**
     * Initialize Time API
     * @return {Void}
     */
    this.init           = function() {
        var global              = importNamespace("");  
        this.sky                = global.TOD_Sky.get_Instance();
    };


    /**
     * Hour of the day
     * @return {Integer}
     */
    this.hour           = function() {
        var hour = parseInt(this.sky.Cycle.Hour);
        return hour;
    };


    /**
     * Time of Day
     * @return {Float}
     */
    this.time           = function() {
        var time = this.sky.Cycle.Hour;
        return time;
    };


    /**
     * Is it daytime
     * @return {Boolean}
     */
    this.isDay          = function() {
        return this.sky.IsDay;
    };


    /**
     * Is is night time
     * @return {Boolean}
     */
    this.isNight        = function() {
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
var visionPVP_pvpmode_type      = function(typeName) {

    /**
     * Numeric Value of Mode
     * @type {Integer}
     */
    this.value          = 0;


    /**
     * Friendly Name of Mode
     * @type {String}
     */
    this.label          = '';


    /**
     * System Name of Mode
     * @type {String}
     */
    this.name           = '';


    /**
     * Reason
     * @type {String}
     */
    this.reason         = '';


    /**
     * PVE 
     * @type {Boolean}
     */
    this.pve            = false;


    /**
     * Initialize
     * @param  {String} typeName Can be the following:
     * - pvp
     * - pve
     * - pvp-night
     * - pvp-day
     * - random     // Not Implemented
     * - event      // Not Implemented
     * - interval   // Not Implemented
     * @return {Void}
     */
    this.init           = function(typeName) {
        var compStr     = typeName.toLowerCase().replace(" ", "");

        switch (compStr) {

            case 'pve':
                this.value  = 0;
                this.label  = 'PVE';
                this.name   = 'pve';
                this.pve    = true;
            break;

            case 'pvp-day':
                this.value  = 2;
                this.label  = 'Daytime PVP';
                this.name   = 'pvp-day';
                this.pve    = false;
            break;

            case 'pvp-night':
                this.value  = 3;
                this.label  = 'Nighttime PVP';
                this.name   = 'pvp-night';
                this.pve    = false;
            break;

            case 'pvp':
                this.value  = 1;
                this.label  = 'PVP';
                this.name   = 'pvp';
                this.pve    = false;
            break;

            case 'random':
                this.value  = -1;
                this.label  = 'Random Times';
                this.name   = 'random';
            break;

            case 'interval':
                this.value  = 4;
                this.label  = 'On an Interval';
                this.name   = 'interval';
            break;

            case 'event':
                this.value  = 5;
                this.label  = 'On an Event';
                this.name   = 'event';
            break;

            case 'hour':
                this.value  = 6;
                this.label  = 'During Time';
                this.name   = 'hour';
                this.pve    = true;
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
 * @param  {visionPVP_data} dataObject API Data
 * @param  {visionPVP_engine} engine
 * @return {visionPVP_random_handler} self
 */
var visionPVP_random_handler    = function(dataObject, engine) {

    this.data           = {};
    this.engine         = {};
    this.msg            = "";

    this.init           = function(dataObject, engine) {
        this.data       = dataObject;
        this.engine     = engine;

        this.engine.config.Settings['random'] = this.engine.config.Settings['random'] || {
            'minimum':      1,
            'maximum':      4
        };

        var lastHour    = this.data.get("last_change");
        var nextHour    = this.data.get("next_change");

        if (!lastHour)  this.data.set("last_change", -1);
        if (!nextHour)  this.data.set("next_change", -1);
    };

    this.calcHours      = function(nextHour, curHour) {

        if (nextHour == curHour) {
            return 0;
        } else if (nextHour < curHour) {
            return ((nextHour + 24) - curHour);
        } else {
            return (nextHour - curHour);
        }
    };

    this.mode           = function() {
        var curHour     = engine.time.hour();
        var nextHour    = this.data.get("next_change");

        if (nextHour == -1 || nextHour == false) {
            var min         = this.engine.config.Settings['random']['minimum'];
            var max         = this.engine.config.Settings['random']['maximum'];
            var rnd         = (Math.floor((Math.random() * max) + min) - 1);

            //this.engine.console("RND: " + rnd + " Range(" + min + "-" + max + ")");
            nextHour        = (curHour + rnd);
            lastHour        = parseInt(this.data.get('last_change'));

            if (nextHour > 24) nextHour = (nextHour - 24);
            if (nextHour == lastHour) {
                this.randomize();
                return this.engine.serverPveMode();
            }

            this.data.set("next_change", nextHour);
            this.engine.console("Random Hour Chosen: " + nextHour);

            var hours       = this.calcHours(nextHour, curHour);
            var pve         = this.engine.serverPveMode();
            var nextMode    = (pve == 0) ? 'PVE' : 'PVP';

            this.engine.console("The server will change to " + nextMode + " mode in " + hours + " hours.");
            this.engine.console("The current server hour is " + curHour);
            return pve;
        } else {
            if (nextHour == curHour) {
                //this.engine.console("Current Hour: " + curHour + " NextHour: " + nextHour);
                return this.randomize();
            } else {
                return this.engine.serverPveMode();
            }
        }
    };

    this.randomize     = function() {
        var pve         = this.engine.serverPveMode();
        var curHour     = engine.time.hour();
        var newMode     = (pve == 0) ? 'PVE' : 'PVP';

        this.data.set("last_change", curHour);
        this.data.set("next_change", -1);
        this.msg        = "The server is in Random Mode. A random time was chosen.";
        this.engine.console(this.msg);

        return (pve == 1) ? 0 : 1;
    };

    return this.init(dataObject, engine);
};


/**
 * Interval PVP Mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject API Data
 * @return {visionPVP_interval_handler}
 */
var visionPVP_interval_handler  = function(dataObject, engine) {

    this.data           = {};
    this.engine         = {};

    this.init           = function(dataObject, engine) {
        this.data = dataObject;
        this.engine     = engine;
    };


    this.mode           = function() {

    };

    return this.init(dataObject, engine);
};


/**
 * Event PVP Mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject API Data
 * @return {visionPVP_event_handler}
 */
var visionPVP_event_handler     = function(dataObject, engine) {

    this.data           = {};
    this.engine         = {};

    this.init           = function(dataObject, engine) {
        this.data = dataObject;
        this.engine     = engine;
    };

    this.mode           = function() {

    };

    return this.init(dataobject, engine);
};


/**
 * Hour PVP mode Handler
 * @todo Not Implemented
 * @param  {Oxide.DataFile} dataObject 
 * @param  {visionPVP_engine}   engine
 * @return {visionPVP_hour_handler}
 */
var visionPVP_hour_handler      = function(dataObject, engine) {

    this.data           = {};
    this.engine         = {};

    this.init                   = function(dataObject, engine) {
        this.data       = dataObject;
        this.engine     = engine;
    };

    this.createHandler          = function(startHour, stopHour, pve) {
        var mode                        = new visionPVP_pvpmode_type(!pve);
        this.data.hour_handler.start    = startHour;
        this.data.hour_handler.stop     = stopHour;
        this.data.hour_handler.mode     = mode.value;
        this.data.hour_handler.enabled  = true;

        engine.data.SaveData(engine.prefix);
    };

    this.mode                   = function() {

        if (!this.data.hour_handler || (this.data.hour_handler.enabled == false)) {
            return this.engine.serverPveMode();
        }

        var startHour           = this.data.hour_handler.start;
        var stopHour            = this.data.hour_handler.stop;
        var currentHour         = this.engine.time.hour();

        var activeMode          = new visionPVP_pvpmode_type(this.data.hour_handler.mode);

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
    Title:          "visionPVP",
    Author:         "VisionMise",
    Version:        V(0, 1, 4),
    ResourceId:     1135,
    HasConfig:      true,


    /**
     * API Variables
     */
    engine:         "",
    ready:          false,
    prefix:         "visionPVP",
    modes:          ['pvp', 'pve', 'pvp-night', 'pvp-day', 'random'],


    /**
     * Init Oxide Hook
     */
    Init:                   function () {
          
    },


    /**
     * OnServerInitialized Oxide Hook
     */
    OnServerInitialized:    function () {
        var jsonData    = data;
        this.engine     = new visionPVP_engine(this.Plugin, this.Config, rust, jsonData, this.prefix);

        this.ready      = true;  

        
        var consoleCommands = {
            'pvp':          'setPvpMode',
            'rnd':          'randomize',
            'rndmin':       'rndMin',
            'rndmax':       'rndMax'
        };

        var chatCommands    = {
            'pvp':          'getPvpMode'
        };

        for (var cmd in consoleCommands) {
            var name    = this.prefix + "." + cmd;
            var func    = consoleCommands[cmd];

            command.AddConsoleCommand(name, this.Plugin, func);
            print("-- " + this.prefix + ": Added Console Command (" + name + ")");
        }

        for (var cmd in chatCommands) {
            var name    = cmd;
            var func    = chatCommands[cmd];

            command.AddChatCommand(name, this.Plugin, func);
            print("-- " + this.prefix + ": Added Chat Command (" + name + ")");
        }
    },


    /**
     * OnTick Oxide Hook
     */
    OnTick:                 function() {
        if (this.ready) this.engine.timerTick();
    },


    /**
     * LoadDefaultConfig Oxide Hook
     */
    LoadDefaultConfig:      function () {
        this.Config.Settings    = this.Config.Settings || {
            "pvpMode":      "pvp-night",
            "random":       {
                "minimum":      "1",
                "maximum":      "6"
            }
        };
    },


    /** Chat Commands */

        /**
         * getPvpMode
         * @param  {Oxide.Player}   player 
         * @param  {String}         cmd    
         * @param  {Array}          args   
         * @return {Void} 
         */
        getPvpMode:             function(player, cmd, args) {
            var pve     = this.engine.serverPveMode();
            var pvp     = false;

            if (pve == 1) {
                var msg = "The server is in PVE Mode. Players cannot hurt or kill other players.";
                pvp = false;
            } else {
                var msg = "The server is in PVP Mode. Players can hurt and kill other players.";
                pvp = true;
            }

            rust.SendChatMessage(player, this.prefix, msg);
            return pvp;
        },


    /** Console Commands */

        /**
         * setPvpMode
         * @param {Oxide.Object} param
         */
        setPvpMode:             function(param) {
            if (!param.Args) {
                var pve     = this.engine.serverPveMode();

                print("Server PVE: " + ((pve == 1) ? 'Enabled' : 'Disabled'));
                print("Current Config: " + this.engine.pvpMode.name);
                print(" ");
                print("Usage: ");
                print(this.prefix + ".pvp pvp-night");
                print("The available modes are " + this.modes.join(', '));

                return false;
            }

            var modeStr         = param.Args[0];
            if (this.engine.pvpSet(modeStr)) {
                this.SaveConfig();
            }
        },

        randomize:              function() {
            var mode        = this.engine.pvpMode;
            if (mode.value == -1) {
                this.engine.handler.randomize();
            } else {
                print("Not in Random Mode");
            }
        },

        rndMin:                 function(param) {
            var mode        = this.engine.pvpMode;

            if (mode.value !== -1) {
                print("Not in Random Mode");
                return false;
            }

            var min             = this.Config.Settings['random']['minimum'];

            if (!param.Args) {
                print("Current Random Minimum Hours: " + min);
                return true;
            } else {
                var newMin                                  = param.Args[0];
                this.Config.Settings['random']['minimum']   = newMin;
                var min                                     = this.Config.Settings['random']['minimum'];

                print("New Random Minimum Hours: " + min);
            }
        },

        rndMax:                 function(param) {
            var mode        = this.engine.pvpMode;

            if (mode.value !== -1) {
                print("Not in Random Mode");
                return false;
            }

            var max             = this.Config.Settings['random']['maximum'];

            if (!param.Args) {
                print("Current Random Maximum Hours: " + max);
                return true;
            } else {
                var newMax                                  = param.Args[0];
                this.Config.Settings['random']['maximum']   = newMax;
                var max                                     = this.Config.Settings['random']['maximum'];

                print("New Random Maximum Hours: " + max);
            }
        }
};