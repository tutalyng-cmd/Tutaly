'use client';

import React, { useState } from 'react';

export default function EmployerSettingsPage() {
  const [notifications, setNotifications] = useState({
    newApplicants: true,
    weeklyDigest: true,
    expiryReminders: true,
    productUpdates: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="dcard">
        <div className="form-section">
          <div className="form-section__title">Account</div>
          <div className="form-section__desc">Your login credentials for this employer account.</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="e-email">Email address</label>
              <input className="input" type="email" id="e-email" defaultValue="hiring@flutterwave.com" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="e-pass">Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input className="input" type="password" defaultValue="••••••••••" disabled style={{ opacity: 0.6 }} />
                <button className="btn btn--ghost btn--sm" style={{ whiteSpace: 'nowrap' }}>Change</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Notifications</div>
          <div className="toggle-row" onClick={() => toggleNotification('newApplicants')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">New applicants</div>
              <div className="toggle-row__desc">Get notified when someone applies to your job posts</div>
            </div>
            <div className={`toggle-switch ${notifications.newApplicants ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('weeklyDigest')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Weekly performance digest</div>
              <div className="toggle-row__desc">Summary of views, applications, and pipeline movement</div>
            </div>
            <div className={`toggle-switch ${notifications.weeklyDigest ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('expiryReminders')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Job post expiry reminders</div>
              <div className="toggle-row__desc">Alert 3 days before a listing expires</div>
            </div>
            <div className={`toggle-switch ${notifications.expiryReminders ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('productUpdates')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Product updates &amp; tips</div>
              <div className="toggle-row__desc">Occasional emails about new employer features</div>
            </div>
            <div className={`toggle-switch ${notifications.productUpdates ? 'on' : ''}`}></div>
          </div>
        </div>

        <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="form-section__title">Team members</div>
          <div className="form-section__desc">People with access to this employer account.</div>

          <div className="team-row">
            <div className="team-row__avatar" style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-l))' }}>EW</div>
            <div>
              <div className="team-row__name">Edudje Wisdom</div>
              <div className="team-row__email">edudje@flutterwave.com</div>
            </div>
            <div className="team-row__role">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-h)', background: 'rgba(201,162,39,0.15)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>Owner</span>
            </div>
          </div>
          <div className="team-row">
            <div className="team-row__avatar" style={{ background: 'linear-gradient(135deg, var(--green), #2DB85A)' }}>NT</div>
            <div>
              <div className="team-row__name">Ngozi Thomas</div>
              <div className="team-row__email">ngozi@flutterwave.com</div>
            </div>
            <div className="team-row__role">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-400)', background: 'var(--c-700)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>Recruiter</span>
            </div>
          </div>
          <div className="team-row" style={{ borderBottom: 'none' }}>
            <div className="team-row__avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-h))' }}>HA</div>
            <div>
              <div className="team-row__name">Hassan Ahmed</div>
              <div className="team-row__email">hassan@flutterwave.com</div>
            </div>
            <div className="team-row__role">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-400)', background: 'var(--c-700)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>Viewer</span>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: '14px' }}>+ Invite team member</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', margin: '20px 0' }}>
        <button className="btn btn--ghost">Cancel</button>
        <button className="btn btn--primary">Save changes</button>
      </div>
    </>
  );
}
