# Architecture Pivot Proposal

Our current trajectory (Phaser 2D RPG) is not meeting the quality bar suitable for a professional HTM Academy. The "game feel" is poor. We must pivot.

## Option A: "Biomed OS" (Web-Native Simulation)
**Philosophy**: Stop trying to be "Zelda". Start being "Professional Software".
**Engine**: Pure React + Tailwind CSS (Phaser removed or relegated to micro-games).

### The Experience
1.  **The Dashboard**: The main screen is your "Tablet". You see the Ticket Queue, Email, and Map.
2.  **Navigation (Blueprints)**:
    - You see the floor plan (like the ASCII maps we designed).
    - You click "Trauma Room 1".
    - The screen transitions to a "Room View".
3.  **The Room View**:
    - Instead of a grid, you see a high-quality static image or 3D render of a hospital room.
    - Devices are **Hotspots**. Hovering over an IV Pump highlights it.
    - Clicking it opens the "Inspection Panel".
4.  **Device Inspection**:
    - This can remain 2D (schematic view) or upgrade to **React Three Fiber** (3D models in browser).

**Pros**:
- Feels like a real Biomed tool.
- Extremely fast to build and iterate.
- "Zero Janky Physics".
- Mobile-friendly (iPad/Tablet ready).

**Cons**:
- No "free roaming" exploration.

---

## Option B: Unity C# Architect
**Philosophy**: Use the industry standard for 3D simulation.
**Engine**: Unity 6 / 2022 LTS (Local).

### The Workflow
1.  **I provide the Code**:
    - I write `WorkOrderManager.cs` using generic C# collections.
    - I write `PlayerInteraction.cs` using Unity `Raycast` logic.
    - I write `DeviceState.cs` using `ScriptableObjects`.
2.  **You Build the Scene**:
    - You maintain the Unity Project files on your machine.
    - You drag-and-drop the scripts I generate onto your GameObjects.

**Example Script I would generate**:
```csharp
using UnityEngine;
using System.Collections.Generic;

public class WorkOrderTerminal : MonoBehaviour {
    [Header("UI References")]
    public GameObject terminalCanvas;
    public Transform ticketContainer;
    public GameObject ticketPrefab;

    private void OnTriggerEnter(Collider other) {
        if(other.CompareTag("Player")) {
            terminalCanvas.SetActive(true);
            LoadTickets();
        }
    }
}
```

**Pros**:
- High Fidelity (AAA graphics possible).
- Real 3D physics and VR potential.

**Cons**:
- Slower iteration (I can't see what you see).
- Requires you to handle the Unity Editor and compilation.

## Recommendation
If your goal is **Web Accessibility** (playing on any hospital PC), choose **Option A (Biomed OS)**.
If your goal is **VR/High-End Training**, choose **Option B (Unity)**.
