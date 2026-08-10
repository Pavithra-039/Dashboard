import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Database, 
  HelpCircle, 
  Bot, 
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import WorkspaceSettings from './components/WorkspaceSettings';
import DashboardView from './components/DashboardView';
import DashboardChat from './components/DashboardChat';

import { PRESET_DATASETS } from './data';
import { Dataset, Organization, DashboardConfig, TeamMember, ColumnSchema } from './types';
import { calculateDatasetHealth } from './utils';

// Simple CSV Parser to initialize default dataset so application loads with mock data on first view
function parseInitialPresetCsv(csvText: string, name: string): Dataset {
  const lines = csvText.split('\n').filter(l => l.trim() !== '');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      let val = vals[idx]?.trim() || '';
      if (!isNaN(Number(val)) && val !== '') {
        obj[h] = Number(val);
      } else {
        obj[h] = val;
      }
    });
    return obj;
  });

  const schema: ColumnSchema[] = headers.map(h => {
    const vals = rows.map(r => r[h]).filter(v => v !== undefined && v !== null);
    const unique = Array.from(new Set(vals));
    const isNum = vals.every(v => typeof v === 'number');
    let min, max, avg;
    if (isNum && vals.length > 0) {
      const nums = vals as number[];
      min = Math.min(...nums);
      max = Math.max(...nums);
      avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    }
    return {
      name: h,
      type: isNum ? 'numeric' : h.toLowerCase().includes('date') ? 'date' : 'categorical',
      distinctCount: unique.length,
      min,
      max,
      avg,
      missingCount: 0,
      sampleValues: unique.slice(0, 5)
    };
  });

  const health = calculateDatasetHealth(rows, headers);

  return {
    name,
    columns: headers,
    rows,
    schema,
    cleaningLog: ["Seed dataset loaded from core SaaS presets.", "Format validation passed successfully."],
    health
  };
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'upload' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Simulation for checking read-only presentation share links
  const [isPreviewShareMode, setIsPreviewShareMode] = useState(false);

  // User details
  const userEmail = "pavithrabharath33@gmail.com";

  // SEED DEFAULT MULTI-TENANT WORKSPACES
  const defaultOrgs: Organization[] = [
    {
      id: 'org_acme',
      name: 'Acme Growth Systems',
      plan: 'growth',
      usageRows: 2450,
      maxRows: 100000,
      members: [
        { id: 'm1', name: 'Pavithra', email: 'pavithrabharath33@gmail.com', role: 'Admin', status: 'Active' },
        { id: 'm2', name: 'Alex Rivera', email: 'alex.rivera@acme.com', role: 'Editor', status: 'Active' },
        { id: 'm3', name: 'Elena Rostova', email: 'elena.r@acme.com', role: 'Viewer', status: 'Pending' }
      ]
    },
    {
      id: 'org_global',
      name: 'Global Logistics Corp',
      plan: 'enterprise',
      usageRows: 48900,
      maxRows: 9999999,
      members: [
        { id: 'g1', name: 'Pavithra', email: 'pavithrabharath33@gmail.com', role: 'Admin', status: 'Active' },
        { id: 'g2', name: 'Marcus Sterling', email: 'm.sterling@logistics.com', role: 'Admin', status: 'Active' }
      ]
    },
    {
      id: 'org_sandbox',
      name: 'Personal Dev Playground',
      plan: 'starter',
      usageRows: 120,
      maxRows: 5000,
      members: [
        { id: 's1', name: 'Pavithra', email: 'pavithrabharath33@gmail.com', role: 'Admin', status: 'Active' }
      ]
    }
  ];

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('saas_dash_orgs');
    return saved ? JSON.parse(saved) : defaultOrgs;
  });

  const [activeOrg, setActiveOrg] = useState<Organization>(() => {
    return organizations[0];
  });

  // Save organizations to local state when updated
  useEffect(() => {
    localStorage.setItem('saas_dash_orgs', JSON.stringify(organizations));
  }, [organizations]);

  // Seed default active dataset so dashboard is fully active immediately upon boot
  const [activeDataset, setActiveDataset] = useState<Dataset>(() => {
    const firstPreset = PRESET_DATASETS[0];
    return parseInitialPresetCsv(firstPreset.csv, firstPreset.name);
  });

  // SEED DEFAULT DASHBOARD CONFIG
  const defaultDashboard: DashboardConfig = {
    id: 'dash_default_saas',
    name: 'Executive MRR & Growth Forecast',
    theme: 'midnight',
    kpis: [
      { id: 'kpi_1', title: 'Average MRR Revenue', value: '$41,066.67', change: 8.4, description: 'Aggregated monthly recurring subscription run-rate', prefix: '$' },
      { id: 'kpi_2', title: 'Peak CAC threshold', value: '$62.00', change: -12.1, description: 'Maximum customer acquisition cost recorded', prefix: '$' },
      { id: 'kpi_3', title: 'Workspace Row Volume', value: '12 analytical rows', change: 4.8, description: 'Clean data columns parsed locally' }
    ],
    charts: [
      {
        id: 'chart_mrr_trend',
        title: 'Monthly Recurring Revenue Trend',
        type: 'line',
        xKey: 'Date',
        yKey: 'MRR',
        colors: ['#4F46E5'],
        description: 'Visualizes SaaS recurring run-rates over 12 months illustrating upward growth vectors.',
        size: 'full',
        gridlines: true
      },
      {
        id: 'chart_cac_conversion',
        title: 'LTV Breakdown by Plan Category',
        type: 'bar',
        xKey: 'Category',
        yKey: 'Customer_LTV',
        colors: ['#10B981'],
        description: 'Cross-segment analysis comparing target Customer Lifetime Value across tiers.',
        size: 'half',
        gridlines: true
      },
      {
        id: 'chart_adspend_conversion',
        title: 'Ad Spend Allocation distribution',
        type: 'pie',
        xKey: 'Category',
        yKey: 'Ad_Spend',
        colors: ['#EF4444', '#10B981', '#3B82F6'],
        description: 'Proportional distribution of marketing budget spent on acquisition plans.',
        size: 'half',
        gridlines: false
      }
    ],
    insights: [
      {
        id: 'ins_1',
        type: 'finding',
        title: 'Accelerating Revenue Momentum',
        description: 'Monthly recurring sales show strong linear progression. MRR expanded from $15.2k in January to peak at $71.2k in December.',
        impact: 'high'
      },
      {
        id: 'ins_2',
        type: 'anomaly',
        title: 'CAC Volatility Outlier Detected',
        description: 'Customer Acquisition Costs spiked significantly in March ($62) compared to our median average ($47), correlating with high budget exploratory ad groups.',
        impact: 'medium'
      },
      {
        id: 'ins_3',
        type: 'opportunity',
        title: 'Segment Consolidation Opportunity',
        description: 'Enterprise tiers demonstrate highest customer lifetime returns ($1.6k). Redirecting 15% of starter ad budgets to enterprise targets will raise margins.',
        impact: 'high'
      }
    ],
    createdAt: new Date().toLocaleDateString()
  };

  const [dashboard, setDashboard] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem('saas_dash_active_config');
    return saved ? JSON.parse(saved) : defaultDashboard;
  });

  useEffect(() => {
    localStorage.setItem('saas_dash_active_config', JSON.stringify(dashboard));
  }, [dashboard]);

  // ORG EVENT HANDLERS
  const handleCreateOrg = (name: string, plan: 'starter' | 'growth' | 'enterprise') => {
    const maxRows = plan === 'starter' ? 5000 : plan === 'growth' ? 100000 : 9999999;
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name,
      plan,
      usageRows: 0,
      maxRows,
      members: [
        { id: `m_${Date.now()}`, name: 'Pavithra', email: userEmail, role: 'Admin', status: 'Active' }
      ]
    };
    const updated = [...organizations, newOrg];
    setOrganizations(updated);
    setActiveOrg(newOrg);
    setCurrentTab('upload');
  };

  const handleUpdateOrgName = (newName: string) => {
    const updatedOrgs = organizations.map(org => {
      if (org.id === activeOrg.id) {
        return { ...org, name: newName };
      }
      return org;
    });
    setOrganizations(updatedOrgs);
    setActiveOrg({ ...activeOrg, name: newName });
  };

  const handleUpdateOrgPlan = (newPlan: 'starter' | 'growth' | 'enterprise') => {
    const maxRows = newPlan === 'starter' ? 5000 : newPlan === 'growth' ? 100000 : 9999999;
    const updatedOrgs = organizations.map(org => {
      if (org.id === activeOrg.id) {
        return { ...org, plan: newPlan, maxRows };
      }
      return org;
    });
    setOrganizations(updatedOrgs);
    setActiveOrg({ ...activeOrg, plan: newPlan, maxRows });
  };

  const handleInviteMember = (newMem: Omit<TeamMember, 'id' | 'status'>) => {
    const updatedMem: TeamMember = {
      ...newMem,
      id: `mem_${Date.now()}`,
      status: 'Pending'
    };
    const updatedOrgs = organizations.map(org => {
      if (org.id === activeOrg.id) {
        return { ...org, members: [...org.members, updatedMem] };
      }
      return org;
    });
    setOrganizations(updatedOrgs);
    setActiveOrg({ ...activeOrg, members: [...activeOrg.members, updatedMem] });
  };

  const handleDatasetLoaded = (dataset: Dataset) => {
    setActiveDataset(dataset);
  };

  // GENERATE DASHBOARD VIA SERVER-SIDE GEMINI API Proxy
  const handleGenerateDashboard = async (dataset: Dataset, hint: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: dataset.schema,
          sampleRows: dataset.rows.slice(0, 10),
          userHint: hint
        })
      });

      const data = await response.json();
      
      const newDashboard: DashboardConfig = {
        id: `dash_${Date.now()}`,
        name: data.dashboardName || 'Automated Analytical Board',
        theme: dashboard.theme, // preserve user chosen theme
        kpis: data.kpis.map((k: any, i: number) => ({
          id: `kpi_${i}`,
          title: k.title,
          value: k.value,
          change: k.change || undefined,
          description: k.description,
          prefix: k.prefix || undefined,
          suffix: k.suffix || undefined
        })),
        charts: data.charts.map((c: any, i: number) => ({
          id: `chart_${i}`,
          title: c.title,
          type: c.type,
          xKey: c.xKey,
          yKey: c.yKey,
          colors: c.colors || ['#6366F1', '#10B981'],
          description: c.description || '',
          size: c.size || 'half',
          gridlines: true
        })),
        insights: data.insights.map((ins: any, i: number) => ({
          id: `ins_${i}`,
          type: ins.type,
          title: ins.title,
          description: ins.description,
          impact: ins.impact || 'medium'
        })),
        createdAt: new Date().toLocaleDateString()
      };

      setDashboard(newDashboard);

      // Track usage rows inside active org
      const updatedOrgs = organizations.map(org => {
        if (org.id === activeOrg.id) {
          return { ...org, usageRows: dataset.rows.length };
        }
        return org;
      });
      setOrganizations(updatedOrgs);
      setActiveOrg({ ...activeOrg, usageRows: dataset.rows.length });

      setCurrentTab('dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // If in Preview Share Mode, we render the read-only dashboard layout (full screen, distraction-free!)
  if (isPreviewShareMode) {
    return (
      <div id="app-root-container" className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Share preview header */}
        <div className="bg-slate-900 text-white py-2.5 px-4 flex items-center justify-between z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold">Shared Presentation Link Mode (Simulation Active)</span>
          </div>
          <button
            onClick={() => setIsPreviewShareMode(false)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1 rounded transition"
          >
            Return to Builder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DashboardView
            dataset={activeDataset}
            dashboard={dashboard}
            onUpdateDashboard={setDashboard}
            onOpenChat={() => {}}
            isChatOpen={false}
            isReadOnly={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Primary Sidebar Layout */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        organizations={organizations}
        activeOrg={activeOrg}
        setActiveOrg={(org) => {
          setActiveOrg(org);
          // Auto route to appropriate tab
          setCurrentTab('dashboard');
        }}
        onCreateOrg={handleCreateOrg}
        userEmail={userEmail}
        onTogglePreviewMode={() => setIsPreviewShareMode(true)}
      />

      {/* Main Work Area Canvas */}
      <main className="flex-1 flex overflow-hidden h-screen relative">
        {currentTab === 'dashboard' && (
          <DashboardView
            dataset={activeDataset}
            dashboard={dashboard}
            onUpdateDashboard={setDashboard}
            onOpenChat={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            onTogglePreviewMode={() => setIsPreviewShareMode(true)}
          />
        )}

        {currentTab === 'upload' && (
          <UploadSection
            onDatasetLoaded={handleDatasetLoaded}
            isLoading={isLoading}
            onGenerateDashboard={handleGenerateDashboard}
          />
        )}

        {currentTab === 'settings' && (
          <WorkspaceSettings
            activeOrg={activeOrg}
            onUpdateOrgName={handleUpdateOrgName}
            onUpdateOrgPlan={handleUpdateOrgPlan}
            onInviteMember={handleInviteMember}
          />
        )}

        {/* AI Analysts Sidebar Drawer */}
        <DashboardChat
          dataset={activeDataset}
          currentDashboard={dashboard}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </main>

      {/* Global loading screen overlay for full dashboard regeneration */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white no-print">
          <div className="text-center max-w-sm px-6">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
              <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 text-white">Synthesizing Dataset Analytics</h3>
            <p className="text-xs text-indigo-200/80 leading-normal animate-pulse">
              Gemini 3.5 is scanning column statistics, mapping coordinates, and configuring bento-grid charts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
