import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const SettingsContext = createContext(); //This creates a container that will hold shared data (settings). Think of it like a global variable for React, but safe and reactive.

export const SettingsProvider = ({ children }) => {
  //Wraps your whole app ,Holds the actual settings data
  const [settings, setSettings] = useState({
    storeName: "Glamora",
    storeEmail: "info@glamora.com",
    storePhone: "+1 234 567 890",
    storeAddress: "123 Fashion Street, New York, NY 10001",
    currency: "USD",
    timezone: "UTC",
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    //Request settings from backend
    try {
      setLoading(true);
      const res = await api.get("/settings");
      if (res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    //User changes settings , User changes settings , Frontend sends PUT request , Backend saves to DB
    try {
      const res = await api.put("/settings", newSettings);
      setSettings(res.data);
      return { success: true };
    } catch (error) {
      console.error("Failed to update settings:", error);
      return { success: false, error };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/users/profile", profileData);
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Failed to update profile:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update profile"
      };
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  };

  useEffect(() => {
    //This runs once when the provider is mounted.
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    updateSettings,
    updateProfile,
    fetchProfile,
    fetchSettings,
  };

  return (
    //This makes values available:
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
export const useSettings = () => {
  const context = useContext(SettingsContext); //This is a custom React hook , Simplifies accessing the setting context
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
export default SettingsContext;
