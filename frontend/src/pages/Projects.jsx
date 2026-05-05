import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Shield, DollarSign, TrendingUp, Users, Edit3, Trash2, AlertTriangle, CheckCircle, X, Zap } from 'lucide-react';
import api from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', budget_limit: 500, alert_threshold: 0.8, webhook_url: '', notify_on_lifecycle: true });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/');
      const projectList = res.data;
      setProjects(projectList);
      // Fetch summaries for all projects
      const summaryResults = await Promise.allSettled(
        projectList.map(p => api.get(`/projects/${p.id}/summary`))
      );
      const summaryMap = {};
      summaryResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          summaryMap[projectList[i].id] = result.value.data;
        }
      });
      setSummaries(summaryMap);
    } catch (err) {
      setError('Failed to load sovereign projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setFormData(project ? {
      name: project.name,
      description: project.description || '',
      budget_limit: project.budget_limit,
      alert_threshold: project.alert_threshold,
      webhook_url: project.webhook_url || '',
      notify_on_lifecycle: project.notify_on_lifecycle ?? true
    } : { name: '', description: '', budget_limit: 500, alert_threshold: 0.8, webhook_url: '', notify_on_lifecycle: true });
    setShowModal(true);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Project name is required'); return; }
    setSaving(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
      } else {
        await api.post('/projects/', formData);
      }
      setShowModal(false);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Decommission project "${project.name}"? All associated accounts will lose project binding.`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.detail || 'Decommission failed');
    }
  };

  const getBudgetColor = (pct) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 80) return '#f59e0b';
    return '#10b981';
  };

  const getBudgetStatus = (summary) => {
    if (!summary) return null;
    if (summary.budget_exceeded) return { icon: <AlertTriangle size={14} />, label: 'BUDGET EXCEEDED', color: '#ef4444' };
    if (summary.alert_breached) return { icon: <AlertTriangle size={14} />, label: 'ALERT THRESHOLD', color: '#f59e0b' };
    return { icon: <CheckCircle size={14} />, label: 'WITHIN BUDGET', color: '#10b981' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1227 50%, #0a0e1a 100%)', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '3px', height: '2rem', background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)', borderRadius: '2px' }} />
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Sovereign Projects</h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>Organizational boundaries & financial guardrails for your multi-cloud fleet</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          id="create-project-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20rem' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(99,102,241,0.3)' }}>
          <FolderOpen size={56} style={{ color: '#6366f1', marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ color: '#94a3b8', fontWeight: '500', marginBottom: '0.5rem' }}>No Sovereign Projects</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Create a project to define organizational boundaries and budget guardrails.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => {
            const summary = summaries[project.id];
            const budgetPct = summary?.budget_percentage || 0;
            const budgetColor = getBudgetColor(budgetPct);
            const budgetStatus = getBudgetStatus(summary);

            return (
              <div key={project.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Glow accent */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${budgetColor}15 0%, transparent 70%)`, borderRadius: '0 20px 0 120px' }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={20} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <h3 style={{ color: '#e2e8f0', fontWeight: '600', margin: 0, fontSize: '1rem' }}>{project.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{project.description || 'No description'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenModal(project)} style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(project)} style={{ width: '32px', height: '32px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Budget Bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>MTD Budget Consumption</span>
                    <span style={{ color: budgetColor, fontSize: '0.75rem', fontWeight: '700' }}>{budgetPct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(budgetPct, 100)}%`, height: '100%', background: `linear-gradient(90deg, ${budgetColor}88, ${budgetColor})`, borderRadius: '10px', transition: 'width 0.8s ease', boxShadow: `0 0 8px ${budgetColor}60` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>${summary?.current_spend_mtd?.toFixed(2) || '0.00'} spent</span>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>${project.budget_limit?.toFixed(2)} limit</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <Users size={12} style={{ color: '#6366f1' }} />
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Linked Accounts</span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '1.2rem', margin: 0 }}>{summary?.linked_accounts ?? '—'}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <Zap size={12} style={{ color: '#f59e0b' }} />
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Alert At</span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '1.2rem', margin: 0 }}>{(project.alert_threshold * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Status Badge */}
                {budgetStatus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.75rem', background: `${budgetStatus.color}15`, border: `1px solid ${budgetStatus.color}30`, borderRadius: '8px', width: 'fit-content' }}>
                    <span style={{ color: budgetStatus.color }}>{budgetStatus.icon}</span>
                    <span style={{ color: budgetStatus.color, fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em' }}>{budgetStatus.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f1729, #111827)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} style={{ color: '#fff' }} />
                </div>
                <h2 style={{ color: '#fff', fontWeight: '700', margin: 0, fontSize: '1.1rem' }}>
                  {editingProject ? 'Update Guardrails' : 'New Sovereign Project'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}

            {/* Project Hardware & Finance Specs */}
            {[
              { label: 'Project Name', key: 'name', type: 'text', placeholder: 'e.g. Production Infrastructure' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Brief description...' },
              { label: 'Monthly Budget Limit ($)', key: 'budget_limit', type: 'number', placeholder: '500' },
              { label: 'Webhook URL (Slack/Teams)', key: 'webhook_url', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '500', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</label>
                <input
                  id={`project-${field.key}`}
                  type={field.type}
                  value={formData[field.key]}
                  placeholder={field.placeholder}
                  onChange={e => setFormData(prev => ({ ...prev, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 0.9rem', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}

            <div style={{ marginBottom: '1.1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alert Threshold</label>
                  <span style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '700' }}>{(formData.alert_threshold * 100).toFixed(0)}%</span>
               </div>
               <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.alert_threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, alert_threshold: parseFloat(e.target.value) }))}
                  style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', appearance: 'none', outline: 'none', cursor: 'pointer' }}
               />
               <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Notify project owners when spend reaches this percentage of budget.</p>
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.2rem' }}>Lifecycle Event Broadcast</label>
                <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0 }}>Push lifecycle alerts (updates/deletions) to webhook</p>
              </div>
              <div 
                onClick={() => setFormData(p => ({ ...p, notify_on_lifecycle: !p.notify_on_lifecycle }))}
                style={{ width: '40px', height: '22px', background: formData.notify_on_lifecycle ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: formData.notify_on_lifecycle ? '20px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} id="save-project-btn" style={{ flex: 2, padding: '0.7rem', background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.875rem', boxShadow: saving ? 'none' : '0 0 20px rgba(99,102,241,0.4)' }}>
                {saving ? 'Saving...' : editingProject ? 'Update Guardrails' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Projects;
