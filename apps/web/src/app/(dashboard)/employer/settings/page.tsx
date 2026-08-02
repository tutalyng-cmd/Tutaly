'use client';

import { toast } from 'react-hot-toast';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function EmployerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [profile, setProfile] = useState<{ email: string; name: string } | null>(null);
  const [notifications, setNotifications] = useState({
    newApplicants: true,
    weeklyDigest: true,
    expiryReminders: true,
    productUpdates: false,
  });

  // MFA State
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [confirmingMfaDisable, setConfirmingMfaDisable] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Fetch User profile for email and MFA status
        const [userRes, empRes] = await Promise.all([
          apiAuth.withToken(token).get('/user/me'),
          apiAuth.withToken(token).get('/user/employer/profile'),
        ]);
        setProfile({
          email: userRes.data?.data?.email || '',
          name: empRes.data?.companyName || 'Employer',
        });
        setIsMfaEnabled(userRes.data?.data?.isMfaEnabled || false);

        // Fetch Settings
        const setRes = await apiAuth.withToken(token).get('/users/settings/notifications');
        if (setRes.data) {
          setNotifications(prev => ({
            ...prev,
            ...setRes.data
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
        setLoadError('We could not load all account settings. Refresh the page to try again.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const enableMfaFlow = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await apiAuth.withToken(token).post('/auth/mfa/setup', {});
      if (res.data?.mfaToken) {
        setMfaToken(res.data.mfaToken);
        setMfaModalOpen(true);
        toast.success('OTP sent to your email');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start MFA setup');
    }
  };

  const verifyMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).post('/auth/mfa/enable', {
        mfaToken,
        code: mfaCode,
        userId: 'temp' // the backend will overwrite this with the authenticated user ID
      });

      setIsMfaEnabled(true);
      setMfaModalOpen(false);
      setMfaCode('');
      toast.success('Two-Factor Authentication enabled successfully');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).post('/auth/mfa/disable', {});
      setIsMfaEnabled(false);
      setConfirmingMfaDisable(false);
      toast.success('Two-factor authentication disabled');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).patch('/users/settings/notifications', notifications);
      toast.success('Settings saved');
    } catch (e) {
      console.error('Failed to save settings', e);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading" role="status">
        <Loader2 className="w-8 h-8 animate-spin text-green" aria-hidden="true" />
        <span>Loading account settings…</span>
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <div className="settings-alert" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="dcard">
        <div className="form-section">
          <div className="form-section__title">Account</div>
          <div className="form-section__desc">Your login credentials for this employer account.</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="e-email">Email address</label>
              <input className="input" type="email" id="e-email" value={profile?.email || ''} readOnly />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="e-pass">Password</label>
              <div className="settings-inline-action">
                <input className="input" type="password" id="e-pass" defaultValue="••••••••••" disabled />
                <Link className="btn btn--ghost btn--sm" href="/auth/forgot-password">Reset</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Account security</div>
          <div className="form-section__desc">Require an email verification code when you sign in.</div>
          <div className="settings-security-row">
            <div>
              <div className="form-label">Two-factor authentication</div>
              <div className="settings-security-status">
                Status: <strong>{isMfaEnabled ? 'Enabled' : 'Disabled'}</strong>
              </div>
            </div>
            <button
              type="button"
              className={`btn btn--sm ${isMfaEnabled ? 'btn--ghost' : 'btn--primary'}`}
              onClick={() => isMfaEnabled ? setConfirmingMfaDisable(true) : enableMfaFlow()}
              disabled={mfaLoading}
            >
              {isMfaEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          {confirmingMfaDisable && (
            <div className="settings-confirm" role="alert">
              <div>
                <strong>Disable two-factor authentication?</strong>
                <span>Your account will only require your password at sign-in.</span>
              </div>
              <div className="settings-confirm__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmingMfaDisable(false)}>Keep enabled</button>
                <button type="button" className="btn btn--danger-outline" onClick={disableMfa} disabled={mfaLoading}>
                  {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Disable MFA'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-section__title">Notifications</div>
          <button type="button" className="toggle-row" role="switch" aria-checked={notifications.newApplicants} onClick={() => toggleNotification('newApplicants')}>
            <span>
              <div className="toggle-row__title">New applicants</div>
              <div className="toggle-row__desc">Get notified when someone applies to your job posts</div>
            </span>
            <span className={`toggle-switch ${notifications.newApplicants ? 'on' : ''}`} aria-hidden="true"></span>
          </button>
          <button type="button" className="toggle-row" role="switch" aria-checked={notifications.weeklyDigest} onClick={() => toggleNotification('weeklyDigest')}>
            <span>
              <div className="toggle-row__title">Weekly performance digest</div>
              <div className="toggle-row__desc">Summary of views, applications, and pipeline movement</div>
            </span>
            <span className={`toggle-switch ${notifications.weeklyDigest ? 'on' : ''}`} aria-hidden="true"></span>
          </button>
          <button type="button" className="toggle-row" role="switch" aria-checked={notifications.expiryReminders} onClick={() => toggleNotification('expiryReminders')}>
            <span>
              <div className="toggle-row__title">Job post expiry reminders</div>
              <div className="toggle-row__desc">Alert 3 days before a listing expires</div>
            </span>
            <span className={`toggle-switch ${notifications.expiryReminders ? 'on' : ''}`} aria-hidden="true"></span>
          </button>
          <button type="button" className="toggle-row" role="switch" aria-checked={notifications.productUpdates} onClick={() => toggleNotification('productUpdates')}>
            <span>
              <div className="toggle-row__title">Product updates &amp; tips</div>
              <div className="toggle-row__desc">Occasional emails about new employer features</div>
            </span>
            <span className={`toggle-switch ${notifications.productUpdates ? 'on' : ''}`} aria-hidden="true"></span>
          </button>
        </div>

        <div className="form-section">
          <div className="form-section__title">Workspace owner</div>
          <div className="form-section__desc">The account currently responsible for this employer workspace.</div>

          <div className="team-row">
            <div className="team-row__avatar team-row__avatar--owner">
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'OW'}
            </div>
            <div>
              <div className="team-row__name">{profile?.name || 'Owner'}</div>
              <div className="team-row__email">{profile?.email || 'owner@example.com'}</div>
            </div>
            <div className="team-row__role">
              <span className="team-row__badge">Owner</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dcard-footer">
        <button className="btn btn--primary" onClick={handleSave} disabled={saving} aria-busy={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : 'Save settings'}
        </button>
      </div>

      {mfaModalOpen && (
        <div className="settings-modal-backdrop">
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="mfa-dialog-title" aria-describedby="mfa-dialog-description">
            <h2 id="mfa-dialog-title">Verify your email</h2>
            <p id="mfa-dialog-description">
              We&apos;ve sent a 6-digit code to <strong>{profile?.email}</strong>. Enter it below to enable two-factor authentication.
            </p>
            <form onSubmit={(event) => { event.preventDefault(); verifyMfa(); }}>
              <div className="form-field">
                <label className="form-label" htmlFor="mfa-code">Confirmation code</label>
                <input
                  type="text"
                  id="mfa-code"
                  placeholder="000000"
                  className="input settings-code-input"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="settings-modal__actions">
                <button
                  type="button"
                  className="btn btn--ghost flex-1"
                  onClick={() => { setMfaModalOpen(false); setMfaCode(''); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary flex-1"
                  disabled={mfaCode.length !== 6 || mfaLoading}
                >
                  {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" aria-hidden="true" /> : 'Verify and enable'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
