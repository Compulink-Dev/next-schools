export default function Settings() {
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-4">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="border rounded-md p-4">
          <h2 className="font-medium mb-2">Preferences</h2>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Dark Mode</span>
            <input type="checkbox" className="w-5 h-5" disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Notifications</span>
            <input type="checkbox" className="w-5 h-5" disabled />
          </div>
        </div>
        <div className="border rounded-md p-4">
          <h2 className="font-medium mb-2">Account</h2>
          <div className="flex flex-col gap-2">
            <button className="bg-lamaSky text-white px-3 py-2 rounded-md" disabled>
              Change Password
            </button>
            <button className="bg-lamaSky text-white px-3 py-2 rounded-md" disabled>
              Manage Connected Apps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
