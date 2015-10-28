# visionPVP Changelog
##### Available At: http://visionmise.github.io/visionPVP/

### Version 0.4.2

#### New feature - VisionPVE (vs ServerPVE)

This is the main feature that most people have asked for and was also my ultimate goal. It removes punishment
from PVE. So no more taking damage for hitting a player building, or for hitting another player. VisionPVE
simply protects the attacked player from damage.

###### Details

Players cannot do harm to other players when PVE is on. This will force `server.pve` to `false` in all cases.
Now the option is stored in the data files and works independant of the server setting. 

Players are still vulnerable to explosions, helicopters, animals, falling damage, and state-based damage such
as hunger, drowning, or getting too cold.

A new config option has been added and it won't wipe you config! More on that below. Here is the new config option
that was added:

	"pveMode": 		"vision"

#### New Feature - ConfigUpgrade

The addition of the VisionPVE feature comes a new config option which in the past meant the config would get wiped.
For those with the upgrade mod, this was an issue because your server would change modes when it got updates and
you may not know it. And your players may not know it.

The new option will be added automatically without changing your current setup.

#### Bug fixes

Many bug fixes have been applied. Player chat commands have been removed. All console commands are the same.

### Version 0.3.3

Initialization Bug Fixed

### Version 0.3.2

Fixed configuration to have pvpmode default be a valid option

### Version 0.3.1

Re-added Events now that OxideMod supports the hook again. Events will only been when an air-drop happens. This may change in the future
if OxideMod expands its support for a helicopter event. Currently there are two settings to configure: The mode that will be enabled when
the event happens, and how many hours it will last. See the README for information


### Version 0.2.4

Bugs / Code Changes
- Removed Event mode; handlers for this have been changed and due to constraints, cannot get airdrop event
- Fixed several bugs from cahnges to lates versions of Rust and OxideMod

### Version 0.2.2a

Enhancements
- Added new mode 'time' which allows a start and stop time to be set for PVP or PVE mode
- Added new mode 'event' which sets PVP or PVE mode when an airdrop event happens for a configured length of time

Bugs / Code Changes
- Added new eventController
- Added visionPVP_event_handler
- Updated resources
- Updated config
- Added new mode to engine, oxide object, and visionPVP_pvpmode

### Version 0.1.5a

Enhancements
- Added customizable messages for console and chat in config
- Auto-Updater Enabled
- New player warning feature (Broadcasts to all players that mode will change to [x] in [n] hours)
-- Configurable in config

Bugs / Code Changes
- Fixed Bug #20
- Moved configuration handling to engine object
- Expanded random handler with more robust conditions
-- Random min/max range must now be between 0-24
- Added Resource Handler for string
- Added config version checks
-- Added config updater/builder
- Added resource version checks
-- Added resource updater/builder
-- Added strings and errors
- Cleaned up code by removing un-implemented extensions

### Version 0.1.4a

Enhancements
- Added new PVP mode 'Random'
- Added new Console Command rnd
- Added new Console Command rndmin
- Added new Console Command rndmax

Bugs / Code Changes
- Fixed Bug #17
- Updated config to include random pvp settings
- Implemented visionPVP_data for Random Mode Handler
- Added random mode to engine

### Version 0.1.3a

Enhancements
- Added Resource ID to work with Updater Plugin
- Added Data Handler

Bugs / Code Changes
- Fixed PVP Chat Command Bug #8
- Fixed console loop error from Bug #12
-- Namespace for server was changed from root to 'ConVar'
-- Server namespace now case sensitive (updated to 'Server')

### Version 0.1.2a

Enhancements
- Added Chat Command for players to see current mode
- Added console command to change configuration
- Now Broadcasts Configuration changes so players are aware
- Now Broadcasts Mode changes and reason regardless of why the mode is changing
- Added Change Log

Bugs / Code Changes
- Fixed Issue #3
- Fixed Issue #4
-- Moved Init hook code to ServerInitialized hook
- Minor Code Clean up
- Refactored visionPVP_api to visionPVP_engine
- Refactored visionPVP_time_api to visionPVP_time_object

### Version 0.1.1a
- Initial Working Version
