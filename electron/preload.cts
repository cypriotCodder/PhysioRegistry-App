import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
    savePatient: async (data: any) => await ipcRenderer.invoke('save-patient', data),
    getPatients: async () => await ipcRenderer.invoke('get-patients'),
    deletePatient: async (id: string) => await ipcRenderer.invoke('delete-patient', id)
}
);
