import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Mail, 
  UserPlus, 
  Check, 
  AlertCircle,
  TrendingUp,
  Clock,
  Download,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Organization, TeamMember } from '../types';

interface WorkspaceSettingsProps {
  activeOrg: Organization;
  onUpdateOrgName: (name: string) => void;
  onUpdateOrgPlan: (plan: 'starter' | 'growth' | 'enterprise') => void;
  onInviteMember: (member: Omit<TeamMember, 'id' | 'status'>) => void;
}

export default function WorkspaceSettings({
  activeOrg,
  onUpdateOrgName,
  onUpdateOrgPlan,
  onInviteMember
}: WorkspaceSettingsProps) {
  const [name, setName] = useState(activeOrg.name);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Viewer');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showInviteSuccess, setShowInviteSuccess] = useState(false);

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateOrgName(name.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteName.trim() && inviteEmail.trim()) {
      onInviteMember({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteName('');
      setInviteEmail('');
      setShowInviteSuccess(true);
      setTimeout(() => setShowInviteSuccess(false), 4000);
    }
  };

  const currentPricing = {
    starter: { price: 'Free Forever', max: '5,000 rows', features: ['1 Workspace', 'Basic Charting', 'Static Export', 'Manual Data Cleaning'] },
    growth: { price: '$49/month', max: '100,000 rows', features: ['3 Workspaces', 'Advanced AI Recommendations', 'Interactive Filters', 'Ask AI Co-pilot Chat', 'PDF Reporting'] },
    enterprise: { price: '$199/month', max: 'Unlimited rows', features: ['Unlimited Workspaces', 'Priority Dedicated Gemini Model', 'Organization Team Members', 'Automated Anomaly Alerts', 'Public Report Publishing'] }
  };

  const invoices = [
    { id: 'INV-2026-004', date: 'Jul 01, 2026', amount: activeOrg.plan === 'starter' ? '$0.00' : activeOrg.plan === 'growth' ? '$49.00' : '$199.00', status: 'Paid' },
    { id: 'INV-2026-003', date: 'Jun 01, 2026', amount: activeOrg.plan === 'starter' ? '$0.00' : activeOrg.plan === 'growth' ? '$49.00' : '$199.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'May 01, 2026', amount: activeOrg.plan === 'starter' ? '$0.00' : activeOrg.plan === 'growth' ? '$49.00' : '$199.00', status: 'Paid' }
  ];

  return (
    <div id="workspace-settings-panel" className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
      {/* Settings Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Workspace & Organization Hub
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization credentials, billing preferences, seat subscriptions, and team invites.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Profile & Team Members */}
        <div className="md:col-span-2 space-y-6">
          {/* General Config Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-display font-semibold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              Organization Identity
            </h3>
            
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Company / Organization Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shrink-0"
                  >
                    Save Changes
                  </button>
                </div>
                {saveSuccess && (
                  <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Workspace name updated.
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Team Members List & Invite Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-display font-semibold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-600" />
              Team Members ({activeOrg.members.length})
            </h3>

            {/* Simulated Active Members Grid */}
            <div className="space-y-3 mb-6">
              {activeOrg.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                      {member.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900">{member.name}</span>
                        {member.role === 'Admin' && (
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-mono font-bold px-1 py-0.2 rounded uppercase">
                            Owner
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-600">{member.role}</span>
                    <span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${
                      member.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Form */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                Invite Team Contributor
              </h4>

              {showInviteSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="font-semibold">Invitation Dispatched!</strong> An automated workspace link has been simulated & sent.
                  </div>
                </div>
              )}

              <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  required
                  placeholder="colleague@domain.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <select
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 rounded-lg transition"
                  >
                    Invite
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Subscription Pricing Switcher & Past Invoices */}
        <div className="space-y-6">
          {/* Active Subscription Status */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full mb-3 inline-block">
              Billing Hub
            </span>
            <h3 className="font-display font-semibold text-base mb-1">
              {activeOrg.plan === 'starter' ? 'Free Starter Plan' : activeOrg.plan === 'growth' ? 'Growth Pro Plan' : 'Enterprise Scale'}
            </h3>
            <p className="text-xl font-display font-bold text-indigo-300 mt-2">
              {currentPricing[activeOrg.plan].price}
            </p>
            <div className="border-t border-slate-800/80 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Row Capacity:</span>
                <span className="text-slate-200 font-semibold">{currentPricing[activeOrg.plan].max}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Workspaces:</span>
                <span className="text-slate-200 font-semibold">{activeOrg.plan === 'starter' ? '1 Workspace' : activeOrg.plan === 'growth' ? '3 Workspaces' : 'Unlimited'}</span>
              </div>
            </div>
          </div>

          {/* Pricing Upgrade Selector Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              Toggle Plan Tier
            </h3>
            
            <div className="space-y-2">
              {[
                { id: 'starter', label: 'Starter', price: 'Free', color: 'border-slate-200 hover:bg-slate-50' },
                { id: 'growth', label: 'Growth Pro', price: '$49/mo', color: 'border-blue-200 hover:bg-blue-50/20' },
                { id: 'enterprise', label: 'Enterprise', price: '$199/mo', color: 'border-purple-200 hover:bg-purple-50/20' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onUpdateOrgPlan(p.id as any)}
                  className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition ${
                    activeOrg.plan === p.id 
                      ? 'border-indigo-600 bg-indigo-50/30' 
                      : p.color
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block text-slate-900">{p.label}</span>
                    <span className="text-[10px] text-slate-500">{currentPricing[p.id as keyof typeof currentPricing].max} limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600">{p.price}</span>
                    {activeOrg.plan === p.id && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Invoices List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Billing Receipts
            </h3>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-800 block">{inv.id}</span>
                    <span className="text-[9px] text-slate-500">{inv.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-700">{inv.amount}</span>
                    <button 
                      onClick={() => alert(`Simulating invoice download for ${inv.id}`)}
                      className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
