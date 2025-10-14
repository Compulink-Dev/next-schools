export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import {
  Bell,
  Lock,
  Palette,
  Shield,
  User,
  Moon,
  Sun,
  Laptop,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Smartphone,
  Globe,
  Languages,
} from "lucide-react";

export default function Settings() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <nav className="space-y-2">
                {[
                  {
                    id: "appearance",
                    icon: Palette,
                    label: "Appearance",
                    active: true,
                  },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "security", icon: Shield, label: "Security" },
                  { id: "account", icon: User, label: "Account" },
                  { id: "privacy", icon: Lock, label: "Privacy" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* User Role Badge */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {role}
                    </p>
                    <p className="text-xs text-gray-500">Account Type</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Appearance Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Appearance
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customize how the application looks
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Theme
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: "light",
                        icon: Sun,
                        label: "Light",
                        description: "Light theme",
                      },
                      {
                        id: "dark",
                        icon: Moon,
                        label: "Dark",
                        description: "Dark theme",
                      },
                      {
                        id: "system",
                        icon: Laptop,
                        label: "System",
                        description: "Follow system",
                      },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <theme.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {theme.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {theme.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Language & Region
                  </h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Languages className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          English (US)
                        </p>
                        <p className="text-sm text-gray-600">
                          Language and region settings
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage how you receive notifications
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    category: "Email Notifications",
                    settings: [
                      {
                        id: "email-grades",
                        label: "Grade updates",
                        description: "Get notified when new grades are posted",
                      },
                      {
                        id: "email-announcements",
                        label: "Announcements",
                        description: "School and class announcements",
                      },
                      {
                        id: "email-assignments",
                        label: "New assignments",
                        description: "When new assignments are posted",
                      },
                    ],
                  },
                  {
                    category: "Push Notifications",
                    settings: [
                      {
                        id: "push-deadlines",
                        label: "Upcoming deadlines",
                        description: "Reminders for assignments and exams",
                      },
                      {
                        id: "push-messages",
                        label: "Messages",
                        description: "New messages from teachers and staff",
                      },
                    ],
                  },
                ].map((section) => (
                  <div key={section.category}>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      {section.category}
                    </h3>
                    <div className="space-y-4">
                      {section.settings.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {setting.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              {setting.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your account security and privacy
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Enable
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Active Sessions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Laptop className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Chrome on Windows
                          </p>
                          <p className="text-sm text-gray-600">
                            Current session • New York, USA
                          </p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Safari on iPhone
                          </p>
                          <p className="text-sm text-gray-600">
                            Last active 2 days ago
                          </p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your account data and preferences
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Data Export */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Export Data</h3>
                      <p className="text-sm text-gray-600">
                        Download all your personal data
                      </p>
                    </div>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-red-900">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
