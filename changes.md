# visionPVP Changelog
##### Available At: http://visionmise.github.io/visionPVP/

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