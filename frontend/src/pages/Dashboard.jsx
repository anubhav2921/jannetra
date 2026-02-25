import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
    AlertTriangle, Activity, Newspaper, Shield, TrendingUp, MapPin, Flame,
} from 'lucide-react';
import { fetchDashboard } from '../services/api';

const RISK_COLORS = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#ef4444' };
const PIE_COLORS = ['#10b981', '#3b82f6', '#ef4444'];

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <span style={{ color: 'var(--text-muted)' }}>Loading intelligence data...</span>
            </div>
        );
    }

    if (!data) return null;

    const griColor = data.overall_gri > 60 ? '#ef4444' : data.overall_gri > 30 ? '#f59e0b' : '#10b981';
    const sentimentData = Object.entries(data.sentiment_distribution || {}).map(
        ([label, count]) => ({ name: label, value: count })
    );

    return (
        <div className="page-container">
            {/* Alert Banner */}
            {data.critical_alerts?.length > 0 && (
                <div className="alert-banner animate-in">
                    <AlertTriangle size={20} className="alert-icon" />
                    <span className="alert-text">
                        ⚠️ {data.critical_alerts.length} critical alert{data.critical_alerts.length > 1 ? 's' : ''} active — {data.critical_alerts[0]?.recommendation?.substring(0, 120)}...
                    </span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header animate-in">
                <h1>Governance Intelligence Dashboard</h1>
                <p>Real-time predictive risk monitoring & decision support</p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="glass-card stat-card red animate-in">
                    <div className="stat-icon"><Shield size={22} /></div>
                    <div className="stat-value" style={{ color: griColor }}>{data.overall_gri}</div>
                    <div className="stat-label">Governance Risk Index</div>
                </div>
                <div className="glass-card stat-card blue animate-in">
                    <div className="stat-icon"><Newspaper size={22} /></div>
                    <div className="stat-value">{data.total_articles}</div>
                    <div className="stat-label">Total Signals Processed</div>
                </div>
                <div className="glass-card stat-card amber animate-in">
                    <div className="stat-icon"><AlertTriangle size={22} /></div>
                    <div className="stat-value" style={{ color: data.fake_news_percentage > 30 ? '#ef4444' : '#f59e0b' }}>
                        {data.fake_news_percentage}%
                    </div>
                    <div className="stat-label">Fake News Detected</div>
                </div>
                <div className="glass-card stat-card green animate-in">
                    <div className="stat-icon"><Activity size={22} /></div>
                    <div className="stat-value">{data.active_alerts}</div>
                    <div className="stat-label">Active Alerts</div>
                </div>
                <div className="glass-card stat-card red animate-in">
                    <div className="stat-icon"><Flame size={22} /></div>
                    <div className="stat-value" style={{ color: data.average_anger > 5 ? '#ef4444' : '#f59e0b' }}>
                        {data.average_anger}/10
                    </div>
                    <div className="stat-label">Average Anger Rating</div>
                </div>
            </div>

            {/* Heatmap + Sentiment */}
            <div className="grid-2-1">
                <div className="glass-card chart-card animate-in">
                    <div className="section-title">
                        <MapPin size={18} /> Risk Heatmap by Location
                    </div>
                    <div className="heatmap-grid">
                        {data.location_risk?.map((loc) => (
                            <div
                                key={loc.location}
                                className={`heatmap-cell risk-${loc.avg_gri > 60 ? 'high' : loc.avg_gri > 30 ? 'moderate' : 'low'}`}
                            >
                                <div className="cell-location">{loc.location}</div>
                                <div className="cell-score" style={{ color: RISK_COLORS[loc.avg_gri > 60 ? 'HIGH' : loc.avg_gri > 30 ? 'MODERATE' : 'LOW'] }}>
                                    {loc.avg_gri}
                                </div>
                                <div className="cell-count">{loc.count} signal{loc.count > 1 ? 's' : ''}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card chart-card animate-in">
                    <div className="section-title">
                        <Activity size={18} /> Sentiment Split
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {sentimentData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}
                                itemStyle={{ color: '#f1f5f9' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                        {sentimentData.map((s, i) => (
                            <span key={s.name} style={{ fontSize: '0.75rem', color: PIE_COLORS[i], fontWeight: 600 }}>
                                ● {s.name}: {s.value}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Risk Bar Chart */}
            <div className="glass-card chart-card animate-in" style={{ marginBottom: '24px' }}>
                <div className="section-title">
                    <TrendingUp size={18} /> Risk by Category
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.category_risk || []} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                        <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#f1f5f9' }}
                            formatter={(value) => [`${value}`, 'Avg GRI']}
                        />
                        <Bar dataKey="avg_gri" radius={[0, 6, 6, 0]} maxBarSize={28}>
                            {(data.category_risk || []).map((entry) => (
                                <Cell key={entry.category} fill={RISK_COLORS[entry.avg_gri > 60 ? 'HIGH' : entry.avg_gri > 30 ? 'MODERATE' : 'LOW']} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Priority Rankings Table */}
            <div className="glass-card animate-in">
                <div className="section-title">
                    <Shield size={18} /> Priority Rankings — Top Risk Signals
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Signal Title</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>GRI Score</th>
                                <th>Veracity</th>
                                <th>Anger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_risks?.map((r, i) => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>#{i + 1}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '280px' }}>
                                        {r.title}
                                    </td>
                                    <td>{r.category}</td>
                                    <td>{r.location}</td>
                                    <td>
                                        <span style={{
                                            color: RISK_COLORS[r.risk_level] || '#94a3b8',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                        }}>
                                            {r.gri_score}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${r.label?.toLowerCase()}`}>
                                            {r.label}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="anger-bar-container">
                                            <div className="anger-bar">
                                                <div
                                                    className="anger-bar-fill"
                                                    style={{
                                                        width: `${(r.anger_rating / 10) * 100}%`,
                                                        background: r.anger_rating > 7 ? '#ef4444' : r.anger_rating > 4 ? '#f59e0b' : '#10b981',
                                                    }}
                                                />
                                            </div>
                                            <span className="anger-bar-label" style={{
                                                color: r.anger_rating > 7 ? '#ef4444' : r.anger_rating > 4 ? '#f59e0b' : '#10b981',
                                            }}>
                                                {r.anger_rating}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
