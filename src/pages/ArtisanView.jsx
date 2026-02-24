import { Plus, Edit, Trash2, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { HoverCard } from "../components/HoverCard";

export default function ArtisanView() {
    const inventory = [
        { id: 1, name: "Authentic Ikat Saree", category: "Saree", stock: 12, price: "₹4,500" },
        { id: 2, name: "Pashmina Wool Shawl", category: "Winterwear", stock: 3, price: "₹8,200" },
        { id: 3, name: "Khadi Cotton Kurta", category: "Menswear", stock: 0, price: "₹1,200" },
    ];

    return (
        <div className="space-y-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-semibold text-white mb-2">Artisan Dashboard</h2>
                    <p className="text-slate-400">Manage your handloom inventory and orders.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
                    <Plus className="w-5 h-5" /> Add Product
                </button>
            </div>

            {/* Stats using HoverCard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HoverCard title="Total Products" description="Items listed">
                    <Package className="w-6 h-6 text-indigo-400" />
                </HoverCard>

                <HoverCard title="Active Orders" description="Global orders">
                    <ShoppingCart className="w-6 h-6 text-emerald-400" />
                </HoverCard>

                <HoverCard title="Monthly Revenue" description="₹42,500">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                </HoverCard>
            </div>

            {/* Inventory */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-medium text-white">Inventory</h3>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-300 text-sm">
                    <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody className="text-sm text-slate-400">
                    {inventory.map(item => (
                        <tr key={item.id} className="border-b border-white/5">
                            <td className="p-4 text-slate-200">{item.name}</td>
                            <td className="p-4">{item.category}</td>
                            <td className="p-4">{item.stock}</td>
                            <td className="p-4">{item.price}</td>
                            <td className="p-4 flex justify-end gap-2">
                                <Edit className="w-4 h-4 text-indigo-400" />
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}