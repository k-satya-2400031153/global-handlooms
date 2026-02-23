import { BarChart3, Globe2, Target, TrendingUp, Users } from 'lucide-react';

export default function MarketingView() {
    const campaigns = [
        { id: 1, name: "Diwali Global Handloom Festival", reach: "1.2M", conversions: "3.4%", status: "Active" },
        { id: 2, name: "European Winter Pashmina Promo", reach: "850K", conversions: "4.1%", status: "Active" },
        { id: 3, name: "US Artisan Appreciation Week", reach: "420K", conversions: "2.8%", status: "Scheduled" },
    ];

    return (
        <div className="animate-in fade-in duration-700 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-semibold text-white mb-2">Marketing Dashboard</h2>
                    <p className="text-slate-400">Track global campaign performance and audience engagement.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                    <Target className="w-5 h-5" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Globe2 className="w-5 h-5" /> <span className="font-medium">Global Reach</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">2.4M</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% this month</p>
                </div>
                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3 text-purple-400">
                        <Users className="w-5 h-5" /> <span className="font-medium">Active Buyers</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">45,200</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8% this month</p>
                </div>
                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-3 text-cyan-400">
                        <BarChart3 className="w-5 h-5" /> <span className="font-medium">Conversion Rate</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">3.8%</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +1.2% this month</p>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Active Campaigns</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-sm">
                            <th className="pb-3 font-medium">Campaign Name</th>
                            <th className="pb-3 font-medium">Estimated Reach</th>
                            <th className="pb-3 font-medium">Conversions</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm text-slate-300">
                        {campaigns.map((camp) => (
                            <tr key={camp.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 text-slate-100 font-medium">{camp.name}</td>
                                <td className="py-4">{camp.reach}</td>
                                <td className="py-4">{camp.conversions}</td>
                                <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${camp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {camp.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}