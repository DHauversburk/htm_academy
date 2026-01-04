# HTM Academy - Map Designs

This document defines the floor plans for the different career stages in HTM Academy.
The game interprets these ASCII layouts to generate the navigable grid.

## Legend
- `#` : Wall
- `.` : Floor (Walkable)
- `D` : Door (Interactive)
- `B` : Bench / Workstation (Interact to open Workbench)
- `S` : Supply Cabinet
- `E` : Elevator / Teleport
- `+` : Patient Bed / Chair
- `C` : Counter / Desk
- `!` : Hazard / Objective Area

---

## Level 1: The Clinic (BMET I)
*Small outpatient facility. Single floor, simple layout.*

```
#########################
#...S...#.......#...#...#
#..WORK.#.EXAM1.#ORE#WAIT
#...B...D.......D...D...#
#.......#.......#...#...#
####D########D#######D###
#.......#.......#.......#
#..LAB..D..HALL.D..REC..#
#.......#.......#...C...#
#.......#.......D...E...#
#########################
```
**Zones:**
- `WORK`: Biomed Shop (Small, 1 Bench)
- `REC`: Reception / Waiting
- `EXAM1`: Exam Room
- `LAB`: Small Lab / Phlebotomy

---

## Level 2: Micro-Hospital (BMET II)
*A compact 24/7 facility with ER and small inpatient ward.*

```
#########################################
#...S...#.......#.......#.......#.......#
#..SHOP.#.ICU_1.#.ICU_2.#.ICU_3.#..OR_1.#
#...B...D.......D.......D.......D.......#
#.......#...+...#...+...#...+...#...SURG#
####D###########################D########
#.......................................#
#.................HALLWAY...............#
#.......................................#
####D#######D#######D#######D#######D####
#.......#.......#.......#.......#.......#
#..RAD..#..ER_1.#..ER_2.#.TRIAGE#..WAIT.#
#..XRAY.D.......D.......D.......D.......#
#.......#...+...#...+...#.......D...E...#
#########################################
```
**Zones:**
- `SHOP`: Larger Biomed Shop
- `ER`: Emergency Room (Trauma/Triage)
- `ICU`: Small Inpatient Ward
- `RAD`: Radiology (X-Ray)
- `OR`: Small Procedure Room

---

## Level 3: Medical Center (BMET III)
*Large multi-department facility. (Concept)*

> *Note: Defines a larger 30x30 grid with distinct wings (OR Wing, ER Wing, Imaging Wing).*

```
(Placeholder for larger ASCII Map)
```
