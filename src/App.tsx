import { useState } from 'react';
import RegistryForm from './components/RegistryForm';
import PatientList from './components/PatientList';
import StatisticsDashboard from './components/StatisticsDashboard';
import type { Patient } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type View = 'list' | 'form' | 'stats';

function AppContent() {
  const [view, setView] = useState<View>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { t, language, setLanguage } = useLanguage();

  const handleCreateNew = () => {
    setSelectedPatient(null);
    setView('form');
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setView('form');
  };

  const handleSaveComplete = () => {
    // Return to list after saving
    setView('list');
    setSelectedPatient(null);
  };

  return (
    <div className="app-container">
      <header style={{
        background: '#fff',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '40px', height: '40px', background: 'var(--primary)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
          }}>P</div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>{t('appTitle')}</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              padding: '5px 10px',
              color: 'var(--text-secondary)',
              marginRight: '10px'
            }}
          >
            {language === 'en' ? 'TR' : 'EN'}
          </button>

          <button
            onClick={() => setView('stats')}
            style={{
              background: view === 'stats' ? 'var(--primary-light)' : 'transparent',
              color: view === 'stats' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            {t('statistics')}
          </button>

          <button
            onClick={() => setView('list')}
            style={{
              background: view === 'list' ? 'var(--primary-light)' : 'transparent',
              color: view === 'list' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            {t('patientList')}
          </button>
          <button onClick={handleCreateNew}>
            + {t('newPatient')}
          </button>
        </div>
      </header>
      <main style={{ paddingBottom: '50px' }}>
        {view === 'list' ? (
          <PatientList onSelectPatient={handleEditPatient} />
        ) : view === 'stats' ? (
          <StatisticsDashboard />
        ) : (
          <>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setView('list')}
                style={{ padding: '5px 10px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '1.2rem' }}
              >
                &larr;
              </button>
              <div>
                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
                  {selectedPatient ? t('editPatientProfile') : t('newPatientRegistry')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedPatient
                    ? t('viewingRecord', { name: selectedPatient.fullName })
                    : t('enterDetails')
                  }
                </p>
              </div>
            </div>
            {/* Key ensures proper reset when switching views or patients */}
            <RegistryForm
              key={selectedPatient ? selectedPatient.id : 'new'}
              initialData={selectedPatient}
              onSave={handleSaveComplete}
            />
          </>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
