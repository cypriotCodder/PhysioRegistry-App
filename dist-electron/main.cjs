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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//    app.quit();
// }
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        console.log('[Main] Loading index.html');
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(e => console.error('[Main] Failed to load file:', e));
    }
};
electron_1.app.on('ready', () => {
    createWindow();
    // Ensure registry directory exists
    const registryPath = path.join(electron_1.app.getPath('userData'), 'registry');
    if (!fs.existsSync(registryPath)) {
        fs.mkdirSync(registryPath);
    }
    // IPC Handlers
    electron_1.ipcMain.handle('save-patient', (event, patientData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Create a filename based on ID or Name
            const filename = `${patientData.id}_${patientData.name.replace(/\s+/g, '_')}.json`;
            const filePath = path.join(registryPath, filename);
            fs.writeFileSync(filePath, JSON.stringify(patientData, null, 2));
            return { success: true, filePath };
        }
        catch (error) {
            console.error('Failed to save:', error);
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