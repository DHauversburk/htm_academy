# HTM Academy - Project Status & Features

## ✅ Current Status: **Version 0.1.7** (Alpha)

This document outlines the features, gameplay mechanics, and development roadmap for **HTM Academy**, a professional training simulator for Healthcare Technology Management (HTM).

The project has recently undergone a major rebranding and UI overhaul to establish a professional, enterprise-grade feel. Core gameplay systems are in place, and the immediate focus is on expanding content and persisting user progression.

# HTM Academy - Implementation Status Report

## Current Status (v0.2.4)
- **Workbench Terminal**: Functional. Displays rich ticket details, locations, and device types.
- **Career System**: Implemented BMET I, II, III tiers.
  - **BMET I**: Small Clinic (Easy, PM focus).
  - **BMET II**: Micro-Hospital (Medium).
  - **BMET III**: Medical Center (Hard).
- **Game Director**: Generates tickets based on career tier (PM vs CM logic).
- **Data Reality**: Expanded database with 5+ devices and real defects.
- **Map Design**: Created `MAP_DESIGN.md` with ASCII layouts for future implementation.

## Recent Changes
- **v0.2.4**: Updated Profile Setup to use BMET I/II/III roles. Tuned Director difficulty.
- **v0.2.3**: Added `ticketType` (PM/CM) and granular location logic.
- **v0.2.2**: Launched Workbench Terminal UI.

## Next Steps
- [ ] Implement ASCII Map Loader to use the layouts in `MAP_DESIGN.md`.
- [ ] Add "Inventory" system to buy parts for repairs.
- [ ] Expand the "Micro-Hospital" map.

## 🚀 Core Systems Completed

### 1. **Onboarding & Profile System**
*   **Feature**: Streamlined single-screen setup for new technicians.
*   **Authentication**: Supports "Guest" mode for instant access and "Cloud" mode with Supabase for persistent data (Social Logins + Email/Password).
*   **Data**: Stores Player Name, Difficulty Level (Intern/Tech/Manager), and links to `auth.users`.

### 2. **Procedural Game Director (Gemini API)**
*   **Feature**: The AI "Brain" of the game. Generates unique daily shifts, including map layouts and work order scenarios.
*   **Logic**: 
    *   *Intern (Easy)*: Fewer tickets, routine priority, accurate descriptions.
    *   *Manager (Hard)*: More tickets, high priority, and vague or misleading descriptions.
*   **Fallback**: Includes robust internal logic to generate a default shift if the AI service is unavailable.

### 3. **Interactive World & Movement**
*   **Map**: Procedurally generated 128x128 tilemap for a new hospital layout every day.
*   **Movement**: Smooth, grid-free player movement with keyboard and virtual joystick support.
*   **Pathfinding**: A* (EasyStar.js) implementation allows NPCs to navigate the dynamic map layouts.

### 4. **Progression System**
*   **Skill Tree**: A branching tree with 5 distinct career paths (e.g., "Diagnostic Specialist," "Network Technician"). Players spend XP to unlock new abilities.
*   **Achievements**: In-game milestones that unlock certain skills and provide player goals.
*   **Career Dashboard**: A dedicated UI for visualizing the skill tree, viewing achievements, and tracking career progress.

---

## 🎮 How to Play the Current Loop

1.  **Launch**: Open the application.
2.  **Onboarding**: 
    *   Click **"Quick Start"** to jump in as a Guest.
    *   Enter your desired Technician Name.
    *   Select a starting difficulty (e.g., **"Intern"**).
3.  **Start Shift**: The game will generate a new hospital layout and a list of work orders for your shift.
4.  **The Queue**: Review the list of available Work Orders on the right-hand HUD. Click one to begin.
5.  **Navigation**: Navigate the hospital to the indicated room. NPCs (Nurses, Doctors) may approach you with "Interruption" events.
6.  **The Repair**: Arrive at the device. It will launch a dedicated "Bench" scene for inspection and repair.
7.  **The Fix**: Diagnose the fault and apply the correct fix from the repair menu.
8.  **Completion**: Submit the work order to receive XP and return to the main hospital map to select your next task.

---

## � Development Roadmap

### Sprint 1-3: Core Systems (COMPLETED)
*   **Status**: 100% Complete
*   ✅ **AI Director**: Gemini API-driven procedural generation.
*   ✅ **Onboarding**: Streamlined UX with Guest and Cloud auth.
*   ✅ **Progression**: Skill Tree and Achievement systems.
*   ✅ **Interruption Engine**: Dynamic NPC events.
*   ✅ **Map & Movement**: Procedural generation and smooth character control.

### Sprint 4: Persistence & Expansion (Current Focus)
*   **Goal**: Save all player progress to the cloud and expand the gameplay loop.
*   **Todo**:
    *   [ ] **Inventory Sync**: Save/Load `inventory_items` to Supabase.
    *   [ ] **Container Upgrades**: Purchase larger bags/carts to carry more tools.
    *   [ ] **Career Log**: Track solved tickets in a persistent `work_order_log`.
    *   [ ] **New Devices**: Add 'Defibrillator' and 'Electrosurgical Unit' benches.

## 🗄️ Database Schema Roadmap
### Phase 1: User Data (Current)
*   `profiles`: Links to `auth.users`. Stores display name, game settings, and XP.
    *   `id` (UUID, PK)
    *   `username` (Text)
    *   `difficulty` (Enum: easy, medium, high)
    *   `xp` (Int)

### Phase 2: Inventory & Economy (Sprint 4)
*   `inventory_items`: Tracks parts and tools owned by the player.
    *   `player_id` (UUID, FK)
    *   `item_id` (String, e.g., 'fuse_2a')
    *   `quantity` (Int)

### Phase 3: Career History (Sprint 4)
*   `work_order_log`: A persistent history of all completed tickets.
    *   `ticket_id` (UUID)
    *   `device_type` (String)
    *   `fault_found` (String)
    *   `outcome` (Success/Fail)
