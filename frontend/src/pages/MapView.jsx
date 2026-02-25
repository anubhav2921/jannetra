import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, AlertTriangle, Flame } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const RISK_COLORS = { LOW: '#10b981', MODERATE: '#f59e0b', HIGH: '#ef4444' };

export default function MapView() {
    const [markers, setMarkers] = useState([]);
    const [center, setCenter] = useState([22.5, 78.5]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/map/markers')
            .then((r) => r.json())
            .then((data) => {
                setMarkers(data.markers || []);
                if (data.center) setCenter(data.center);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner" /></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header animate-in">
                <h1>Problem Location Map</h1>
                <p>Interactive map showing governance issue hotspots across locations</p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }} className="animate-in">
                {[
                    { level: 'HIGH', color: '#ef4444', label: 'High Risk (GRI > 60)' },
                    { level: 'MODERATE', color: '#f59e0b', label: 'Moderate Risk (31–60)' },
                    { level: 'LOW', color: '#10b981', label: 'Low Risk (0–30)' },
                ].map((l) => (
                    <span key={l.level} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                        {l.label}
                    </span>
                ))}
            </div>

            {/* Map */}
            <div className="glass-card animate-in" style={{ padding: '4px', overflow: 'hidden' }}>
                <div style={{ height: '520px', borderRadius: '10px', overflow: 'hidden' }}>
                    <MapContainer
                        center={center}
                        zoom={5}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {markers.map((m) => (
                            <CircleMarker
                                key={m.location}
                                center={[m.lat, m.lng]}
                                radius={Math.max(8, Math.min(m.signal_count * 4, 22))}
                                fillColor={RISK_COLORS[m.risk_level]}
                                fillOpacity={0.7}
                                stroke={true}
                                color={RISK_COLORS[m.risk_level]}
                                weight={2}
                                opacity={0.9}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: '#1e293b' }}>
                                            📍 {m.location}
                                        </div>
                                        <div style={{ display: 'grid', gap: '4px', fontSize: '0.8rem' }}>
                                            <div><strong>Avg GRI:</strong> <span style={{ color: RISK_COLORS[m.risk_level], fontWeight: 700 }}>{m.avg_gri}</span> / 100</div>
                                            <div><strong>Max GRI:</strong> {m.max_gri}</div>
                                            <div><strong>Signals:</strong> {m.signal_count}</div>
                                            <div><strong>Avg Anger:</strong> {m.avg_anger}/10</div>
                                            <div><strong>Risk:</strong> <span style={{ color: RISK_COLORS[m.risk_level], fontWeight: 600 }}>{m.risk_level}</span></div>
                                        </div>
                                        {m.top_problem && (
                                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                                                <div style={{ fontWeight: 600, color: '#475569' }}>Top Problem:</div>
                                                <div style={{ color: '#64748b' }}>{m.top_problem.title}</div>
                                                <div style={{ marginTop: '2px' }}>
                                                    <span style={{ fontWeight: 600 }}>{m.top_problem.category}</span>
                                                    {' · '}
                                                    <span style={{ color: m.top_problem.label === 'FAKE' ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                                        {m.top_problem.label}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Location Summary Table */}
            <div className="glass-card animate-in" style={{ marginTop: '20px' }}>
                <div className="section-title">
                    <MapPin size={18} /> Location Summary
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Avg GRI</th>
                            <th>Signals</th>
                            <th>Anger</th>
                            <th>Risk</th>
                            <th>Top Problem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {markers.sort((a, b) => b.avg_gri - a.avg_gri).map((m) => (
                            <tr key={m.location}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>📍 {m.location}</td>
                                <td style={{ fontWeight: 700, color: RISK_COLORS[m.risk_level] }}>{m.avg_gri}</td>
                                <td>{m.signal_count}</td>
                                <td style={{ color: m.avg_anger > 5 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{m.avg_anger}/10</td>
                                <td><span className={`badge badge-${m.risk_level?.toLowerCase()}`}>{m.risk_level}</span></td>
                                <td style={{ fontSize: '0.8rem', maxWidth: '250px' }}>{m.top_problem?.title || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
