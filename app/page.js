import Sidebar from "../app/components/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Left: Sidebar with fixed width */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Right: Content Area */}
      <div className="flex-1 bg-gray-50 p-6">
        {/* You can build your topbar and content here */}
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
    </div>
  );
}
