import React, { useEffect, useState } from 'react';

const UpdateNotification: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [updateReady, setUpdateReady] = useState<boolean>(false);
    // const { t } = useLanguage(); // Strings are currently hardcoded for system messages

    useEffect(() => {
        // Safe check for Electron environment
        if (typeof window !== 'undefined' && window.require) {
            const { ipcRenderer } = window.require('electron');

            ipcRenderer.on('update-status', (_event: any, text: string) => {
                setMessage(text);
                // Hide "checking" message after a few seconds if it's just info
                if (text === 'App is up to date.') {
                    setTimeout(() => setMessage(''), 5000);
                }
            });

            ipcRenderer.on('update-ready', (_event: any) => {
                setMessage('Update downloaded!');
                setUpdateReady(true);
            });

            return () => {
                ipcRenderer.removeAllListeners('update-status');
                ipcRenderer.removeAllListeners('update-ready');
            };
        }
    }, []);

    const restartAndInstall = () => {
        if (typeof window !== 'undefined' && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('restart-app');
        }
    };

    if (!message && !updateReady) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#333',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            maxWidth: '400px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Update Status</div>
                <div style={{ fontSize: '0.9rem', color: '#ccc' }}>{message}</div>
            </div>
            {updateReady && (
                <button
                    onClick={restartAndInstall}
                    style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Restart
                </button>
            )}
            <button
                onClick={() => setMessage('')}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#999',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    marginLeft: '10px'
                }}
            >
                &times;
            </button>
        </div>
    );
};

export default UpdateNotification;
