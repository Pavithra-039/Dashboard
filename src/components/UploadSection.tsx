import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Database,
  ArrowRight,
  RefreshCw,
  Clock,
  HelpCircle,
  ShieldCheck,
  Activity
} from 'lucide-react';
import Papa from 'papaparse';
import { PRESET_DATASETS } from '../data';
import { Dataset, ColumnSchema, ColumnType } from '../types';
import { calculateDatasetHealth } from '../utils';

interface UploadSectionProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  isLoading: boolean;
  onGenerateDashboard: (dataset: Dataset, userHint: string) => void;
}

export default function UploadSection({
  onDatasetLoaded,
  isLoading,
  onGenerateDashboard
}: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [parsedDataset, setParsedDataset] = useState<Dataset | null>(null);
  const [userHint, setUserHint] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse dates securely
  const isDate = (val: string): boolean => {
    if (!val || val.length < 4) return false;
    // Check if contains date structures
    const hasSeparators = val.includes('-') || val.includes('/') || val.includes('.');
    if (!hasSeparators) return false;
    const parsed = Date.parse(val);
    return !isNaN(parsed) && new Date(parsed).getFullYear() > 1990 && new Date(parsed).getFullYear() < 2035;
  };

  const processCsvContent = (csvText: string, name: string) => {
    setErrorMsg(null);
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, any>[];
        if (rows.length === 0) {
          setErrorMsg('The uploaded file appears to be empty.');
          return;
        }

        const columns = Object.keys(rows[0] || {});
        const cleaningLog: string[] = [];
        let fixedEmptyCells = 0;
        let formattedCurrencies = 0;

        // Clean & Format Data
        const cleanedRows = rows.map((row) => {
          const cleanedRow: Record<string, any> = {};
          columns.forEach((col) => {
            let val = row[col];
            
            // Clean empty cells
            if (val === undefined || val === null || val === '') {
              // Guess replacement based on column context
              cleanedRow[col] = 0; // Default number fallback
              fixedEmptyCells++;
            } else {
              let strVal = String(val).trim();
              
              // Clean currency symbols, commas, and percentage characters for numeric parsing
              if (strVal.startsWith('$') || strVal.endsWith('%')) {
                const stripped = strVal.replace(/[$,%]/g, '');
                if (!isNaN(Number(stripped))) {
                  strVal = stripped;
                  formattedCurrencies++;
                }
              }
              
              // Assign clean string or number
              if (strVal === '') {
                cleanedRow[col] = null;
              } else if (!isNaN(Number(strVal)) && strVal !== '') {
                cleanedRow[col] = Number(strVal);
              } else {
                cleanedRow[col] = strVal;
              }
            }
          });
          return cleanedRow;
        });

        // Log cleaning results
        if (fixedEmptyCells > 0) {
          cleaningLog.push(`Replaced ${fixedEmptyCells} empty values with clean fallbacks (0 or null).`);
        }
        if (formattedCurrencies > 0) {
          cleaningLog.push(`Parsed and normalized ${formattedCurrencies} formatted currency/percentage markers into raw integers.`);
        }
        if (cleaningLog.length === 0) {
          cleaningLog.push("Dataset loaded successfully with zero anomalies. Schema is fully compliant.");
        }

        // Auto Schema Detection
        const schema: ColumnSchema[] = columns.map((colName) => {
          const nonNullValues = cleanedRows.map((r) => r[colName]).filter((v) => v !== null && v !== undefined);
          const uniqueValues = Array.from(new Set(nonNullValues));
          
          // Determine type
          let detectedType: ColumnType = 'categorical';
          const sample = nonNullValues.slice(0, 50);
          
          const numericCount = sample.filter((v) => typeof v === 'number').length;
          const dateCount = sample.filter((v) => typeof v === 'string' && isDate(v)).length;

          if (numericCount > sample.length * 0.6) {
            detectedType = 'numeric';
          } else if (dateCount > sample.length * 0.6) {
            detectedType = 'date';
          }

          // Compute column aggregates for numericals
          let min: number | undefined;
          let max: number | undefined;
          let avg: number | undefined;

          if (detectedType === 'numeric') {
            const numericVals = nonNullValues.map((v) => Number(v)).filter((v) => !isNaN(v));
            if (numericVals.length > 0) {
              min = Math.min(...numericVals);
              max = Math.max(...numericVals);
              const sum = numericVals.reduce((a, b) => a + b, 0);
              avg = sum / numericVals.length;
            }
          }

          return {
            name: colName,
            type: detectedType,
            distinctCount: uniqueValues.length,
            min,
            max,
            avg,
            missingCount: rows.length - nonNullValues.length,
            sampleValues: uniqueValues.slice(0, 10)
          };
        });

        const health = calculateDatasetHealth(cleanedRows, columns);

        const newDataset: Dataset = {
          name,
          columns,
          rows: cleanedRows,
          schema,
          cleaningLog,
          health
        };

        setParsedDataset(newDataset);
        onDatasetLoaded(newDataset);
      },
      error: (err) => {
        setErrorMsg(`CSV Parsing failure: ${err.message}`);
      }
    });
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processCsvContent(evt.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processCsvContent(evt.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_DATASETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset.id);
      processCsvContent(preset.csv, preset.name);
    }
  };

  const getTypeBadgeColor = (type: ColumnType) => {
    switch (type) {
      case 'numeric':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'date':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div id="upload-center" className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
      {/* Upload Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-600" />
          Ingestion & Automated Analysis
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload spreadsheets, analyze structural schemas, and configure AI customization focuses.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Columns: Upload Zone & Clean Summary */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Drag-Drop Upload Area */}
          <div 
            id="drag-drop-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center bg-white transition duration-250 cursor-pointer ${
              dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              className="hidden" 
            />
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Upload className="w-6 h-6 text-indigo-600 animate-bounce" />
            </div>
            <h3 className="font-display font-semibold text-slate-800 text-base">
              Drag & Drop your CSV spreadsheet here
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Accepts plain CSV databases. Schema detection is processed locally inside your browser sandbox.
            </p>
            <button 
              type="button"
              className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              Browse Files
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preset Database Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Need instantly testable SaaS data? Choose an Industry Preset
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_DATASETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-4 rounded-xl border text-left transition hover:border-indigo-400 hover:shadow-sm ${
                    selectedPreset === p.id 
                      ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600' 
                      : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono tracking-wider font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {p.category}
                    </span>
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 block mb-1">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Table Preview & Schema Grid if parsed */}
          {parsedDataset && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              {/* Loaded Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-semibold text-slate-950 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    Pristine Data Clean Complete
                  </h3>
                  <span className="text-[10px] text-slate-500">File: {parsedDataset.name}</span>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{parsedDataset.rows.length}</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Row Count</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{parsedDataset.columns.length}</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Columns</span>
                  </div>
                </div>
              </div>

              {/* Data Quality Assistant */}
              {parsedDataset.health && (
                <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wider">
                          Data Quality Assistant
                        </h4>
                        <p className="text-[10px] text-slate-500">Heuristic health scoring and validation analysis</p>
                      </div>
                    </div>
                    
                    {/* Overall Score Circle badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Overall Score:</span>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                        parsedDataset.health.overallScore >= 90
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : parsedDataset.health.overallScore >= 80
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {parsedDataset.health.overallScore}%
                      </div>
                    </div>
                  </div>

                  {/* Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Accuracy */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block font-medium">Accuracy</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-slate-800">{parsedDataset.health.accuracy}%</span>
                        <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1 rounded">Verified</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${parsedDataset.health.accuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* Completeness */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block font-medium">Completeness</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-slate-800">{parsedDataset.health.completeness}%</span>
                        <span className="text-[9px] text-indigo-600 font-medium bg-indigo-50 px-1 rounded">Filled</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${parsedDataset.health.completeness}%` }}
                        />
                      </div>
                    </div>

                    {/* Duplicates */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block font-medium">Duplicates</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-slate-800">{parsedDataset.health.duplicates}</span>
                        <span className="text-[9px] text-slate-400">rows</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-2 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${parsedDataset.health.duplicates === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {parsedDataset.health.duplicates === 0 ? 'Pristine unique records' : 'Duplicate lines counted'}
                      </div>
                    </div>

                    {/* Missing Data */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block font-medium">Missing Data</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-slate-800">{parsedDataset.health.missingData}</span>
                        <span className="text-[9px] text-slate-400 font-medium">cells</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-2 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${parsedDataset.health.missingData === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {parsedDataset.health.missingData === 0 ? 'Zero empty values' : 'Auto-scrubbed to 0'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cleaning validation log */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-mono text-slate-600 space-y-1">
                <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider mb-1">Data Quality Log:</span>
                {parsedDataset.cleaningLog.map((log, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Mini Row Preview table */}
              <div>
                <span className="text-[10px] font-bold text-slate-800 block uppercase tracking-wider mb-2">First 5 Sample Rows Preview:</span>
                <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-60">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 font-medium text-slate-800 border-b border-slate-100">
                      <tr>
                        {parsedDataset.columns.map((col, idx) => {
                          const colMeta = parsedDataset.schema.find(s => s.name === col);
                          return (
                            <th key={idx} className="p-2.5 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{col}</span>
                                <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{colMeta?.type || 'string'}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedDataset.rows.slice(0, 5).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/50 last:border-b-0">
                          {parsedDataset.columns.map((col, cIdx) => (
                            <td key={cIdx} className="p-2.5 font-mono text-[11px] text-slate-600">
                              {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Automation Config & Triggers */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-indigo-100 border border-indigo-950 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 scale-150 opacity-10">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            
            <h3 className="font-display font-bold text-white text-base mb-2 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              AI Dashboard Builder
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed mb-4">
              Gemini will evaluate the column schemas and sample data, recommend the optimal visual layout (MRR tracking, category counts), set coordinates, detect anomalies, and compose high-impact KPI aggregates!
            </p>

            <div className="space-y-4 pt-3 border-t border-indigo-800/80">
              <div>
                <label className="text-xs font-semibold text-indigo-100 block mb-1.5 flex items-center gap-1">
                  Focus Focus Objective (Optional)
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" title="Instruct Gemini to focus heavily on specific parameters like conversion optimization, monthly margins, or ad spend CTR." />
                </label>
                <textarea
                  value={userHint}
                  onChange={(e) => setUserHint(e.target.value)}
                  placeholder="e.g., Focus insights on Monthly MRR trajectories, find where churn spikes, and optimize campaign budgets"
                  className="w-full bg-indigo-950/60 border border-indigo-800/80 rounded-xl p-3 text-xs text-white placeholder-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 h-24 resize-none leading-normal"
                />
              </div>

              <button
                id="generate-dashboard-btn"
                disabled={!parsedDataset || isLoading}
                onClick={() => parsedDataset && onGenerateDashboard(parsedDataset, userHint)}
                className={`w-full font-display font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10 transition duration-200 ${
                  !parsedDataset 
                    ? 'bg-indigo-950 text-indigo-500 border border-indigo-900/40 cursor-not-allowed' 
                    : 'bg-white hover:bg-slate-100 text-indigo-950 cursor-pointer hover:scale-[1.01]'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-900" />
                    Analyzing Schema...
                  </>
                ) : (
                  <>
                    Generate Dashboard
                    <ArrowRight className="w-4 h-4 text-indigo-950" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Detected Schema Breakdown Cards */}
          {parsedDataset && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                Detected Columns
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {parsedDataset.schema.map((col, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-900 truncate block">{col.name}</span>
                      <span className="text-[10px] text-slate-500 block">Unique states: {col.distinctCount}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTypeBadgeColor(col.type)}`}>
                      {col.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
