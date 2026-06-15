import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import { ShoppingBag, Star, Download, Search, CheckCircle, ShieldCheck } from 'lucide-react';
import apiConfig from '../services/apiConfig';

const Marketplace = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = ["All", "Deployment Blueprints", "Terraform Templates", "Helm Charts", "Compliance Packs", "AI Agents"];

    const fetchItems = async () => {
        try {
            setLoading(true);
            let url = `${apiConfig.baseURL}/marketplace/items`;
            const params = new URLSearchParams();
            if (activeCategory !== "All") params.append("category", activeCategory);
            if (searchTerm) params.append("search", searchTerm);
            if (params.toString()) url += `?${params.toString()}`;
            
            const data = await apiCall(url);
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch marketplace items', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeCategory, searchTerm]);

    const handlePublishClick = () => {
        alert("Publishing Asset Wizard (Not implemented in MVP view)");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center text-slate-800 dark:text-slate-100">
                        <ShoppingBag className="mr-3 text-emerald-500" />
                        Asset Marketplace
                    </h1>
                    <p className="text-slate-500 mt-1">Discover, download, and publish verified enterprise cloud assets.</p>
                </div>
                <button 
                    onClick={handlePublishClick}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center shadow-sm"
                >
                    <ShieldCheck size={18} className="mr-2" /> Publish Asset
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for templates, blueprints, or packs..." 
                        className="w-full pl-10 pr-4 py-2 border dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                activeCategory === cat 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading marketplace assets...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border-b dark:border-slate-700">
                                {/* Placeholder for Item Logo */}
                                <ShoppingBag size={48} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.name}</h3>
                                    <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-xs font-bold">
                                        <Star size={12} className="mr-1 fill-current" />
                                        {item.average_rating.toFixed(1)}
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">{item.category}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t dark:border-slate-700">
                                    <div className="flex items-center">
                                        <CheckCircle size={14} className="mr-1 text-blue-500" />
                                        {item.publisher}
                                    </div>
                                    <div className="flex items-center">
                                        <Download size={14} className="mr-1" />
                                        {item.download_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {items.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed dark:border-slate-700">
                            <p className="text-slate-500">No assets found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
