/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
} from 'lucide-react';
import { TruthTableResult } from '../logic/types';
import { formatBool } from '../logic/evaluator';

interface TruthTableViewProps {
  result: TruthTableResult;
  selectedRowIndex: number | null;
  onSelectRow: (index: number) => void;
}

export const TruthTableView: React.FC<TruthTableViewProps> = ({
  result,
  selectedRowIndex,
  onSelectRow,
}) => {
  const { variables, intermediateExpressions, rows, canonicalExpression } = result;

  const [filterMode, setFilterMode] = useState<'all' | 'true' | 'false'>('all');
  const [showIntermediates, setShowIntermediates] = useState<boolean>(true);
  const [formatStyle, setFormatStyle] = useState<'TF' | 'TrueFalse' | '10'>('TF');
  const [copied, setCopied] = useState<boolean>(false);
  const [variableFilters, setVariableFilters] = useState<Record<string, string>>({});

  // Filter rows according to filters
  const filteredRows = rows.filter((row) => {
    // 1. Result filter
    if (filterMode === 'true' && !row.result) return false;
    if (filterMode === 'false' && row.result) return false;

    // 2. Variable assignments filter
    for (const [varName, targetVal] of Object.entries(variableFilters)) {
      if (targetVal === 'T' && !row.assignments[varName]) return false;
      if (targetVal === 'F' && row.assignments[varName]) return false;
    }

    return true;
  });

  const handleCopyTSV = async () => {
    // Headers
    const headers = [
      '#',
      ...variables,
      ...(showIntermediates ? intermediateExpressions : []),
      canonicalExpression,
    ];
    const dataRows = filteredRows.map((r) => [
      r.rowIndex,
      ...variables.map((v) => formatBool(r.assignments[v], formatStyle)),
      ...(showIntermediates
        ? intermediateExpressions.map((e) => formatBool(r.intermediateValues[e], formatStyle))
        : []),
      formatBool(r.result, formatStyle),
    ]);

    const tsvContent = [headers.join('\t'), ...dataRows.map((row) => row.join('\t'))].join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Row',
      ...variables,
      ...(showIntermediates ? intermediateExpressions.map((e) => `"${e.replace(/"/g, '""')}"`) : []),
      `"${canonicalExpression.replace(/"/g, '""')}"`,
    ];

    const dataRows = filteredRows.map((r) => [
      r.rowIndex,
      ...variables.map((v) => formatBool(r.assignments[v], formatStyle)),
      ...(showIntermediates
        ? intermediateExpressions.map((e) => formatBool(r.intermediateValues[e], formatStyle))
        : []),
      formatBool(r.result, formatStyle),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `truth_table_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setFilterMode('all');
    setVariableFilters({});
  };

  const hasActiveFilters = filterMode !== 'all' || Object.values(variableFilters).some((v) => v);

  return (
    <div className="w-full bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl overflow-hidden shadow-xs">
      {/* Controls Header Toolbar */}
      <div className="p-4 border-b border-[#D8DFD5] dark:border-[#263C34] flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F5] dark:bg-[#111C18]">
        {/* Left: Filter Buttons & Intermediate Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Mode Segmented */}
          <div className="flex items-center p-1 bg-[#EAF1E8] dark:bg-[#1A312A] rounded-lg border border-[#D8DFD5] dark:border-[#263C34]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
              }`}
            >
              All ({rows.length})
            </button>
            <button
              onClick={() => setFilterMode('true')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                filterMode === 'true'
                  ? 'bg-[#176B52] text-white shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#176B52] dark:hover:text-[#2CA782]'
              }`}
            >
              True ({result.trueCount})
            </button>
            <button
              onClick={() => setFilterMode('false')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                filterMode === 'false'
                  ? 'bg-[#991B1B] text-white shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#991B1B]'
              }`}
            >
              False ({result.falseCount})
            </button>
          </div>

          {/* Toggle Intermediates */}
          {intermediateExpressions.length > 0 && (
            <button
              onClick={() => setShowIntermediates(!showIntermediates)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                showIntermediates
                  ? 'bg-[#EAF1E8] dark:bg-[#1A312A] border-[#176B52] dark:border-[#2CA782] text-[#176B52] dark:text-[#2CA782] font-semibold'
                  : 'bg-white dark:bg-[#14221E] border-[#D8DFD5] dark:border-[#263C34] text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
              }`}
            >
              {showIntermediates ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Subexpressions ({intermediateExpressions.length})
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Show Subexpressions
                </>
              )}
            </button>
          )}

          {/* Format style toggle */}
          <div className="flex items-center p-1 bg-[#EAF1E8] dark:bg-[#1A312A] rounded-lg border border-[#D8DFD5] dark:border-[#263C34]">
            <button
              onClick={() => setFormatStyle('TF')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                formatStyle === 'TF'
                  ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
              }`}
              title="Show as T / F"
            >
              T/F
            </button>
            <button
              onClick={() => setFormatStyle('TrueFalse')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                formatStyle === 'TrueFalse'
                  ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
              }`}
              title="Show as True / False"
            >
              True/False
            </button>
            <button
              onClick={() => setFormatStyle('10')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                formatStyle === '10'
                  ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                  : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
              }`}
              title="Show as 1 / 0 (Binary)"
            >
              1/0
            </button>
          </div>

          {/* Reset Filters button if active */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-[#92400E] dark:text-[#FCD34D] bg-[#FEF3C7] dark:bg-[#2E2413] border border-[#FDE68A] dark:border-[#523F1E] rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Right: Export Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyTSV}
            className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Copy as Tab-Separated Text (for Excel, Sheets, Notion)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#176B52] dark:text-[#2CA782]" /> : <Copy className="w-3.5 h-3.5 text-[#5A6862]" />}
            {copied ? 'Copied!' : 'Copy TSV'}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-[#5A6862]" />
            CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#5A6862]" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Row count summary & selection tip */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#F7F5EF] dark:bg-[#121E1A] border-b border-[#D8DFD5] dark:border-[#263C34] text-xs text-[#5A6862] dark:text-[#8FA69D] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Showing {filteredRows.length} of {rows.length} rows</span>
          {hasActiveFilters && (
            <span className="text-[#92400E] dark:text-[#FCD34D] font-medium">· Filtered</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#176B52] dark:text-[#2CA782] font-medium">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] sm:text-xs">Click any row to view step-by-step mathematical proof below</span>
        </div>
      </div>

      {/* Table Container - Dedicated horizontally scrollable wrapper */}
      <div className="w-full max-w-full overflow-x-auto max-h-[600px] overflow-y-auto overscroll-x-contain">
        <table className="w-full text-left border-collapse text-sm">
          {/* Table Header: Dark Green Header Row */}
          <thead className="bg-[#183B32] text-white sticky top-0 z-20 shadow-xs border-b border-[#183B32]">
            <tr>
              {/* Row Number */}
              <th className="py-3 px-3 font-mono text-xs font-semibold text-[#D4E2DC] w-14 min-w-[50px] text-center border-r border-[#274D42]">
                #
              </th>

              {/* Variable Columns - Sensible minimum width so headers and truth values never overlap */}
              {variables.map((v) => (
                <th
                  key={v}
                  className="py-3 px-2 sm:px-3 font-mono font-bold text-sm text-white border-r border-[#274D42] bg-[#183B32] w-24 sm:w-28 md:w-32 min-w-[76px] text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <span className="text-sm font-bold">{v}</span>
                    {/* Quick filter dropdown for variable */}
                    <select
                      aria-label={`Filter by ${v}`}
                      value={variableFilters[v] || ''}
                      onChange={(e) =>
                        setVariableFilters({ ...variableFilters, [v]: e.target.value })
                      }
                      className="text-[10px] font-sans font-normal bg-[#132E27] border border-[#2B5448] rounded px-1.5 py-0.5 text-[#E6EFEA] cursor-pointer focus:outline-none hover:border-[#3E7465] transition-colors"
                    >
                      <option value="">All</option>
                      <option value="T">T</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </th>
              ))}

              {/* Intermediate Subexpressions Columns */}
              {showIntermediates &&
                intermediateExpressions.map((subExpr) => (
                  <th
                    key={subExpr}
                    className="py-3 px-3 sm:px-4 font-mono font-medium text-xs text-[#E6EFEA] border-r border-[#274D42] bg-[#1E4339] min-w-[120px] sm:min-w-[150px] text-center whitespace-nowrap"
                  >
                    {subExpr}
                  </th>
                ))}

              {/* Final Expression Result Column */}
              <th className="py-3 px-4 sm:px-5 font-mono font-bold text-sm text-white bg-[#135E47] whitespace-nowrap md:sticky md:right-0 md:z-10 border-l border-[#274D42] min-w-[160px] sm:min-w-[220px] text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate max-w-[280px] sm:max-w-[360px]">{canonicalExpression}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white uppercase font-sans font-semibold tracking-wider shrink-0">
                    Result
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-mono">
            {filteredRows.map((row, index) => {
              const isSelected = selectedRowIndex === row.rowIndex;
              // Alternating subtle backgrounds
              const isEven = index % 2 === 0;
              const baseBg = isEven
                ? 'bg-white dark:bg-[#14221E]'
                : 'bg-[#FAF9F5] dark:bg-[#101A17]';

              return (
                <tr
                  key={row.rowIndex}
                  onClick={() => onSelectRow(row.rowIndex)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-[#EAF1E8] dark:bg-[#1C362E] border-l-4 border-[#176B52] dark:border-[#2CA782]'
                      : `${baseBg} hover:bg-[#F2EFE8] dark:hover:bg-[#182A25]`
                  }`}
                >
                  {/* Row Index */}
                  <td className="py-2.5 px-3 text-xs text-[#5A6862] dark:text-[#8FA69D] text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums w-14 min-w-[50px]">
                    {row.rowIndex}
                  </td>

                  {/* Variable Values - centered and aligned with column headers */}
                  {variables.map((v) => {
                    const val = row.assignments[v];
                    return (
                      <td
                        key={v}
                        className="py-2.5 px-2 sm:px-3 font-semibold text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums w-24 sm:w-28 md:w-32 min-w-[76px]"
                      >
                        <span
                          className={
                            val
                              ? 'text-[#176B52] dark:text-[#2CA782] font-bold'
                              : 'text-[#5A6862] dark:text-[#8FA69D] font-medium'
                          }
                        >
                          {formatBool(val, formatStyle)}
                        </span>
                      </td>
                    );
                  })}

                  {/* Intermediate Subexpression Values */}
                  {showIntermediates &&
                    intermediateExpressions.map((subExpr) => {
                      const val = row.intermediateValues[subExpr];
                      return (
                        <td
                          key={subExpr}
                          className="py-2.5 px-3 sm:px-4 text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums text-xs min-w-[120px] sm:min-w-[150px]"
                        >
                          <span
                            className={
                              val
                                ? 'text-[#176B52] dark:text-[#2CA782] font-medium'
                                : 'text-[#5A6862] dark:text-[#8FA69D] font-medium'
                            }
                          >
                            {formatBool(val, formatStyle)}
                          </span>
                        </td>
                      );
                    })}

                  {/* Final Result Column */}
                  <td
                    className={`py-2.5 px-4 sm:px-5 font-bold text-center tabular-nums md:sticky md:right-0 md:z-10 border-l border-[#D8DFD5] dark:border-[#263C34] min-w-[160px] sm:min-w-[220px] ${
                      row.result
                        ? 'bg-[#EAF1E8]/70 dark:bg-[#1E3830]/80 text-[#176B52] dark:text-[#2CA782]'
                        : 'bg-[#FDF3F2]/70 dark:bg-[#2E1819]/80 text-[#991B1B] dark:text-[#F87171]'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-sm md:text-base">
                        {formatBool(row.result, formatStyle)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={variables.length + (showIntermediates ? intermediateExpressions.length : 0) + 2}
                  className="py-12 text-center text-[#5A6862] dark:text-[#8FA69D] font-sans"
                >
                  <Filter className="w-8 h-8 text-[#5A6862] mx-auto mb-2" />
                  <p className="text-base font-semibold text-[#183B32] dark:text-[#E6EFEA]">No matching rows found</p>
                  <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-1">
                    Try adjusting or resetting your filter criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#176B52] hover:text-[#125541] bg-[#EAF1E8] border border-[#D8DFD5] rounded-lg inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
