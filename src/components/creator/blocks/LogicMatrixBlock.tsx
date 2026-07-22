import { Check, Plus, Trash2, X } from 'lucide-react';

export interface LogicMatrixConfig {
  rowHeaders: string[];
  colHeaders: string[];
  // cells[row][col] = '' | 'check' | 'x'
  cells: ('' | 'check' | 'x')[][];
}

interface Props {
  config: LogicMatrixConfig;
  onChange?: (next: LogicMatrixConfig) => void;
  mode?: 'edit' | 'play';
}

function ensureGrid(cfg: LogicMatrixConfig): LogicMatrixConfig {
  const rows = cfg.rowHeaders.length;
  const cols = cfg.colHeaders.length;
  const cells: ('' | 'check' | 'x')[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: ('' | 'check' | 'x')[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(cfg.cells?.[r]?.[c] ?? '');
    }
    cells.push(row);
  }
  return { ...cfg, cells };
}

export default function LogicMatrixBlock({ config, onChange, mode = 'play' }: Props) {
  const cfg = ensureGrid(config);

  function setCell(r: number, c: number) {
    if (!onChange) return;
    const cur = cfg.cells[r][c];
    const next: '' | 'check' | 'x' = cur === '' ? 'check' : cur === 'check' ? 'x' : '';
    const cells = cfg.cells.map((row) => [...row]);
    cells[r][c] = next;
    onChange({ ...cfg, cells });
  }

  function setRowHeader(i: number, v: string) {
    if (!onChange) return;
    const rowHeaders = [...cfg.rowHeaders];
    rowHeaders[i] = v;
    onChange({ ...cfg, rowHeaders });
  }
  function setColHeader(i: number, v: string) {
    if (!onChange) return;
    const colHeaders = [...cfg.colHeaders];
    colHeaders[i] = v;
    onChange({ ...cfg, colHeaders });
  }
  function addRow() {
    if (!onChange) return;
    onChange({
      ...cfg,
      rowHeaders: [...cfg.rowHeaders, `Row ${cfg.rowHeaders.length + 1}`],
      cells: [...cfg.cells, cfg.colHeaders.map(() => '' as const)],
    });
  }
  function addCol() {
    if (!onChange) return;
    onChange({
      ...cfg,
      colHeaders: [...cfg.colHeaders, `Col ${cfg.colHeaders.length + 1}`],
      cells: cfg.cells.map((row) => [...row, '' as const]),
    });
  }
  function removeRow(i: number) {
    if (!onChange || cfg.rowHeaders.length <= 1) return;
    onChange({
      ...cfg,
      rowHeaders: cfg.rowHeaders.filter((_, idx) => idx !== i),
      cells: cfg.cells.filter((_, idx) => idx !== i),
    });
  }
  function removeCol(i: number) {
    if (!onChange || cfg.colHeaders.length <= 1) return;
    onChange({
      ...cfg,
      colHeaders: cfg.colHeaders.filter((_, idx) => idx !== i),
      cells: cfg.cells.map((row) => row.filter((_, idx) => idx !== i)),
    });
  }

  const editable = mode === 'edit' && !!onChange;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              {cfg.colHeaders.map((h, c) => (
                <th key={c} className="p-2 align-bottom">
                  {editable ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={h}
                        onChange={(e) => setColHeader(c, e.target.value)}
                        className="w-24 rounded-md border border-slate-300 px-1 py-0.5 text-xs font-semibold"
                      />
                      <button onClick={() => removeCol(c)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-700">{h}</div>
                  )}
                </th>
              ))}
              {editable && (
                <th className="p-2">
                  <button onClick={addCol} className="text-slate-400 hover:text-indigo-600"><Plus className="w-4 h-4" /></button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {cfg.rowHeaders.map((rh, r) => (
              <tr key={r}>
                <th className="p-2 text-left align-middle">
                  {editable ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={rh}
                        onChange={(e) => setRowHeader(r, e.target.value)}
                        className="w-28 rounded-md border border-slate-300 px-1 py-0.5 text-xs font-semibold"
                      />
                      <button onClick={() => removeRow(r)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-slate-700 pr-2">{rh}</div>
                  )}
                </th>
                {cfg.colHeaders.map((_, c) => {
                  const v = cfg.cells[r][c];
                  return (
                    <td key={c} className="p-1">
                      <button
                        onClick={() => setCell(r, c)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition ${
                          v === 'check' ? 'bg-emerald-100 border-emerald-400' : v === 'x' ? 'bg-rose-100 border-rose-400' : 'bg-white border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {v === 'check' && <Check className="w-5 h-5 text-emerald-600" />}
                        {v === 'x' && <X className="w-5 h-5 text-rose-600" />}
                      </button>
                    </td>
                  );
                })}
                {editable && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && (
        <button onClick={addRow} className="inline-flex items-center gap-1 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 px-3 py-1.5 text-sm text-slate-600">
          <Plus className="w-4 h-4" /> Add row
        </button>
      )}
    </div>
  );
}
