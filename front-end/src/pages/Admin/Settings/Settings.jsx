import "./Settings.css";
import { useState, useEffect } from "react";
import { useSettings } from "../../../context/SettingsContext";

export default function Settings() {
  const { settings, updateSettings, updateProfile, fetchProfile, loading } =
    useSettings();
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "",
    timezone: "",
  });

  const [profileSettings, setProfileSettings] = useState({
    adminName: "Admin User",
    adminEmail: "admin@stylehub.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load initial settings from context
  useEffect(() => {
    if (settings) {
      setStoreSettings({
        storeName: settings.storeName || "",
        storeEmail: settings.storeEmail || "",
        storePhone: settings.storePhone || "",
        storeAddress: settings.storeAddress || "",
        currency: settings.currency || "USD",
        timezone: settings.timezone || "America/New_York",
      });
    }
  }, [settings]);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (activeTab === "profile") {
        const profile = await fetchProfile();
        if (profile) {
          setProfileSettings((prev) => ({
            ...prev,
            adminName: profile.name || "",
            adminEmail: profile.email || "",
          }));
        }
      }
    };
    loadProfile();
  }, [activeTab, fetchProfile]);

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaved(false);
    setError(null);

    if (activeTab === "store") {
      const result = await updateSettings(storeSettings);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save settings");
      }
    } else if (activeTab === "profile") {
      if (!profileSettings.currentPassword) {
        setError("Current password is required to save changes");
        return;
      }
      
      if (
        profileSettings.newPassword &&
        profileSettings.newPassword !== profileSettings.confirmPassword
      ) {
        setError("Passwords do not match");
        return;
      }

      const updateData = {
        name: profileSettings.adminName,
        email: profileSettings.adminEmail,
        currentPassword: profileSettings.currentPassword,
      };

      if (profileSettings.newPassword) {
        updateData.password = profileSettings.newPassword;
      }

      const result = await updateProfile(updateData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Clear password fields on success
        setProfileSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setError(result.error || "Failed to update profile");
      }
    }
  };

  const tabs = [
    { key: "store", label: "Store Information", icon: "fas fa-store" },
    { key: "profile", label: "Admin Profile", icon: "fas fa-user-cog" },
  ];

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="products-page settings-page">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Settings</h1>
        <p className="page-subtitle-admin">
          Configure your store and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`settings-tab ${activeTab === tab.key ? "active" : ""}`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === "store" && (
        <div className="admin-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Store Information</h3>
            <p className="settings-section-desc">
              Update your store's basic information
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                type="text"
                className="admin-input"
                name="storeName"
                value={storeSettings.storeName}
                onChange={handleStoreChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="admin-input"
                name="storeEmail"
                value={storeSettings.storeEmail}
                onChange={handleStoreChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="admin-input"
                name="storePhone"
                value={storeSettings.storePhone}
                onChange={handleStoreChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="admin-select"
                name="currency"
                value={storeSettings.currency}
                onChange={handleStoreChange}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Store Address</label>
              <textarea
                className="admin-input textarea-resize-v"
                name="storeAddress"
                value={storeSettings.storeAddress}
                onChange={handleStoreChange}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="admin-select"
                name="timezone"
                value={storeSettings.timezone}
                onChange={handleStoreChange}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
            >
              <i className="fas fa-save"></i>
              Save Changes
            </button>
            {saved && (
              <span className="save-success">
                <i className="fas fa-check-circle"></i>
                Settings saved successfully!
              </span>
            )}
            {error && (
              <span className="save-error save-error-text">
                <i className="fas fa-exclamation-circle"></i> {error}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <div className="admin-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Admin Profile</h3>
            <p className="settings-section-desc">
              Manage your admin account settings
            </p>
          </div>

          <div className="profile-header">
            <div className="profile-avatar-large">A</div>
            <div>
              <h4 className="settings-section-title profile-name-header">
                {profileSettings.adminName}
              </h4>
              <p className="settings-section-desc">Administrator</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="admin-input"
                name="adminName"
                value={profileSettings.adminName}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="admin-input"
                name="adminEmail"
                value={profileSettings.adminEmail}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <div className="settings-section-header mt-8">
            <h4 className="settings-section-title">Change Password</h4>
            <p className="settings-section-desc">
              Leave blank to keep current password
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="admin-input"
                name="currentPassword"
                value={profileSettings.currentPassword}
                onChange={handleProfileChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="admin-input"
                name="newPassword"
                value={profileSettings.newPassword}
                onChange={handleProfileChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-input"
                name="confirmPassword"
                value={profileSettings.confirmPassword}
                onChange={handleProfileChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="settings-actions">
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
            >
              <i className="fas fa-save"></i>
              Update Profile
            </button>
            {saved && (
              <span className="save-success">
                <i className="fas fa-check-circle"></i>
                Profile updated successfully!
              </span>
            )}
            {error && (
              <span className="save-error">
                <i className="fas fa-exclamation-circle"></i> {error}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
