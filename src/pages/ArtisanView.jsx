import { Plus, Edit, Trash2, Package, TrendingUp, ShoppingCart } from 'lucide-react';

export default function ArtisanView() {
    // Mock inventory data so the table populates automatically
    const inventory = [
        { id: 1, name: "Authentic Ikat Saree", category: "Saree", stock: 12, status: "In Stock", price: "₹4,500" },
        { id: 2, name: "Pashmina Wool Shawl", category: "Winterwear", stock: 3, status: "Low Stock", price: "₹8,200" },
        { id: 3, name: "Khadi Cotton Kurta", category: "Menswear", stock: 0, status: "Out of Stock", price: "₹1,200" },
        { id: 4, name: "Handwoven Jute Bag", category: "Accessories", stock: 25, status: "In Stock", price: "₹850" },
    ];

    return (
        <div className="animate-in fade-in duration-700 space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold text-white mb-2">Artisan Dashboard</h2>
                    <p className="text-slate-400">Manage your handloom inventory, track orders, and update listings.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                    <Plus className="w-5 h-5" /> Add New Product
                </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Total Products Listed</p>
                        <h3 className="text-2xl font-bold text-white">24</h3>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                    <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Active Global Orders</p>
                        <h3 className="text-2xl font-bold text-white">8</h3>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-colors">
                    <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Monthly Revenue</p>
                        <h3 className="text-2xl font-bold text-white">₹42,500</h3>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white">Current Inventory</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                        <tr className="bg-slate-800/50 border-b border-white/10 text-slate-300 text-sm">
                            <th className="p-4 font-medium">Product Name</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Stock Status</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm text-slate-400">
                        {inventory.map((item) => (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-slate-200 font-medium">{item.name}</td>
                                <td className="p-4">{item.category}</td>
                                <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' :
                            item.stock > 0 ? 'bg-amber-500/10 text-amber-400' :
                                'bg-red-500/10 text-red-400'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                    </span>
                                </td>
                                <td className="p-4 text-slate-300">{item.price}</td>
                                <td className="p-4 flex justify-end gap-3">
                                    <button className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded transition-colors" title="Edit">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
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