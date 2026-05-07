import React, { useState, useEffect } from 'react';
import { Box, Code, Save, Plus, Trash2, RefreshCw, Layers, CheckCircle, Info, Zap, Database, Terminal } from 'lucide-react';
import api from '../services/api';

const BlueprintStudio = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    content: '',
    icon: 'Box',
    provider: 'aws',
    est_cost: 0
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/marketplace/stacks');
      setTemplates(res.data);
      if (res.data.length > 0 && !selectedTemplate) {
        selectTemplate(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch blueprints:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (t) => {
    setSelectedTemplate(t);
    setEditData({
      name: t.name,
      description: t.description,
      content: t.content,
      icon: t.icon || 'Box',
      provider: t.provider || 'aws',
      est_cost: t.est_cost || 0
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/marketplace/templates/${selectedTemplate.id}`, editData);
      alert("Blueprint successfully refined and authorized.");
      fetchTemplates();
    } catch (err) {
      alert("Forge failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const createNew = async () => {
    const name = prompt("Enter Tactical Mission Name:");
    if (!name) return;
    
    try {
      const res = await api.post('/marketplace/templates', {
        name,
        stack_id: name.toLowerCase().replace(/ /g, '-'),
        description: "New tactical infrastructure mission.",
        content: "# Define your Terraform HCL here\n",
        provider: "aws",
        icon: "Box"
      });
      alert("New mission blueprint forged.");
      fetchTemplates();
    } catch (err) {
      alert("Forging failed: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <RefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-160px)] flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blueprint Studio</h1>
          <p className="text-gray-500">Forge and refine the underlying HCL code for your multi-cloud marketplace apps.</p>
        </div>
        <button 
          onClick={createNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Forge New Mission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Blueprint Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sovereign Catalog</h3>
          {templates.map(t => (
            <div 
              key={t.id}
              onClick={() => selectTemplate(t)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedTemplate?.id === t.id 
                ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20' 
                : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedTemplate?.id === t.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                   <Layers size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedTemplate?.id === t.id ? 'text-indigo-600' : 'text-gray-800'}`}>{t.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    {t.provider.toUpperCase()} | {t.iac_type.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selectedTemplate ? (
            <>
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <Code size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{selectedTemplate.stack_id}.tf</h3>
                   </div>
                   <div className="h-4 w-px bg-slate-200" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedTemplate.provider} Infrastructure</span>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save size={14} />}
                  {saving ? 'Authorizing...' : 'Save & Authorize'}
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Meta Editor */}
                <div className="w-72 border-r border-gray-50 p-6 space-y-6 overflow-y-auto">
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Icon Concept</label>
                      <select 
                        value={editData.icon}
                        onChange={(e) => setEditData({...editData, icon: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-gray-700 outline-none"
                      >
                         <option value="Box">Box (Standard)</option>
                         <option value="Zap">Zap (Performance)</option>
                         <option value="Database">Database (Data)</option>
                         <option value="Terminal">Terminal (Tools)</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                      <textarea 
                        rows="4"
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                   </div>
                   <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                         <Info size={14} className="text-indigo-600" />
                         <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Architect Tip</span>
                      </div>
                      <p className="text-[10px] text-indigo-500 leading-relaxed">
                        Use <code>data</code> blocks to auto-discover VPCs and Subnets for better multi-cloud resilience.
                      </p>
                   </div>
                </div>

                {/* HCL Editor */}
                <div className="flex-1 bg-slate-900 relative">
                   <textarea 
                     value={editData.content}
                     onChange={(e) => setEditData({...editData, content: e.target.value})}
                     className="w-full h-full bg-transparent text-indigo-300 font-mono text-sm p-8 outline-none resize-none custom-scrollbar"
                     placeholder="# Define your Terraform HCL here..."
                     spellCheck="false"
                   />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
               <Code size={48} className="mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-xs opacity-50">Select a blueprint to begin refining</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlueprintStudio;
