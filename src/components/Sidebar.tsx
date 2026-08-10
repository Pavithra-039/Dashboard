import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Settings, 
  CreditCard, 
  ChevronDown, 
  Plus, 
  Building2, 
  Sparkles, 
  User,
  ShieldCheck,
  Zap,
  Eye
} from 'lucide-react';
import { Organization } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'upload' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'upload' | 'settings') => void;
  organizations: Organization[];
  activeOrg: Organization;
  setActiveOrg: (org: Organization) => void;
  onCreateOrg: (name: string, plan: 'starter' | 'growth' | 'enterprise') => void;
  userEmail: string;
  onTogglePreviewMode?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  organizations,
  activeOrg,
  setActiveOrg,
  onCreateOrg,
  userEmail,
  onTogglePreviewMode
}: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim()) {
      onCreateOrg(newOrgName.trim(), newOrgPlan);
      setNewOrgName('');
      setShowCreateModal(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'growth':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <aside id="sidebar-navigation" className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/20">
          D
        </div>
        <div>
          <h1 className="font-display font-semibold text-white tracking-tight leading-none text-sm">Dashboard Creator</h1>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider uppercase">SaaS Enterprise</span>
        </div>
      </div>

      {/* Workspace Selector Dropdown */}
      <div className="p-4 border-b border-slate-800 relative">
        <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block mb-1">Active Workspace</label>
        <button 
          id="workspace-dropdown-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-slate-950 hover:bg-slate-900 text-left px-3 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-sm font-medium transition duration-200 text-white"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{activeOrg.name}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {dropdownOpen && (
          <div id="workspace-dropdown-menu" className="absolute left-4 right-4 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-50 py-1.5 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrg(org);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-900/80 transition ${
                    activeOrg.id === org.id ? 'text-white font-semibold bg-indigo-950/40 border-l-2 border-indigo-500' : 'text-slate-400'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold scale-90 border">
                    {org.plan}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-800/80 mt-1.5 pt-1.5 px-2">
              <button
                id="create-workspace-btn"
                onClick={() => {
                  setShowCreateModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block px-2 mb-2">Core Modules</label>
        
        <button
          id="nav-tab-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'dashboard' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard Builder
        </button>

        <button
          id="nav-tab-upload"
          onClick={() => setCurrentTab('upload')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'upload' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4 shrink-0" />
          Data Upload & Clean
        </button>

        <button
          id="nav-tab-settings"
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'settings' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Workspace & Team
        </button>
      </nav>

      {/* Organization Plan Indicator Box */}
      <div className="p-4 m-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Tier Status</span>
          <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getPlanBadgeColor(activeOrg.plan)}`}>
            {activeOrg.plan.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-normal mb-3">
          Usage: <strong className="text-white">{activeOrg.usageRows.toLocaleString()}</strong> / {activeOrg.maxRows.toLocaleString()} rows
        </p>
        
        {activeOrg.plan === 'starter' && (
          <button 
            onClick={() => setCurrentTab('settings')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition duration-200"
          >
            <Zap className="w-3.5 h-3.5" />
            Upgrade to Pro
          </button>
        )}
      </div>

      {/* User Information Profile & Shared Link Action */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-700 flex items-center justify-center text-indigo-200 font-semibold text-xs shrink-0">
            {userEmail.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-white truncate max-w-[130px]" title={userEmail}>
                {userEmail.split('@')[0]}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-500 truncate block">{userEmail}</span>
          </div>
        </div>

        {/* Prominent Preview Shared Link Pill Button matching design */}
        <button
          onClick={onTogglePreviewMode}
          className="w-full bg-[#0d1326] hover:bg-[#131b36] active:bg-[#182245] text-white text-xs font-semibold px-3 py-2 rounded-xl border border-indigo-500/30 hover:border-indigo-400/60 shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 transition cursor-pointer group"
          title="Preview the exact shareable read-only dashboard link"
        >
          <div className="p-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 group-hover:text-white group-hover:scale-110 transition-transform shrink-0">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-wide">Preview Shared Link</span>
        </button>
      </div>

      {/* Create Workspace Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6">
            <h3 className="font-display font-semibold text-lg text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Create Business Workspace
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Organizations act as independent workspaces where dashboards and customer records are isolated.
            </p>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Subscription Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'starter', label: 'Starter', price: 'Free' },
                    { id: 'growth', label: 'Growth Pro', price: '$49/mo' },
                    { id: 'enterprise', label: 'Enterprise', price: '$199/mo' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setNewOrgPlan(tier.id as any)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                        newOrgPlan === tier.id 
                          ? 'border-indigo-500 bg-indigo-950/30 text-white' 
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{tier.label}</span>
                      <span className="text-[10px] font-mono text-indigo-400 mt-1">{tier.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
