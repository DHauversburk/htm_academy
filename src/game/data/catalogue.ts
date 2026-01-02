// Basic catalogue for v1
export const PARTS_CATALOGUE: Record<string, { name: string, cost: number, desc: string }> = {
    'fuse_5a': { name: '5A Fuse', cost: 5, desc: 'Standard glass fuse' },
    'power_cord': { name: 'Power Cord (Medical Grade)', cost: 25, desc: 'Grounded AC cable' },
    'battery_li': { name: 'Li-Ion Battery Pack', cost: 150, desc: 'Main backup battery' },
    'capacitor_hv': { name: 'HV Capacitor', cost: 45, desc: 'High voltage cap for Defib' }
};
