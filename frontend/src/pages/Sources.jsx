import { useState, useEffect } from 'react';
import { Globe, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchSources } from '../services/api';

const TIER_ICONS = {
    VERIFIED: <CheckCircle2 size={14} style={{ color: '#10b981' }} />,
    UNKNOWN: <AlertTriangle size={14} style={{ color: '#f59e0b' }} />,
    FLAGGED: <AlertTriangle size={14} style={{ color: '#ef4444' }} />,
};

const TYPE_LABELS = {
    NEWS: { label: 'News', color: '#3b82f6' },
    SOCIAL_MEDIA: { label: 'Social Media', color: '#8b5cf6' },
    COMPLAINT: { label: 'Complaint', color: '#06b6d4' },
};

export default function Sources() {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSources()
            .then((data) => setSources(data.sources || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header animate-in">
                <h1>Source Registry</h1>
                <p>Credibility profiles and accuracy tracking for all signal sources</p>
            </div>

            {/* Source Cards Grid */}
            <div className="grid-3">
                {sources.map((s) => {
                    const accColor = s.historical_accuracy > 0.7 ? '#10b981'
                        : s.historical_accuracy > 0.4 ? '#f59e0b' : '#ef4444';
                    const typeInfo = TYPE_LABELS[s.source_type] || { label: s.source_type, color: '#94a3b8' };

                    return (
                        <div key={s.id} className="glass-card animate-in" style={{ padding: '20px' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <Globe size={16} style={{ color: typeInfo.color }} />
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {s.name}
                                        </h3>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {s.domain}
                                    </span>
                                </div>
                                <span className={`badge badge-${s.credibility_tier?.toLowerCase()}`}>
                                    {TIER_ICONS[s.credibility_tier]}
                                    <span style={{ marginLeft: '4px' }}>{s.credibility_tier}</span>
                                </span>
                            </div>

                            {/* Type Badge */}
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    background: `${typeInfo.color}18`,
                                    color: typeInfo.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>
                                    {typeInfo.label}
                                </span>
                            </div>

                            {/* Accuracy Bar */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Accuracy</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: accColor }}>
                                        {(s.historical_accuracy * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="score-bar">
                                    <div
                                        className="score-bar-fill"
                                        style={{
                                            width: `${s.historical_accuracy * 100}%`,
                                            background: accColor,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {s.article_count}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        Signals
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.fake_count > 0 ? '#ef4444' : '#10b981' }}>
                                        {s.fake_count}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        Flagged Fake
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                        {s.article_count > 0
                                            ? ((1 - s.fake_count / s.article_count) * 100).toFixed(0)
                                            : 100}%
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        Trust Rate
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
