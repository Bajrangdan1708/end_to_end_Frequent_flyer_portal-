import React from 'react';
import { Plane, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header-bar" role="banner">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-logo-icon" aria-hidden="true">
            <Plane size={18} />
          </div>
          <div>
            <div className="portal-title">AeroMiles Portal</div>
            <div className="portal-subtitle">Frequent Flyer Operations</div>
          </div>
        </div>

        <div className="header-meta">
          <div className="system-badge" title="Local enterprise data service connected">
            <span className="system-pulse" aria-hidden="true"></span>
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Secure Floor Console</span>
          </div>
        </div>
      </div>
    </header>
  );
};
