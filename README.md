# visionPVP
###### version 0.1.5a 

---
Available at 
[visionmise.github.io/visionPVP](http://visionmise.github.io/visionPVP/)

A Plugin for OxideMode for Rust

[oxidemod.org](http://oxidemod.org)


---

### visionPVP
#### A PVP / PVE Controller

visionPVP allows PVP and PVE to be controlled by time of day, or static modes. visionPVP currently supports 5 modes

- PVP: PVP is enabled all of the time 
- PVE: PVP is disabled all of the time
- Night Mode: PVP is only enabled at night (Default Mode)
- Day Mode: PVP is only enabled during the day
- Random Mode: PVP and PVE are toggle randomly

---

##### Sample Config

    "Settings": {
      "pvpMode": "pvp-night",
      "random": {
      	"minumum": 1,
      	"maximum": 24,
      	"player_warning": 2
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

