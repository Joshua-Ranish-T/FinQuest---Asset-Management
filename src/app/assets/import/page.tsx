'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { api, ApiError } from '@/lib/api-client';
import { AssetClass } from '@/types';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, Layers, ShieldCheck, Sparkles 
} from 'lucide-react';

interface ParsedAsset {
  name: string;
  asset_class: AssetClass;
  institution: string;
  quantity: number;
  buy_price: number;
  current_value: number;
  currency: string;
}

export default function AssetImportPage() {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<'ZERODHA' | 'GROWW' | 'GENERIC'>('ZERODHA');
  const [parsedRows, setParsedRows] = useState<ParsedAsset[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      toast.error('CSV file contains no data rows.');
      return;
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.replace(/["']/g, '').trim());
    const rows: ParsedAsset[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.replace(/["']/g, '').trim());
      if (cols.length < 2) continue;

      let name = '';
      let qty = 1;
      let buyPrice = 0;
      let currVal = 0;
      let assetClass: AssetClass = 'EQUITY';

      if (selectedSource === 'ZERODHA') {
        // Zerodha Holdings CSV: Instrument,Qty.,Avg. cost,Cur. val,P&L
        const instIndex = headers.findIndex((h) => h.includes('instrument') || h.includes('stock') || h.includes('symbol'));
        const qtyIndex = headers.findIndex((h) => h.includes('qty'));
        const costIndex = headers.findIndex((h) => h.includes('avg') || h.includes('cost'));
        const valIndex = headers.findIndex((h) => h.includes('cur') || h.includes('val'));

        name = cols[instIndex >= 0 ? instIndex : 0] || `Stock ${i}`;
        qty = Number(cols[qtyIndex >= 0 ? qtyIndex : 1]) || 1;
        buyPrice = Number(cols[costIndex >= 0 ? costIndex : 2]) || 0;
        currVal = Number(cols[valIndex >= 0 ? valIndex : 3]) || (qty * buyPrice);
        assetClass = 'EQUITY';
      } else if (selectedSource === 'GROWW') {
        // Groww: Stock name, Symbol, Shares, Average price, Current value
        name = cols[0] || `Groww Holding ${i}`;
        qty = Number(cols[2]) || 1;
        buyPrice = Number(cols[3]) || 0;
        currVal = Number(cols[4]) || (qty * buyPrice);
        assetClass = name.toLowerCase().includes('fund') ? 'MUTUAL_FUND' : 'EQUITY';
      } else {
        // Generic: Name, Quantity, Cost, Value
        name = cols[0] || `Asset ${i}`;
        qty = Number(cols[1]) || 1;
        buyPrice = Number(cols[2]) || 0;
        currVal = Number(cols[3]) || buyPrice;
      }

      if (name && currVal > 0) {
        rows.push({
          name,
          asset_class: assetClass,
          institution: selectedSource === 'ZERODHA' ? 'Zerodha' : selectedSource === 'GROWW' ? 'Groww' : 'Imported',
          quantity: qty,
          buy_price: buyPrice,
          current_value: currVal,
          currency: 'INR',
        });
      }
    }

    if (rows.length === 0) {
      toast.error('Could not detect valid holdings. Please check CSV format.');
    } else {
      setParsedRows(rows);
      toast.success(`Parsed ${rows.length} holdings from ${fileName || 'CSV'}!`);
    }
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;

    try {
      setLoading(true);
      await api.post('/assets/import', { assets: parsedRows });
      toast.success(`Successfully imported ${parsedRows.length} assets!`);
      router.push('/assets');
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 403 || err.code === 'BULK_IMPORT_EXCEEDS_QUOTA')) {
        setShowUpgradeModal(true);
      } else {
        toast.error(err instanceof Error ? err.message : 'Import failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSampleZerodha = () => {
    const sample = `Instrument,Qty.,Avg. cost,Cur. val,P&L
RELIANCE,25,2450.00,72500.00,11250.00
TCS,15,3600.00,61500.00,7500.00
INFY,50,1420.00,88000.00,17000.00
HDFCBANK,40,1520.00,68800.00,8000.00`;
    setSelectedSource('ZERODHA');
    setFileName('sample_zerodha_holdings.csv');
    parseCSV(sample);
  };

  return (
    <>
      <Header />
      <main style={{ padding: '3.5rem 0 5rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <Link href="/assets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Assets Portfolio</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '8px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <h1 style={{ fontSize: '2rem' }}>Import Broker Statement</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Direct browser-parsed CSV import from Zerodha, Groww, or generic spreadsheets with zero server credential access.
          </p>

          {/* Source Selector */}
          <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Select Statement Source
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {(['ZERODHA', 'GROWW', 'GENERIC'] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setSelectedSource(source)}
                  className={selectedSource === source ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
                >
                  {source === 'ZERODHA' ? 'Zerodha Holdings CSV' : source === 'GROWW' ? 'Groww Holdings CSV' : 'Generic CSV'}
                </button>
              ))}
            </div>
          </div>

          {/* File Dropzone */}
          <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', border: '2px dashed var(--border-medium)', marginBottom: '2rem' }}>
            <Upload size={36} color="var(--brand-primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {fileName ? fileName : 'Upload your holdings CSV file'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              File is parsed 100% locally on your machine.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label className="btn-primary" style={{ cursor: 'pointer', padding: '0.65rem 1.25rem' }}>
                <span>Select CSV File</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <button type="button" onClick={loadSampleZerodha} className="btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
                Load Sample Zerodha CSV
              </button>
            </div>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Preview Holdings ({parsedRows.length})</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review records before adding to portfolio</div>
                </div>

                <button
                  onClick={handleCommitImport}
                  disabled={loading}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  {loading ? 'Importing...' : `Commit Import (${parsedRows.length})`}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {parsedRows.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{row.name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Qty: {row.quantity} &bull; Avg Cost: ₹{row.buy_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      ₹{row.current_value.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--brand-primary)', textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quota Limit Exceeded</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Importing this statement exceeds your Free plan quota of 25 assets. Upgrade to <strong>FinQuest Pro</strong> for unlimited asset imports.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/#pricing" className="btn-primary" style={{ padding: '0.8rem' }}>
                  Upgrade to Pro (₹2,999 Lifetime)
                </Link>
                <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary" style={{ padding: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
