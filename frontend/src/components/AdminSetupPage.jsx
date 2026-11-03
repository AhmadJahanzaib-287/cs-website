import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import API from '../api/axios';

const AdminSetupPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      setError('This invitation link is invalid or has expired.');
      setLoading(false);
      return () => { active = false; };
    }

    API.get(`/auth/admin-invitations/${encodeURIComponent(token)}`)
      .then(({ data }) => {
        if (active) setEmail(data.data.email);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not validate this invitation.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await API.post('/auth/admin-invitations/complete', { token, username, password });
      setCompleted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not complete account setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-setup-page flex min-h-screen items-center justify-center bg-[#f3f7fb] px-4 py-10 text-[#17243b]">
      <section className="w-full max-w-md rounded-2xl border border-[#dce5ef] bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5f7] text-[#0e7490]">
          {completed ? <ShieldCheck className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
        </div>

        {completed ? (
          <>
            <h1 className="text-2xl font-medium">Account ready</h1>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Your admin account is set up. You can now sign in with your email or username and the password you created.
            </p>
            <Link to="/" className="mt-6 inline-flex rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#172e6e]">
              Continue to portal
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium">Set up your admin account</h1>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Choose a username and password. This invitation expires after 24 hours and can only be used once.
            </p>

            {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{error}</p>}

            {loading ? (
              <p className="mt-6 text-sm text-[#64748b]">Checking your invitation…</p>
            ) : email ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-1.5 text-sm font-medium">
                  <span>Email address</span>
                  <span className="flex items-center gap-2 rounded-lg border border-[#dce5ef] bg-[#f8fafc] px-3 py-2.5 font-normal text-[#64748b]">
                    <Mail className="h-4 w-4" /> {email}
                  </span>
                </label>

                <label className="block space-y-1.5 text-sm font-medium">
                  <span>Username</span>
                  <input
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    minLength={3}
                    maxLength={32}
                    pattern="[a-zA-Z0-9._-]{3,32}"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-[#0e7490]"
                    placeholder="Choose a username"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-medium">
                  <span>Password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-[#0e7490]"
                    placeholder="At least 12 characters"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-medium">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className="w-full rounded-lg border border-[#cbd5e1] px-3 py-2.5 font-normal outline-none focus:border-[#0e7490]"
                    placeholder="Enter the password again"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Setting up account…' : 'Create admin account'}
                </button>
              </form>
            ) : (
              <Link to="/" className="mt-6 inline-flex text-sm font-semibold text-[#1e3a8a] hover:underline">
                Return to portal
              </Link>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminSetupPage;
