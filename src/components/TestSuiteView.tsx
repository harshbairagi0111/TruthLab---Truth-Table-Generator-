/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { runAllUnitTests, TestResult } from '../logic/tests';

interface TestSuiteViewProps {
  onLoadFormula: (formula: string) => void;
}

export const TestSuiteView: React.FC<TestSuiteViewProps> = ({ onLoadFormula }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllUnitTests();
      setResults(res);
      setIsRunning(false);
    }, 50);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const categories = ['All', ...Array.from(new Set(results.map((r) => r.category)))];

  const filtered = selectedCategory === 'All'
    ? results
    : results.filter((r) => r.category === selectedCategory);

  const totalPassed = results.filter((r) => r.passed).length;

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#183B32] dark:text-[#E6EFEA] flex items-center gap-2">
              <span>Propositional Logic Test Suite</span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] text-[#176B52] dark:text-[#2CA782] font-mono font-semibold">
                {totalPassed}/{results.length} Passing
              </span>
            </h2>
            <p className="text-[#5A6862] dark:text-[#8FA69D] text-xs sm:text-sm mt-1">
              Automated mathematical verification of truth tables, right-associative implication, precedence, parentheses, and error handling.
            </p>
          </div>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="px-4 py-2 bg-[#176B52] hover:bg-[#125541] dark:bg-[#2CA782] dark:hover:bg-[#248B6C] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Re-run Test Suite'}
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === cat
                ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Results Table */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#183B32] text-white border-b border-[#183B32] font-mono text-xs">
              <tr>
                <th className="py-3 px-4 w-12 text-center text-[#D4E2DC]">Status</th>
                <th className="py-3 px-4">Test Case & Expression</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Verification Output</th>
                <th className="py-3 px-4 text-right w-20">Time</th>
                <th className="py-3 px-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-sans">
              {filtered.map((test, idx) => (
                <tr
                  key={test.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-white dark:bg-[#14221E]' : 'bg-[#FAF9F5] dark:bg-[#101A17]'
                  } hover:bg-[#F2EFE8] dark:hover:bg-[#182A25]`}
                >
                  {/* Status Icon */}
                  <td className="py-3 px-4 text-center">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#991B1B] dark:text-[#F87171] mx-auto" />
                    )}
                  </td>

                  {/* Name and Expression */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#183B32] dark:text-[#E6EFEA]">{test.name}</div>
                    <div className="font-mono text-xs text-[#176B52] dark:text-[#2CA782] font-semibold mt-0.5">{test.expression}</div>
                    <div className="text-[11px] text-[#5A6862] dark:text-[#8FA69D] mt-0.5">{test.description}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-xs text-[#5A6862] dark:text-[#8FA69D]">
                    {test.category}
                  </td>

                  {/* Message */}
                  <td className="py-3 px-4 text-xs font-mono text-[#2B3833] dark:text-[#D4E2DC]">
                    {test.message}
                  </td>

                  {/* Execution time */}
                  <td className="py-3 px-4 text-right font-mono text-xs text-[#5A6862] dark:text-[#8FA69D] tabular-nums">
                    {test.durationMs}ms
                  </td>

                  {/* Action: Open in Workbench */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onLoadFormula(test.expression)}
                      className="p-1.5 hover:bg-[#EAF1E8] dark:hover:bg-[#1A312A] rounded text-[#5A6862] hover:text-[#176B52] dark:hover:text-[#2CA782] transition-colors"
                      title="Load this test expression into the Generator"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
