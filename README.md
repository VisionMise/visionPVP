# KuhlPVP
###### version 0.1.1a

---

A Rust Oxide Plugin

---

### visionPVP
#### A PVP / PVE Controller

visionPVP allows PVP and PVE to be controlled by time of day, or static modes. visionPVP currently supports 4 modes

- PVP: PVP is enabled all of the time (Default Mode)
- PVE: PVP is disabled all of the time
- Night Mode: PVP is only enabled at night
- Day Mode: PVP is only enabled during the day

---

##### Sample Config

    "Settings": {
      "pvpMode": "pvp-day"
    }

---

##### Modes

Valid values for config are as follows:

    pvp-day
    pvp-night
    pvp
    pve

