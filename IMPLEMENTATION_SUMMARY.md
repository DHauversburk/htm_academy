# HTM Academy - Implementation Status Report

## 🚀 Core Systems Completed

### 1. **Onboarding & Profile System**
*   **Feature**: Multi-step wizard for setting up a technician profile.
*   **Data**: Stores Player Name, Difficulty Level (Intern/Tech/Manager), and Auth Mode (Guest/Cloud).
*   **Logic**: Adjusts gameplay variables based on selected Difficulty.

### 2. **Procedural Game Director**
*   **Feature**: The "Brain" of the game. Generates unique shifts every time you play.
*   **Logic**: 
    *   *Intern (Easy)*: 3 Tickets, Routine Priority, Accurate Descriptions.
    *   *Manager (Hard)*: 8 Tickets, Emergency Priority, Obscure/Wrong Descriptions (The Nurse lies!).

### 3. **Interactive Repair Bench**
*   **Feature**: A dedicated scene for device inspection.
*   **Device**: "Atlantis Space" Infusion Pump.
*   **Tool**: "Flute 117" Multimeter with physics-based drag-and-drop.
*   **Simulation**: Real-time voltage calculation based on probe placement (Live/Neutral/Ground).

### 4. **Repair & Validation System**
*   **Feature**: A "Service Report" UI to close tickets.
*   **Logic**: Validates your chosen solution against the *actual* hidden defect ID.
*   **Feedback**: Success/Error toasts; successful repairs clear the ticket and return you to the workshop.

---

## 🎮 How to Play the "Day 1" Loop

1.  **Launch**: Open the app. Click **"START SHIFT"**.
2.  **Onboarding**: 
    *   Select **"Guest Badge"**.
    *   Enter Name (e.g., "Tech 1").
    *   Select **"Intern (Easy)"**.
3.  **The Queue**:
    *   After the "Director" runs, a list of Work Orders appears on the right.
    *   Click the ticket mentioning **"Check AC Code"** or **"Device alarms"**.
4.  **The Diagnosis**:
    *   You are now at the Bench.
    *   Drag the **Red Probe** to the *Live* hotspot (Right side of inlet).
    *   Drag the **Black Probe** to the *Ground* hotspot (Chassis lug).
    *   Observe the reading (~119.8V). 
    *   *Note: In this scenario, the visual clue is that the cord is physically frayed (implied).*
5.  **The Fix**:
    *   Click **"🛠️ Perform Repairs"** (Bottom Right).
    *   Select **"Replace Power Cord"**.
    *   Click **"Complete Ticket"**.
6.  **Victory**:
    *   You'll see a Green Success Toast.
    *   You return to the main workshop to take the next ticket.

---

## � Development Roadmap (Aligned with Jira)

### Sprint 1: Core Gameplay & Economy (COMPLETED)
*   **Status**: 100% Complete
*   ✅ **Work Order System**: Functional list and details view.
*   ✅ **Repair Mechanics**: Step-by-step repair logic (Repair Scene).
*   ✅ **Cloud Save**: Supabase Profiles integration.
*   ✅ **Budget System**: 
    *   Display remaining monthly budget.
    *   Store `budget` in Supabase profiles (Default: $1000).
    *   Inventory Items structure defined.
*   ✅ **UI/UX Polish**:
    *   **Profile Wizard**: Cohesive glassmorphism step-by-step setup.
    *   **Mobile Support**: Virtual Joystick and responsive layouts.
    *   **Bench Accessibility**: Improved hitboxes and visual cable feedback.

### Sprint 2: The "Interruption Engine" (CURRENT)
*   **Goal**: Simulate the social/admin pressures of a BMET.
*   **Features**:
    *   ✅ **Walking NPCs**: Nurses and Doctors physically walk up to you in the hallway.
    *   ✅ **Interruption UI**: Dynamic dialog system for handling requests.
    *   ✅ **Consequences**: Accepting events impacts Budget or Work Queue.
    *   ✅ **Phone Calls**: "Ringing" UI overlay with Answer/Ignore interactions.
    *   **Emails**: Admin requests (Planned for Sprint 3).
    *   **Emails**: Admin requests (Planned).

### Sprint 3: Map & Movement Overhaul (STARTED)
*   **Goal**: Shift from side-scroller to top-down RPG View with Grid Map.
*   **Features**:
    *   ✅ **Grid System**: Procedural 128x128 tilemap generation.
    *   ✅ **Top-Down Movement**: X/Y velocity with joystick support.
    *   ✅ **RPG Stats**: Strength, Speed, Inventory Weight logic.
    *   **Encumbrance**: Carrying too much slows you down.
    *   **Containers**: Hands -> Bag -> Cart progression (Data layer implemented).
    *   **Pathfinding**: NPCs navigating the grid (Next).

## 🗄️ Database Schema Roadmap
### Phase 1: User Data (Current)
*   `profiles`: Links to Auth.Users. Stores vanity info (Display Name) and Game Settings (Difficulty).
    *   `id` (UUID, PK)
    *   `username` (Text)
    *   `difficulty` (Enum: easy, medium, high)
    *   `xp` (Int)

### Phase 2: Inventory & Economy (Next)
*   `inventory_items`: Tracks parts and tools owned by the player.
    *   `player_id` (UUID, FK)
    *   `item_id` (String, e.g., 'fuse_2a')
    *   `quantity` (Int)

### Phase 3: Career History
*   `BMETs_log`: History of all completed tickets.
    *   `ticket_id` (UUID)
    *   `device_type` (String)
    *   `fault_found` (String)
    *   `outcome` (Success/Fail)
