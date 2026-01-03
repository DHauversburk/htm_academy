export type Priority = 'routine' | 'urgent' | 'emergency';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface InventoryItem {
    id: string; // e.g., 'fuse_5a'
    name: string;
    description: string;
    cost: number;
    quantity: number;
}

export interface Defect {
    id: string;
    name: string;
    description: string;
    isSafetyHazard: boolean;
    fixAction: string; // e.g., "replace_power_cord"
    requiredPartId?: string; // Link to InventoryItem.id
}

export interface Device {
    id: string;
    name: string; // e.g., "Alaris 8100"
    type: string; // e.g., "Infusion Pump"
    riskLevel: RiskLevel;
    imageKey: string; // For Phaser sprite loading
}

export interface WorkOrder {
    id: string;
    deviceId: string;
    reportedIssue: string; // What the nurse said
    actualDefectId: string; // The real problem
    priority: Priority;
    customer: string; // e.g., "ICU - Bed 4"
    dateCreated: string;
    status: 'open' | 'in_progress' | 'pending_parts' | 'closed';
    isSafetyCheckRequired: boolean; // Must do electrical safety?
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    orders: WorkOrder[];
}

export interface InterruptionChoice {
    text: string;
    action: string; // e.g., 'ignore', 'reply_positive', 'delay_task'
}

export interface Interruption {
    id: string;
    type: 'phone' | 'email' | 'alert';
    title: string;
    sender: string;
    body: string;
    choices: InterruptionChoice[];
}
