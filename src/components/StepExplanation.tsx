/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calculator,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { TruthTableResult } from '../logic/types';
import { evaluateExpression, formatBool } from '../logic/evaluator';

interface StepExplanationProps {
  result: TruthTableResult;
  selectedRowIndex: number;
  onSelectRow: (index: number) => void;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({
  result,
  selectedRowIndex,
  onSelectRow,
}) => {
  const row = result.rows.find((r) => r.rowIndex === selectedRowIndex) || result.rows[0];
  if (!row) return null;

  // Evaluate the AST for this specific row to get full trace
  const trace = evaluateExpression(result.ast, row.assignments);

  const handlePrev = () => {
    if (selectedRowIndex > 1) {
      onSelectRow(selectedRowIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedRowIndex < result.totalRows) {
      onSelectRow(selectedRowIndex + 1);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 md:p-6 shadow-xs">
      {/* Title & Row Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#D8DFD5] dark:border-[#263C34]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] flex items-center gap-2">
              <span>How was this calculated?</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] border border-[#D8DFD5] dark:border-[#263C34] font-mono">
                Row #{row.rowIndex} of {result.totalRows}
              </span>
            </h3>
            <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-0.5">
              Step-by-step evaluation following formal operator precedence
            </p>
          </div>
        </div>

        {/* Previous / Next Row Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={selectedRowIndex <= 1}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] text-[#2B3833] dark:text-[#D4E2DC] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            title="Previous Row"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#5A6862] dark:text-[#8FA69D] tabular-nums px-2">
            {selectedRowIndex} / {result.totalRows}
          </span>
          <button
            onClick={handleNext}
            disabled={selectedRowIndex >= result.totalRows}
            className="p-1.5 rounded-lg bg-white dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] text-[#2B3833] dark:text-[#D4E2DC] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            title="Next Row"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row Assignment Valuation Header */}
      <div className="mt-4 p-3.5 bg-[#FAF9F5] dark:bg-[#101A17] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A6862] dark:text-[#8FA69D]">
            Variable Valuations:
          </span>
          {result.variables.map((v) => {
            const val = row.assignments[v];
            return (
              <div
                key={v}
                className="flex items-center gap-1.5 font-mono text-xs bg-white dark:bg-[#162722] border border-[#D8DFD5] dark:border-[#263C34] px-2.5 py-1 rounded shadow-xs"
              >
                <span className="text-[#183B32] dark:text-[#E6EFEA] font-bold">{v}</span>
                <span className="text-[#5A6862]">=</span>
                <span className={val ? 'text-[#176B52] dark:text-[#2CA782] font-bold' : 'text-[#991B1B] dark:text-[#F87171] font-bold'}>
                  {formatBool(val, 'TrueFalse')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Final Result for this row */}
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-xs font-sans text-[#5A6862] dark:text-[#8FA69D]">Final Result:</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded text-xs flex items-center gap-1 ${
              trace.finalResult
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#176B52]/30 text-[#176B52] dark:text-[#2CA782]'
                : 'bg-[#FDF3F2] dark:bg-[#2A1718] border border-[#F5C2C0] dark:border-[#5C2628] text-[#991B1B] dark:text-[#F87171]'
            }`}
          >
            {trace.finalResult ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {formatBool(trace.finalResult, 'TrueFalse')}
          </span>
        </div>
      </div>

      {/* Steps List */}
      <div className="mt-5 space-y-3">
        {trace.steps.length === 0 ? (
          <div className="p-4 text-xs text-[#5A6862] italic">
            This expression is an atomic proposition or constant with no suboperations to compute.
          </div>
        ) : (
          trace.steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isFinalStep = stepNum === trace.steps.length;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all ${
                  isFinalStep
                    ? 'bg-[#EAF1E8]/50 dark:bg-[#162722] border-[#176B52] dark:border-[#2CA782]'
                    : 'bg-[#FAF9F5] dark:bg-[#101A17] border-[#D8DFD5] dark:border-[#263C34] hover:border-[#176B52]/60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#183B32] dark:bg-[#2CA782] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {stepNum}
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#183B32] dark:text-[#E6EFEA]">
                      {step.subexpression}
                    </span>
                    {isFinalStep && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#176B52] text-white rounded font-medium">
                        Final Expression
                      </span>
                    )}
                  </div>

                  {/* Step Result */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5A6862] dark:text-[#8FA69D] font-sans">Yields</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5A6862]" />
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                        step.result
                          ? 'bg-[#EAF1E8] text-[#176B52] dark:bg-[#1A312A] dark:text-[#2CA782] border border-[#176B52]/20'
                          : 'bg-[#FDF3F2] text-[#991B1B] dark:bg-[#2A1718] dark:text-[#F87171] border border-[#F5C2C0]'
                      }`}
                    >
                      {formatBool(step.result, 'TrueFalse')}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="mt-2.5 text-xs md:text-sm text-[#2B3833] dark:text-[#D4E2DC] pl-8 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FBBF24] shrink-0 mt-0.5" />
                  <span>{step.explanation}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
