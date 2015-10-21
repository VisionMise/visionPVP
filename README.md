# visionPVP

###### version 0.3.2

#### A PVP / PVE Controller for Rust

visionPVP allows PVP and PVE to be controlled by time of day, or static modes. visionPVP currently supports 7 modes

- PVP: PVP is enabled all of the time 
- PVE: PVP is disabled all of the time
- Night Mode: PVP is only enabled at night (Default Mode)
- Day Mode: PVP is only enabled during the day
- Random Mode: PVP and PVE are toggle randomly
- Time Mode: Start and Stop PVP or PVE at certain times
- Event Mode: Starts PVP or PVE mode when and Air Drop Happens for a certain duration

---

When PVE mode is enabled, Players cannot hurt other players by attacking them. Players can still be hurt by animals, traps, fire, and other environment damage such as falling or being too cold, with radiation, etc...

PVE does not prevent players from being looted or prevent buildings from being damaged. If someone breaks in your home while PVE is enabled, you may have a hard time stopping them.

The only thing this mode is doing is toggling the "server.pve" variable on the rust server on or off with conditions. The purpose of this plugin is to give options to those conditions and to manage them.

VisionPVP is still in development. You may experience bugs as updates are added. For faster turnaround, please report problems here:
https://github.com/VisionMise/visionPVP/issues/new

---

Available at 
[visionmise.github.io/visionPVP](http://visionmise.github.io/visionPVP/)

A Plugin for OxideMode for Rust

[oxidemod.org](http://oxidemod.org)


---

##### Sample Config

    {
      "settings": {
        "version":      engineVersion,
        "config":       configVersion,
        "pvpMode":      "event",
        "random":       {
            "minimum":          "1",
            "maximum":          "12",
            "player_warning":   "2"
        },
        "pvptime":      {
            'pvp_start_time':   "18",
            'pvp_stop_time':    "6"
        },
        "event":    {
          "pvp_event_mode": "pvp",
          "pvp_duration":   "2"
        }
      }
    }

---

##### Modes

Valid values for config are as follows:

    pvp-day
    pvp-night
    pvp
    pve
    random
    time
    event

