export interface Payment {
    id: string;
    date: string;
    amount: number;
    description?: string;
}

export interface Patient {
    id: string;
    fullName: string;
    birthDate: string;
    contactNumber: string;
    address: string;
    diagnosis: string;
    story: string;
    payments: Payment[];
    createdAt: string;
    updatedAt?: string;
}

export interface ElectronAPI {
    savePatient: (data: Patient) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    getPatients: () => Promise<{ success: boolean; patients?: Patient[]; error?: string }>;
    deletePatient: (id: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
    interface Window {
        api: ElectronAPI;
        require: any;
    }
}
