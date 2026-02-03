import React, { useEffect, useState } from 'react';

const UpdateNotification: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [updateReady, setUpdateReady] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        // Safe check for Electron environment
        if (typeof window !== 'undefined' && window.require) {
            const { ipcRenderer } = window.require('electron');

            const handleStatus = (_event: any, text: string) => {
                setMessage(text);
                setVisible(true);
                // Hide "checking" or "up to date" message after a few seconds if it's just info
                if (text === 'App is up to date.') {
                    setTimeout(() => setVisible(false), 5000);
                }
            };

            const handleProgress = (_event: any, percent: number) => {
                setProgress(percent);
                setVisible(true);
            };

            const handleReady = (_event: any) => {
                setMessage('Update downloaded and ready to install!');
                setUpdateReady(true);
                setProgress(100);
                setVisible(true);
            };

            ipcRenderer.on('update-status', handleStatus);
            ipcRenderer.on('update-progress', handleProgress);
            ipcRenderer.on('update-ready', handleReady);

            return () => {
                ipcRenderer.removeListener('update-status', handleStatus);
                ipcRenderer.removeListener('update-progress', handleProgress);
                ipcRenderer.removeListener('update-ready', handleReady);
            };
        }
    }, []);

    const restartAndInstall = () => {
        if (typeof window !== 'undefined' && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('restart-app');
        }
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'white',
            color: '#1f2937',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            width: '320px',
            maxWidth: 'calc(100vw - 48px)',
            border: '1px solid #e5e7eb',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Update Status</h3>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        padding: '4px',
                        borderRadius: '4px',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Dismiss"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.4' }}>{message}</p>

            {(progress > 0 && progress < 100) && (
                <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease-out' }} />
                </div>
            )}

            {updateReady && (
                <button
                    onClick={restartAndInstall}
                    style={{
                        width: '100%',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                >
                    Restart & Install
                </button>
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UpdateNotification;
