/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, Scale, Binary, Layers, Check, X } from 'lucide-react';
import { TruthTableResult } from '../logic/types';

interface StatsCardsProps {
  result: TruthTableResult;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ result }) => {
  const { variables, totalRows, trueCount, falseCount, classification, classificationExplanation } =
    result;

  const getClassificationConfig = () => {
    switch (classification) {
      case 'Tautology':
        return {
          icon: CheckCircle2,
          colorText: 'text-[#176B52] dark:text-[#2CA782]',
          bgBadge: 'bg-[#EAF1E8] dark:bg-[#1A312A] border-[#D8DFD5] dark:border-[#263C34] text-[#176B52] dark:text-[#2CA782]',
          label: 'Tautology',
          tagline: 'Universally Valid',
        };
      case 'Contradiction':
        return {
          icon: XCircle,
          colorText: 'text-[#991B1B] dark:text-[#F87171]',
          bgBadge: 'bg-[#FDF3F2] dark:bg-[#2A1718] border-[#F5C2C0] dark:border-[#5C2628] text-[#991B1B] dark:text-[#F87171]',
          label: 'Contradiction',
          tagline: 'Unsatisfiable',
        };
      case 'Contingency':
      default:
        return {
          icon: Scale,
          colorText: 'text-[#183B32] dark:text-[#E6EFEA]',
          bgBadge: 'bg-[#EAF1E8] dark:bg-[#1A312A] border-[#D8DFD5] dark:border-[#263C34] text-[#183B32] dark:text-[#E6EFEA]',
          label: 'Contingency',
          tagline: 'Falsifiable / Satisfiable',
        };
    }
  };

  const config = getClassificationConfig();
  const IconComponent = config.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
      {/* Classification Card - given generous width for title, badge, icon, and explanation */}
      <div className="lg:col-span-5 bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 md:p-6 shadow-xs flex flex-col justify-between hover:border-[#176B52]/40 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#5A6862] dark:text-[#8FA69D] uppercase tracking-wider">
              Logical Classification
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#183B32] dark:text-[#E6EFEA] mt-1 flex flex-wrap items-center gap-2">
              <span className={config.colorText}>{config.label}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded border font-medium ${config.bgBadge}`}>
                {config.tagline}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] shrink-0">
            <IconComponent className={`w-6 h-6 ${config.colorText}`} />
          </div>
        </div>

        <p className="text-[#2B3833] dark:text-[#D4E2DC] text-xs md:text-sm mt-3.5 leading-relaxed">
          {classificationExplanation}
        </p>
      </div>

      {/* Numerical Metrics Strip - 4 evenly sized cards */}
      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 items-stretch">
        {/* Variables */}
        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-3.5 sm:p-4 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#176B52]/40 transition-colors">
          <div className="flex items-center justify-between text-[#5A6862] dark:text-[#8FA69D]">
            <span className="text-xs font-semibold uppercase tracking-wider">Variables</span>
            <Layers className="w-4 h-4 text-[#5A6862] dark:text-[#8FA69D]" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#183B32] dark:text-[#E6EFEA] tabular-nums">
              {variables.length}
            </div>
            <div className="text-[11px] text-[#5A6862] dark:text-[#8FA69D] mt-0.5 truncate font-mono">
              {variables.length > 0 ? variables.join(', ') : 'None (Constant)'}
            </div>
          </div>
        </div>

        {/* Total Rows */}
        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-3.5 sm:p-4 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#176B52]/40 transition-colors">
          <div className="flex items-center justify-between text-[#5A6862] dark:text-[#8FA69D]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Rows</span>
            <Binary className="w-4 h-4 text-[#5A6862] dark:text-[#8FA69D]" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#183B32] dark:text-[#E6EFEA] tabular-nums">
              {totalRows}
            </div>
            <div className="text-[11px] text-[#5A6862] dark:text-[#8FA69D] mt-0.5 font-mono">
              2<sup>{variables.length}</sup> rows
            </div>
          </div>
        </div>

        {/* True Outcomes */}
        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-3.5 sm:p-4 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#176B52]/40 transition-colors">
          <div className="flex items-center justify-between text-[#176B52] dark:text-[#2CA782]">
            <span className="text-xs font-semibold uppercase tracking-wider">True (T)</span>
            <Check className="w-4 h-4 text-[#176B52] dark:text-[#2CA782]" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#176B52] dark:text-[#2CA782] tabular-nums">
              {trueCount}
            </div>
            <div className="text-[11px] text-[#5A6862] dark:text-[#8FA69D] mt-0.5 tabular-nums">
              {totalRows > 0 ? Math.round((trueCount / totalRows) * 100) : 0}% of rows
            </div>
          </div>
        </div>

        {/* False Outcomes */}
        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-3.5 sm:p-4 md:p-5 flex flex-col justify-between shadow-xs hover:border-[#991B1B]/40 transition-colors">
          <div className="flex items-center justify-between text-[#991B1B] dark:text-[#F87171]">
            <span className="text-xs font-semibold uppercase tracking-wider">False (F)</span>
            <X className="w-4 h-4 text-[#991B1B] dark:text-[#F87171]" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-[#991B1B] dark:text-[#F87171] tabular-nums">
              {falseCount}
            </div>
            <div className="text-[11px] text-[#5A6862] dark:text-[#8FA69D] mt-0.5 tabular-nums">
              {totalRows > 0 ? Math.round((falseCount / totalRows) * 100) : 0}% of rows
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
