import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useCart } from "../../context/CartContext";
import OrdersTab from "./OrdersTab";

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { getFavoritesItems, removeFromFavorites, clearFavorites } =
    useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
      country: user?.address?.country || "",
    },
    preferences: {
      newsletter: user?.preferences?.newsletter || false,
      marketing: user?.preferences?.marketing || false,
      notifications: user?.preferences?.notifications || true,
      language: user?.preferences?.language || "en",
      theme: user?.preferences?.theme || "light",
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Sync profile theme with current theme
  useEffect(() => {
    if (user?.preferences?.theme && user.preferences.theme !== theme) {
      setProfileData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme: theme,
        },
      }));
    }
  }, [user, theme]);

  useEffect(() => {
    // عند تغيير theme-preference من نافذة أخرى
    const onStorage = (e) => {
      if (e.key === "theme-preference") {
        document.documentElement.setAttribute("data-theme", e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName =
        t("profile.firstNameRequired") || "First name is required";
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName =
        t("profile.lastNameRequired") || "Last name is required";
    }

    if (!profileData.email) {
      newErrors.email = t("profile.emailRequired") || "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email =
        t("profile.emailInvalid") || "Please enter a valid email address";
    }

    if (profileData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(profileData.phone)) {
      newErrors.phone =
        t("profile.phoneInvalid") || "Please enter a valid phone number";
    }

    // Validate address fields if address tab is active
    if (activeTab === "address") {
      if (profileData.address.street && !profileData.address.city) {
        newErrors.addressCity =
          t("profile.cityRequired") ||
          "City is required when street is provided";
      }
      if (profileData.address.city && !profileData.address.country) {
        newErrors.addressCountry =
          t("profile.countryRequired") ||
          "Country is required when city is provided";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setProfileData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === "checkbox" ? checked : value,
        },
      }));

      // Handle theme change immediately
      if (section === "preferences" && field === "theme") {
        setTheme(value);
      }
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setShowSuccessMessage(false);
    setShowErrorMessage(false);

    try {
      // Prepare the updated profile data
      const updatedProfileData = {
        ...profileData,
        profileImage: imagePreview || user?.profileImage,
      };

      // Call the updateProfile function from AuthContext
      const success = await updateProfile(updatedProfileData);

      if (success) {
        // Show success message
        setShowSuccessMessage(true);
        setIsEditing(false);
        setUploadProgress(0);
        setImagePreview(null);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        // Show error message
        setErrorMessage(
          t("profile.saveError") ||
            "Failed to update profile. Please try again."
        );
        setShowErrorMessage(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(
        t("profile.saveError") ||
          "An error occurred while updating your profile."
      );
      setShowErrorMessage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      address: {
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        zipCode: user?.address?.zipCode || "",
        country: user?.address?.country || "",
      },
      preferences: {
        newsletter: user?.preferences?.newsletter || false,
        marketing: user?.preferences?.marketing || false,
        notifications: user?.preferences?.notifications || true,
        language: user?.preferences?.language || "en",
        theme: user?.preferences?.theme || "light",
      },
    });
    setImagePreview(null);
    setErrors({});
    setIsEditing(false);
    setUploadProgress(0);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: t("profile.personalInfo"), icon: "👤" },
    { id: "address", label: t("profile.address"), icon: "📍" },
    { id: "preferences", label: t("profile.preferences"), icon: "⚙️" },
    { id: "security", label: t("profile.security"), icon: "🔒" },
    { id: "orders", label: t("profile.orders", "الطلبات"), icon: "📦" },
    { id: "favorites", label: "Favorites", icon: "❤️" },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--primary-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Notification */}
        {showSuccessMessage && (
          <div
            className="mb-6 rounded-xl p-4 flex items-center gap-3"
            style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}
          >
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5"
                style={{ color: "#22c55e" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: "#166534" }}>
                {t("profile.saveSuccess") || "Profile updated successfully!"}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="flex-shrink-0"
              style={{ color: "#22c55e" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {showErrorMessage && (
          <div
            className="mb-6 rounded-xl p-4 flex items-center gap-3"
            style={{ background: "#fee2e2", border: "1px solid #fecaca" }}
          >
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5"
                style={{ color: "#ef4444" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: "#991b1b" }}>
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setShowErrorMessage(false)}
              className="flex-shrink-0"
              style={{ color: "#ef4444" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--primary-text)" }}
          >
            {t("profile.title")}
          </h1>
          <p style={{ color: "var(--secondary-text)" }}>
            {t("profile.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl shadow-xl border p-6 theme-card">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-4"
                    style={{
                      borderColor: "var(--card-border)",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    }}
                  >
                    {imagePreview || user?.profileImage ? (
                      <img
                        src={imagePreview || user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {user?.firstName?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      style={{ background: "var(--accent-text)" }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div
                      className="w-full rounded-full h-2"
                      style={{ background: "var(--card-border)" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          background: "var(--accent-text)",
                          width: `${uploadProgress}%`,
                        }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--secondary-text)" }}
                    >
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <h2
                  className="text-xl font-semibold mt-4"
                  style={{ color: "var(--primary-text)" }}
                >
                  {user?.firstName} {user?.lastName}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--secondary-text)" }}
                >
                  {user?.email}
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id ? "border" : ""
                    }`}
                    style={
                      activeTab === tab.id
                        ? {
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            borderColor: "#bfdbfe",
                          }
                        : {
                            color: "var(--secondary-text)",
                            background: "var(--secondary-bg)",
                          }
                    }
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Action Buttons */}
              <div
                className="mt-6 pt-6 border-t"
                style={{ borderColor: "var(--card-border)" }}
              >
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                      style={{ background: "var(--accent-text)" }}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>{t("profile.saving")}</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{t("profile.saveChanges")}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="w-full font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
                      style={{
                        background: "var(--card-border)",
                        color: "var(--secondary-text)",
                      }}
                    >
                      {t("profile.cancel")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
                    style={{ background: "var(--accent-text)" }}
                  >
                    {t("profile.editProfile")}
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
                  style={{ background: "#ef4444" }}
                >
                  {t("profile.logout")}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl shadow-xl border p-8 theme-card">
              {/* Personal Information Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t("profile.personalInfo")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.firstName")}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? errors.firstName
                              ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                              : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.lastName")}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? errors.lastName
                              ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                              : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? errors.email
                              ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                              : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.phone")}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? errors.phone
                              ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                              : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.dateOfBirth")}
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.gender")}
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      >
                        <option value="">{t("profile.selectGender")}</option>
                        <option value="male">{t("profile.male")}</option>
                        <option value="female">{t("profile.female")}</option>
                        <option value="other">{t("profile.other")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t("profile.address")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.street")}
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.addressStreet && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.addressStreet}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.city")}
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.addressCity && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.addressCity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.state")}
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.zipCode")}
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={profileData.address.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("profile.country")}
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      />
                      {errors.addressCountry && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.addressCountry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t("profile.preferences")}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t("profile.notifications")}
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {t("profile.emailNotifications")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t("profile.emailNotificationsDesc")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="preferences.notifications"
                              checked={profileData.preferences.notifications}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                                profileData.preferences.notifications
                                  ? "peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                                  : ""
                              } ${
                                !isEditing
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            ></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {t("profile.newsletter")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t("profile.newsletterDesc")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="preferences.newsletter"
                              checked={profileData.preferences.newsletter}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                                profileData.preferences.newsletter
                                  ? "peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                                  : ""
                              } ${
                                !isEditing
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            ></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {t("profile.marketing")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {t("profile.marketingDesc")}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="preferences.marketing"
                              checked={profileData.preferences.marketing}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                                profileData.preferences.marketing
                                  ? "peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                                  : ""
                              } ${
                                !isEditing
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            ></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t("profile.language")}
                      </h4>
                      <select
                        name="preferences.language"
                        value={profileData.preferences.language}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full md:w-64 px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {t("profile.theme")}
                      </h4>
                      <select
                        name="preferences.theme"
                        value={profileData.preferences.theme}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full md:w-64 px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                          isEditing
                            ? "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                        } text-slate-900 dark:text-white`}
                      >
                        <option value="light">{t("profile.lightTheme")}</option>
                        <option value="dark">{t("profile.darkTheme")}</option>
                        <option value="auto">{t("profile.autoTheme")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === "favorites" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      My Favorites
                    </h3>
                    {getFavoritesItems().length > 0 && (
                      <button
                        onClick={clearFavorites}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {getFavoritesItems().length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-12 h-12 text-slate-400 dark:text-slate-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No favorites yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Start adding products to your favorites to see them here
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFavoritesItems().map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-48 object-cover"
                            />
                            <button
                              onClick={() =>
                                removeFromFavorites(item.id, item.name)
                              }
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {item.price}
                              </span>
                              <button
                                onClick={() => addToCart(item)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && <OrdersTab />}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t("profile.security")}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {t("profile.changePassword")}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {t("profile.changePasswordDesc")}
                          </p>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                            {t("profile.changePassword")}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-orange-600 dark:text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {t("profile.deleteAccount")}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {t("profile.deleteAccountDesc")}
                          </p>
                          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                            {t("profile.deleteAccount")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
