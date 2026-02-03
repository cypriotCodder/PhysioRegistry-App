import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//    app.quit();
// }

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: true,
            contextIsolation: false, // Simplifying for local file system access in MVP
        },
    });

    // Check if we are in dev mode
    const isDev = process.env.NODE_ENV === 'development';
    console.log(`[Main] Starting window. isDev=${isDev}`);

    if (isDev) {
        console.log('[Main] Loading localhost:5173');
        mainWindow.loadURL('http://localhost:5173').catch(e => console.error('[Main] Failed to load URL:', e));
        mainWindow.webContents.openDevTools();
    } else {
        console.log('[Main] Loading index.html');
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(e => console.error('[Main] Failed to load file:', e));
    }
};

app.on('ready', () => {
    createWindow();

    // Ensure registry directory exists
    const registryPath = path.join(app.getPath('userData'), 'registry');
    console.log(`[Storage] Patient data location: ${registryPath}`);
    if (!fs.existsSync(registryPath)) {
        fs.mkdirSync(registryPath);
    }

    // IPC Handlers
    ipcMain.handle('save-patient', async (event, patientData) => {
        try {
            // Use ID as filename to prevent duplicates on rename
            const filename = `${patientData.id}.json`;
            const filePath = path.join(registryPath, filename);
            fs.writeFileSync(filePath, JSON.stringify(patientData, null, 2));
            return { success: true, filePath };
        } catch (error) {
            console.error('Failed to save:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('delete-patient', async (event, id) => {
        try {
            const filename = `${id}.json`;
            const filePath = path.join(registryPath, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return { success: true };
            } else {
                return { success: false, error: 'File not found' };
            }
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('get-patients', async () => {
        try {
            const files = fs.readdirSync(registryPath);
            const patients = files.map(file => {
                const content = fs.readFileSync(path.join(registryPath, file), 'utf-8');
                return JSON.parse(content);
            });
            return { success: true, patients };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
