export type ColumnType = 'numeric' | 'categorical' | 'date';

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  distinctCount: number;
  min?: number;
  max?: number;
  avg?: number;
  missingCount: number;
  sampleValues: any[];
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xKey: string;
  yKey: string;
  colors: string[];
  description?: string;
  size: 'half' | 'full';
  gridlines: boolean;
}

export interface KpiConfig {
  id: string;
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. 12.5 or -3.2
  description?: string;
  prefix?: string;
  suffix?: string;
}

export interface DataInsight {
  id: string;
  type: 'finding' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface DashboardConfig {
  id: string;
  name: string;
  theme: string;
  kpis: KpiConfig[];
  charts: ChartConfig[];
  insights: DataInsight[];
  createdAt: string;
  // Dynamic Enterprise AI BI Creator fields
  datasetSummary?: {
    rowsCount: number;
    colsCount: number;
    primaryKey?: string;
    columnsClassified: { name: string; type: string; classification: string }[];
    distributionNotes?: string;
  };
  datasetHealthReport?: {
    score: number;
    missingCount: number;
    duplicateCount: number;
    invalidCount: number;
    outlierNotes: string;
    anomalies: string[];
    cleaningSuggestions: string[];
  };
  businessDomain?: {
    domain: string;
    confidence: string;
    explanation: string;
  };
  chartRecommendations?: {
    chartTitle: string;
    chartType: string;
    reason: string;
    businessQuestion: string;
  }[];
  filters?: {
    name: string;
    type: string;
    suggestedValues: string[];
  }[];
  businessRecommendations?: {
    issue: string;
    reason: string;
    suggestedActions: string;
    expectedImpact: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  alerts?: {
    title: string;
    condition: string;
    explanation: string;
    level: 'critical' | 'warning' | 'info';
  }[];
  workflows?: {
    step: string;
    action: string;
    description: string;
  }[];
  roleBasedLayouts?: {
    role: string;
    viewAccess: string;
    editAccess: string;
    description: string;
  }[];
  dashboardComparisons?: {
    type: string;
    changesDetected: string;
    metricImpact: string;
    vivaExplanation: string;
  }[];
  futureEnhancements?: {
    enhancement: string;
    vivaValue: string;
    effort: 'Low' | 'Medium' | 'High';
  }[];
  vivaExplainer?: {
    title: string;
    kpiReasoning: string;
    chartReasoning: string;
    recommendationReasoning: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
}

export interface Organization {
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  usageRows: number;
  maxRows: number;
  members: TeamMember[];
}

export interface DatasetHealth {
  accuracy: number;
  completeness: number;
  duplicates: number;
  missingData: number;
  overallScore: number;
}

export interface Dataset {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
  schema: ColumnSchema[];
  cleaningLog: string[];
  health?: DatasetHealth;
}
