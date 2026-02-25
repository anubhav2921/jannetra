import { useState, useEffect } from 'react';
import { FileText, Filter } from 'lucide-react';
import { fetchArticles } from '../services/api';

const CATEGORIES = ['Water', 'Infrastructure', 'Healthcare', 'Education', 'Law & Order', 'Corruption', 'Environment', 'Housing', 'Sanitation', 'Transport'];
const LABELS = ['REAL', 'FAKE', 'UNCERTAIN'];
const RISK_COLORS = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#ef4444' };

export default function Articles() {
    const [articles, setArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', label: '', page: 1 });

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.label) params.label = filters.label;
        params.page = filters.page;
        params.limit = 20;

        fetchArticles(params)
            .then((data) => {
                setArticles(data.articles || []);
                setTotal(data.total || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filters]);

    return (
        <div className="page-container">
            <div className="page-header animate-in">
                <h1>Signal Monitor</h1>
                <p>All ingested signals from social media, news, and citizen complaints</p>
            </div>

            {/* Filters */}
            <div className="filter-bar animate-in">
                <Filter size={16} style={{ color: 'var(--text-muted)', marginTop: '8px' }} />
                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={filters.label}
                    onChange={(e) => setFilters({ ...filters, label: e.target.value, page: 1 })}
                >
                    <option value="">All Labels</option>
                    {LABELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                    ))}
                </select>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px', marginLeft: 'auto' }}>
                    {total} signals found
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : (
                <div className="glass-card animate-in" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Veracity</th>
                                    <th>Confidence</th>
                                    <th>GRI</th>
                                    <th>Anger</th>
                                    <th>Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((a) => (
                                    <tr key={a.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                {a.title}
                                            </div>
                                        </td>
                                        <td>{a.category}</td>
                                        <td>{a.location}</td>
                                        <td>
                                            <span className={`badge badge-${a.label?.toLowerCase()}`}>{a.label}</span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: a.confidence > 0.7 ? '#10b981' : '#f59e0b' }}>
                                                {(a.confidence * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: RISK_COLORS[a.risk_level] || '#94a3b8',
                                            }}>
                                                {a.gri_score}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="anger-bar-container">
                                                <div className="anger-bar">
                                                    <div
                                                        className="anger-bar-fill"
                                                        style={{
                                                            width: `${(a.anger_rating / 10) * 100}%`,
                                                            background: a.anger_rating > 7 ? '#ef4444' : a.anger_rating > 4 ? '#f59e0b' : '#10b981',
                                                        }}
                                                    />
                                                </div>
                                                <span className="anger-bar-label" style={{
                                                    color: a.anger_rating > 7 ? '#ef4444' : a.anger_rating > 4 ? '#f59e0b' : '#10b981',
                                                }}>
                                                    {a.anger_rating}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${a.sentiment?.toLowerCase()}`}>
                                                {a.sentiment}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={filters.page <= 1}
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Page {filters.page} of {Math.ceil(total / 20)}
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={filters.page >= Math.ceil(total / 20)}
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
