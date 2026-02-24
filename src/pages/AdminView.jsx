import { Users, Activity, ShieldCheck, IndianRupee } from "lucide-react";

export default function AdminView() {
    const stats = [
        { label: "Total Revenue", value: "₹24.5L", icon: <IndianRupee size={20} />, color: "text-green-400" },
        { label: "Active Artisans", value: "842", icon: <Users size={20} />, color: "text-blue-400" },
        { label: "Pending Verifications", value: "15", icon: <ShieldCheck size={20} />, color: "text-yellow-400" },
        { label: "Platform Uptime", value: "99.9%", icon: <Activity size={20} />, color: "text-purple-400" }
    ];

    const pendingUsers = [
        { id: "A101", name: "Ramesh Weaver", role: "Artisan", status: "Pending" },
        { id: "A102", name: "Sita Textiles", role: "Artisan", status: "Pending" },
        { id: "B405", name: "Global Imports LLC", role: "Buyer", status: "Flagged" }
    ];

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <h2 className="text-3xl font-bold mb-8">Admin Control Panel</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 rounded-xl border border-white/10 bg-neutral-900 flex flex-col gap-2">
                        <div className={`flex items-center justify-between ${stat.color}`}>
                            {stat.icon}
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <span className="text-sm text-neutral-400">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* User Management Section */}
            <div className="rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold">User Management & Alerts</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-950 text-neutral-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">User ID</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {pendingUsers.map((user, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-neutral-300">{user.id}</td>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4 text-neutral-400">{user.role}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button className="px-3 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20 hover:bg-green-500/20 transition-colors">Verify</button>
                                    <button className="px-3 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors">Block</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}