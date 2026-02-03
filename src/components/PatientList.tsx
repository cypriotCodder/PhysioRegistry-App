import React, { useEffect, useState } from 'react';
import type { Patient } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PatientListProps {
    onSelectPatient: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            if (window.api) {
                const result = await window.api.getPatients();
                if (result.success && result.patients) {
                    setPatients(result.patients);
                }
            } else {
                // Fallback
                const localData = localStorage.getItem('patients');
                if (localData) {
                    setPatients(JSON.parse(localData));
                }
            }
        } catch (error) {
            console.error('Failed to load patients', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.contactNumber.includes(search)
    );

    return (
        <div className="container">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{t('patientList')}</h2>
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>{t('loading')}</div>
            ) : (
                <div className="patient-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredPatients.map(patient => (
                        <div key={patient.id} className="card patient-card" onClick={() => onSelectPatient(patient)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{patient.fullName}</h3>
                            <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <strong>{t('dob')}:</strong> {patient.birthDate}
                            </p>
                            <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <strong>{t('contact')}:</strong> {patient.contactNumber}
                            </p>
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                {t('viewProfile')} &rarr;
                            </div>
                        </div>
                    ))}

                    {filteredPatients.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                            {t('noPatientsFound')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientList;
