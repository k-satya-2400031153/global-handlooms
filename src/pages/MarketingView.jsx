import { Globe, TrendingUp, MousePointerClick, Target } from "lucide-react";

export default function MarketingView() {
    const analytics = [
        { label: "Global Reach", value: "1.2M", icon: <Globe size={20} />, color: "text-blue-400" },
        { label: "Conversion Rate", value: "3.4%", icon: <TrendingUp size={20} />, color: "text-green-400" },
        { label: "Total Clicks", value: "84.5K", icon: <MousePointerClick size={20} />, color: "text-purple-400" },
        { label: "Active Campaigns", value: "12", icon: <Target size={20} />, color: "text-red-400" }
    ];

    const campaigns = [
        { name: "Diwali Handloom Fest", region: "North America", spend: "₹3,75,000", status: "Active" },
        { name: "Silk Route Revival", region: "Europe", spend: "₹1,75,000", status: "Active" },
        { name: "Summer Cotton Edit", region: "Asia Pacific", spend: "₹65,000", status: "Paused" }
    ];

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <h2 className="text-3xl font-bold mb-8">Marketing Analytics</h2>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {analytics.map((stat, i) => (
                    <div key={i} className="p-6 rounded-xl border border-white/10 bg-neutral-900 flex flex-col gap-2">
                        <div className={`flex items-center justify-between ${stat.color}`}>
                            {stat.icon}
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                        <span className="text-sm text-neutral-400">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Active Campaigns Section */}
            <div className="rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-semibold">Campaign Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-950 text-neutral-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Campaign Name</th>
                            <th className="px-6 py-4 font-medium">Target Region</th>
                            <th className="px-6 py-4 font-medium">Ad Spend</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {campaigns.map((campaign, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{campaign.name}</td>
                                <td className="px-6 py-4 text-neutral-400">{campaign.region}</td>
                                <td className="px-6 py-4 font-mono text-neutral-300">{campaign.spend}</td>
                                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs border ${
                        campaign.status === 'Active'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {campaign.status}
                    </span>
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