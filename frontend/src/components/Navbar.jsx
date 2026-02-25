import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { fetchDashboard } from '../services/api';

export default function Navbar({ user }) {
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        fetchDashboard()
            .then((data) => setAlertCount(data.active_alerts || 0))
            .catch(() => { });
    }, []);

    return (
        <header className="navbar">
            <div className="navbar-left">
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                    type="text"
                    className="navbar-search"
                    placeholder="Search signals, alerts, locations..."
                />
            </div>
            <div className="navbar-right">
                <button className="notification-btn" title="Alerts">
                    <Bell size={20} />
                    {alertCount > 0 && (
                        <span className="notification-badge">{alertCount > 99 ? '99+' : alertCount}</span>
                    )}
                </button>
                <div className="user-avatar" title={user?.name || 'Admin'}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
            </div>
        </header>
    );
}
