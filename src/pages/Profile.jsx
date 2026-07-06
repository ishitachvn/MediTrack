import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldAlert, Award, Calendar, RefreshCw, Key } from 'lucide-react';
import Toast from '../components/Toast';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Update Fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || '');

  // Password Change Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setToastType('error');
      setToastMessage('Name and Email are required.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name,
        email,
        age: age ? parseInt(age, 10) : '',
        gender,
        bloodGroup,
        dailyGoal
      });
      setToastType('success');
      setToastMessage('Profile details updated successfully.');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Profile update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setToastType('error');
      setToastMessage('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setToastType('error');
      setToastMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setToastType('error');
      setToastMessage('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setToastType('success');
      setToastMessage('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Incorrect old password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-container animate-fade-in">
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}

      {/* Profile Overview Card */}
      <section className="profile-header-card glass-panel">
        <div className="profile-avatar-row">
          <div className="profile-avatar-placeholder">
            <span>{name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p className="profile-meta-email"><Mail size={14} /> {user?.email}</p>
            <p className="profile-meta-date"><Calendar size={14} /> Registered: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Two columns forms */}
      <div className="profile-forms-grid">
        {/* Left Column: Update Settings */}
        <div className="profile-form-card glass-panel">
          <div className="form-card-header">
            <User size={20} className="text-primary" />
            <h3>Update Profile Settings</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-inner-form">
            <div className="profile-form-group">
              <label htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-email">Email Address</label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="prof-age">Age (Years)</label>
                <input
                  id="prof-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="prof-gender">Gender</label>
                <select
                  id="prof-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-blood">Blood Group</label>
              <select
                id="prof-blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-goal">Health Objective / Goal</label>
              <textarea
                id="prof-goal"
                rows="3"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="Describe your health goal e.g. consistent medication, lower sodium intake, etc."
              />
            </div>

            <button type="submit" className="btn-profile-save" disabled={profileLoading}>
              {profileLoading ? <RefreshCw className="spin-icon" size={16} /> : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Change Password */}
        <div className="profile-form-card glass-panel">
          <div className="form-card-header">
            <Key size={20} className="text-warning" />
            <h3>Change Credentials</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="profile-inner-form">
            <div className="profile-form-group">
              <label htmlFor="prof-old-pass">Current Password</label>
              <input
                id="prof-old-pass"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-new-pass">New Password</label>
              <input
                id="prof-new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-confirm-pass">Confirm New Password</label>
              <input
                id="prof-confirm-pass"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <div className="security-info-box">
              <ShieldAlert size={16} className="sec-icon" />
              <p>Updating credentials will reset active sessions. Make sure to keep your secrets safe.</p>
            </div>

            <button type="submit" className="btn-profile-save" disabled={passwordLoading}>
              {passwordLoading ? <RefreshCw className="spin-icon" size={16} /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
