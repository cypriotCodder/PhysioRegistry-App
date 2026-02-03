import React, { useState } from 'react';
import type { Patient, Payment } from '../types';
import StoryEditor from './StoryEditor';
import { useLanguage } from '../contexts/LanguageContext';

interface RegistryFormProps {
    onSave: () => void;
    initialData?: Patient | null;
}

const RegistryForm: React.FC<RegistryFormProps> = ({ onSave, initialData }) => {
    // If initialData exists, we start in "View" mode (isEditing = false). 
    // If it's null (new patient), we start in "Edit" mode.
    const [isEditing, setIsEditing] = useState(!initialData);
    const { t } = useLanguage();

    // Form state for patient details
    const [patient, setPatient] = useState<Omit<Patient, 'id' | 'createdAt'>>({
        fullName: initialData?.fullName || '',
        birthDate: initialData?.birthDate || '',
        contactNumber: initialData?.contactNumber || '',
        address: initialData?.address || '',
        diagnosis: initialData?.diagnosis || '',
        story: initialData?.story || '',
        payments: initialData?.payments || []
    });

    // State for new payment entry
    // meaningful initial value for datetime-local
    const getCurrentDateTimeForInput = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        amount: 0,
        date: getCurrentDateTimeForInput(),
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPatient({ ...patient, [e.target.name]: e.target.value });
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
    };

    const addPayment = async () => {
        if (!newPayment.amount || !newPayment.date) return;

        const paymentEntry: Payment = {
            id: crypto.randomUUID(),
            amount: Number(newPayment.amount),
            date: newPayment.date,
            description: newPayment.description
        };

        // Optimistically update local state
        const updatedPayments = [...patient.payments, paymentEntry];
        setPatient({ ...patient, payments: updatedPayments });
        setNewPayment({ amount: 0, date: getCurrentDateTimeForInput(), description: '' });

        // If we are in view mode (existing patient), save immediately
        if (initialData) {
            await savePatientData({ ...patient, payments: updatedPayments });
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;

        if (confirm(t('confirmDelete', { name: patient.fullName }))) {
            try {
                if (window.api) {
                    const result = await window.api.deletePatient(initialData.id);
                    if (result.success) {
                        onSave(); // Go back to list
                    } else {
                        setMessage({ type: 'error', text: `${t('deleteError')}: ${result.error}` });
                    }
                } else {
                    // LocalStorage fallback
                    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
                    const newPatients = patients.filter((p: Patient) => p.id !== initialData.id);
                    localStorage.setItem('patients', JSON.stringify(newPatients));
                    onSave();
                }
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: t('deleteError') });
            }
        }
    };

    const savePatientData = async (dataToSave: Omit<Patient, 'id' | 'createdAt'>) => {
        setLoading(true);
        setMessage(null);

        const now = new Date();

        const fullPatientData: Patient = {
            ...dataToSave,
            id: initialData?.id || crypto.randomUUID(),
            createdAt: initialData?.createdAt || now.toISOString(),
            updatedAt: now.toISOString()
        };

        try {
            if (window.api) {
                const result = await window.api.savePatient(fullPatientData);
                if (result.success) {
                    setMessage({ type: 'success', text: t('saveSuccess') });
                    return true;
                } else {
                    setMessage({ type: 'error', text: t('saveError', { error: result.error || 'Unknown' }) });
                    return false;
                }
            } else {
                const patients = JSON.parse(localStorage.getItem('patients') || '[]');
                if (initialData) {
                    const index = patients.findIndex((p: Patient) => p.id === initialData.id);
                    if (index !== -1) patients[index] = fullPatientData;
                } else {
                    patients.push(fullPatientData);
                }
                localStorage.setItem('patients', JSON.stringify(patients));
                setMessage({ type: 'success', text: 'Saved to LocalStorage (Dev Mode)' });
                return true;
            }
        } catch (err) {
            setMessage({ type: 'error', text: t('unexpectedError') });
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await savePatientData(patient);
        if (success) {
            if (initialData) {
                setIsEditing(false);
            } else {
                onSave();
            }
        }
    };

    // Calculate total
    const totalPaid = patient.payments.reduce((sum, p) => sum + p.amount, 0);

    const formatDate = (isoString?: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPaymentDate = (isoString?: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const deletePayment = async (paymentId: string) => {
        if (!confirm(t('confirmDeletePayment'))) return;

        const updatedPayments = patient.payments.filter(p => p.id !== paymentId);
        setPatient({ ...patient, payments: updatedPayments });

        if (initialData) {
            await savePatientData({ ...patient, payments: updatedPayments });
        }
    };

    // --- RENDER View Mode (Dashboard) ---
    if (!isEditing && initialData) {
        return (
            <div className="container">
                <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem' }}>{patient.fullName}</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
                                ID: <span style={{ fontFamily: 'monospace' }}>{initialData.id.split('-')[0]}...</span>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleDelete}
                                style={{ background: '#d32f2f', color: 'white' }}
                            >
                                {t('delete')}
                            </button>
                            <button onClick={() => setIsEditing(true)}>
                                {t('editProfile')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        <div className="info-block">
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('dateOfBirth')}</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{patient.birthDate}</div>
                        </div>
                        <div className="info-block">
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('contact')}</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{patient.contactNumber}</div>
                        </div>
                        <div className="info-block">
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('diagnosis')}</label>
                            <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--primary)' }}>{patient.diagnosis}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('address')}</label>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{patient.address || t('noAddress')}</div>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div>
                            <strong>{t('createdAt')}: </strong> {formatDate(initialData.createdAt)}
                        </div>
                        {initialData.updatedAt && (
                            <div>
                                <strong>{t('updatedAt')}: </strong> {formatDate(initialData.updatedAt)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>{t('paymentHistory')}</h3>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {t('totalPaid')}: {totalPaid} {t('currency')}
                        </div>
                    </div>

                    {/* Add Payment Form */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>{t('amount')}</label>
                            <input type="number" name="amount" value={newPayment.amount || ''} onChange={handlePaymentChange} placeholder="0" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem' }}>{t('date')}</label>
                            <input type="datetime-local" name="date" value={newPayment.date} onChange={handlePaymentChange} />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.8rem' }}>{t('description')}</label>
                            <input type="text" name="description" value={newPayment.description} onChange={handlePaymentChange} placeholder="..." />
                        </div>
                        <button onClick={addPayment} style={{ height: '42px', padding: '0 20px' }}>{t('addPayment')}</button>
                    </div>

                    {/* Payments List */}
                    {patient.payments.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>{t('date')}</th>
                                    <th style={{ padding: '10px' }}>{t('description')}</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>{t('amount')}</th>
                                    <th style={{ padding: '10px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.payments.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{formatPaymentDate(p.date)}</td>
                                        <td style={{ padding: '10px' }}>{p.description || '-'}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{p.amount} {t('currency')}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button
                                                onClick={() => deletePayment(p.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#d32f2f',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    padding: '0 5px'
                                                }}
                                                title={t('deletePayment')}
                                            >
                                                &times;
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>{t('noPayments')}</p>
                    )}
                </div>

                <h3 style={{ marginTop: '30px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>{t('clinicalStory')}</h3>
                <StoryEditor value={patient.story} onChange={() => { }} readOnly={true} />
            </div>
        );
    }

    // --- RENDER Edit Mode (Form) ---
    return (
        <div className="container">
            {initialData && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => {
                            setPatient({
                                fullName: initialData.fullName,
                                birthDate: initialData.birthDate,
                                contactNumber: initialData.contactNumber,
                                address: initialData.address,
                                diagnosis: initialData.diagnosis,
                                story: initialData.story,
                                payments: initialData.payments || []
                            });
                            setIsEditing(false);
                        }}
                        style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                    >
                        {t('cancelEditing')}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="card">
                    <h3>{initialData ? t('editDetails') : t('patientInfo')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label>{t('fullName')}</label>
                            <input
                                name="fullName"
                                value={patient.fullName}
                                onChange={handleChange}
                                required
                                placeholder={t('fullNamePlaceholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('dateOfBirth')}</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={patient.birthDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('contact')}</label>
                            <input
                                name="contactNumber"
                                value={patient.contactNumber}
                                onChange={handleChange}
                                placeholder={t('contactPlaceholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('diagnosis')}</label>
                            <input
                                name="diagnosis"
                                value={patient.diagnosis}
                                onChange={handleChange}
                                required
                                placeholder={t('diagnosisPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>{t('address')}</label>
                        <textarea
                            name="address"
                            value={patient.address}
                            onChange={handleChange}
                            rows={3}
                            placeholder={t('addressPlaceholder')}
                        />
                    </div>
                </div>

                <StoryEditor
                    value={patient.story}
                    onChange={(val) => setPatient({ ...patient, story: val })}
                />

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    {message && (
                        <span
                            style={{
                                marginRight: '15px',
                                color: message.type === 'success' ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}
                        >
                            {message.text}
                        </span>
                    )}
                    <button type="submit" disabled={loading} style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                        {loading ? t('saving') : t('saveRegistry')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistryForm;
