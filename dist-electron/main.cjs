"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_updater_1 = require("electron-updater");
const electron_log_1 = __importDefault(require("electron-log"));
// Configure logging
electron_log_1.default.transports.file.level = 'info';
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.autoDownload = true; // Automatically download updates
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//    app.quit();
// }
let mainWindow = null;
const createWindow = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: true,
            contextIsolation: false, // Simplifying for local file system access in MVP
        },
    });
    // Check if we are in dev mode
    const isDev = !electron_1.app.isPackaged;
    console.log(`[Main] Starting window. isDev=${isDev} app.isPackaged=${electron_1.app.isPackaged}`);
    if (isDev) {
        console.log('[Main] Loading localhost:5173');
        mainWindow.loadURL('http://localhost:5173').catch(e => console.error('[Main] Failed to load URL:', e));
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('[Main] Loading index.html');
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(e => console.error('[Main] Failed to load file:', e));
    }
    // Check for updates once window is ready
    mainWindow.once('ready-to-show', () => {
        if (!isDev) {
            console.log('[Main] Checking for updates...');
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        }
        else {
            console.log('[Main] Skiping update check in dev mode.');
            // Optional: Uncomment to test in dev if you have dev-app-update.yml
            // autoUpdater.checkForUpdatesAndNotify();
        }
    });
};
electron_1.app.on('ready', () => {
    createWindow();
    // Ensure registry directory exists
    const registryPath = path.join(electron_1.app.getPath('userData'), 'registry');
    console.log(`[Storage] Patient data location: ${registryPath}`);
    if (!fs.existsSync(registryPath)) {
        fs.mkdirSync(registryPath);
    }
    // IPC Handlers
    electron_1.ipcMain.handle('save-patient', (event, patientData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Use ID as filename to prevent duplicates on rename
            const filename = `${patientData.id}.json`;
            const filePath = path.join(registryPath, filename);
            fs.writeFileSync(filePath, JSON.stringify(patientData, null, 2));
            return { success: true, filePath };
        }
        catch (error) {
            console.error('Failed to save:', error);
            return { success: false, error: error.message };
        }
    }));
    electron_1.ipcMain.handle('delete-patient', (event, id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const filename = `${id}.json`;
            const filePath = path.join(registryPath, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return { success: true };
            }
            else {
                return { success: false, error: 'File not found' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }));
    electron_1.ipcMain.handle('get-patients', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = fs.readdirSync(registryPath);
            const patients = files.map(file => {
                const content = fs.readFileSync(path.join(registryPath, file), 'utf-8');
                return JSON.parse(content);
            });
            return { success: true, patients };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }));
    // --- UPDATE EVENTS ---
    electron_updater_1.autoUpdater.on('checking-for-update', () => {
        console.log('[Updater] Checking for update...');
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'Checking for updates...');
    });
    electron_updater_1.autoUpdater.on('update-available', (info) => {
        console.log(`[Updater] Update available: ${info.version}`);
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', `Update available: ${info.version}`);
    });
    electron_updater_1.autoUpdater.on('update-not-available', () => {
        console.log('[Updater] Update not available.');
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'App is up to date.');
    });
    electron_updater_1.autoUpdater.on('error', (err) => {
        console.error('[Updater] Error:', err);
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', `Error in auto-updater: ${err.message}`);
    });
    electron_updater_1.autoUpdater.on('download-progress', (progressObj) => {
        const percent = progressObj.percent;
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-progress', percent);
        // Keep status message for backward compatibility or simple text display
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', `Downloading... ${percent.toFixed(0)}%`);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-ready', info.version);
    });
    // Restart app to install
    electron_1.ipcMain.on('restart-app', () => {
        electron_updater_1.autoUpdater.quitAndInstall();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.cjs.map