import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Patient } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatisticsDashboard: React.FC = () => {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalIncome: 0,
        averageIncome: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateStats();
    }, [chartView]); // Re-calculate when view changes

    const calculateStats = async () => {
        setLoading(true);
        try {
            let patients: Patient[] = [];
            if (window.api) {
                const result = await window.api.getPatients();
                if (result.success && result.patients) {
                    patients = result.patients;
                }
            } else {
                const localData = localStorage.getItem('patients');
                if (localData) {
                    patients = JSON.parse(localData);
                }
            }

            // Summary Stats
            const totalPatients = patients.length;
            const totalIncome = patients.reduce((sum, patient) => {
                const patientTotal = patient.payments?.reduce((pSum, payment) => pSum + payment.amount, 0) || 0;
                return sum + patientTotal;
            }, 0);

            setStats({
                totalPatients,
                totalIncome,
                averageIncome: totalPatients > 0 ? totalIncome / totalPatients : 0
            });

            // Process Chart Data
            const allPayments = patients.flatMap(p => p.payments || []);

            // Sort by date
            allPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const groupedData: Record<string, number> = {};

            allPayments.forEach(payment => {
                const date = new Date(payment.date);
                let key = '';

                if (chartView === 'daily') {
                    // YYYY-MM-DD
                    key = date.toISOString().split('T')[0];
                } else {
                    // YYYY-MM
                    key = date.toISOString().slice(0, 7);
                }

                groupedData[key] = (groupedData[key] || 0) + payment.amount;
            });

            // Convert map to array { name: 'Label', amount: 100 }
            const formattedChartData = Object.entries(groupedData).map(([key, value]) => {
                // Format label based on view and language
                const date = new Date(key); // works for YYYY-MM too approx
                const label = chartView === 'daily'
                    ? date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })
                    : date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' });

                return {
                    name: label,
                    amount: value,
                    rawDate: key // for sorting if needed
                };
            });

            setChartData(formattedChartData);

        } catch (error) {
            console.error('Failed to calculate stats', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: language === 'tr' ? 'TRY' : 'USD'
        }).format(amount);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>{t('loading')}</div>;
    }

    return (
        <div className="container">
            <h2 style={{ marginBottom: '30px' }}>{t('statistics')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                {/* Total Patients Card */}
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {t('totalPatients')}
                    </div>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {stats.totalPatients}
                    </div>
                </div>

                {/* Total Income Card */}
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {t('totalIncome')}
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2e7d32' }}>
                        {formatCurrency(stats.totalIncome)}
                    </div>
                </div>

                {/* Average Income Card */}
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {t('averageIncome')}
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1976d2' }}>
                        {formatCurrency(stats.averageIncome)}
                    </div>
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{t('incomeOverTime')}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setChartView('daily')}
                            style={{
                                background: chartView === 'daily' ? 'var(--primary)' : 'transparent',
                                color: chartView === 'daily' ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '5px 15px'
                            }}
                        >
                            {t('daily')}
                        </button>
                        <button
                            onClick={() => setChartView('monthly')}
                            style={{
                                background: chartView === 'monthly' ? 'var(--primary)' : 'transparent',
                                color: chartView === 'monthly' ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '5px 15px'
                            }}
                        >
                            {t('monthly')}
                        </button>
                    </div>
                </div>

                <div style={{ height: '400px', width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number | undefined) => [formatCurrency(value || 0), t('amount')]} />
                                <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {t('noPayments')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticsDashboard;
