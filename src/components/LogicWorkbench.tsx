/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Layers,
  Scale,
  Sparkles,
  Download,
  Copy,
  Printer,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { compareEquivalence } from '../logic/equivalence';
import { EquivalenceComparison, ExpressionClassification } from '../logic/types';
import { formatBool } from '../logic/evaluator';

interface LogicWorkbenchProps {
  initialExprA?: string;
  initialExprB?: string;
  onReturnToGenerator: () => void;
  onLoadSingleFormulaToGenerator: (formula: string) => void;
}

interface EquivalencePreset {
  name: string;
  category: string;
  exprA: string;
  exprB: string;
  expectedResult: 'Equivalent' | 'Not Equivalent';
  description: string;
}

const EQUIVALENCE_PRESETS: EquivalencePreset[] = [
  {
    name: "De Morgan's First Law",
    category: 'Classic Equivalences',
    exprA: '¬(P ∧ Q)',
    exprB: '¬P ∨ ¬Q',
    expectedResult: 'Equivalent',
    description: 'The negation of a conjunction is equivalent to the disjunction of the negations.',
  },
  {
    name: 'Material Implication Law',
    category: 'Classic Equivalences',
    exprA: 'P → Q',
    exprB: '¬P ∨ Q',
    expectedResult: 'Equivalent',
    description: 'An implication is equivalent to disjunction with negated antecedent.',
  },
  {
    name: 'Law of Contrapositive',
    category: 'Classic Equivalences',
    exprA: 'P → Q',
    exprB: '¬Q → ¬P',
    expectedResult: 'Equivalent',
    description: 'An implication is logically equivalent to its contrapositive.',
  },
  {
    name: 'XOR vs Biconditional Negation',
    category: 'Classic Equivalences',
    exprA: 'P ⊕ Q',
    exprB: '¬(P ↔ Q)',
    expectedResult: 'Equivalent',
    description: 'Exclusive OR is the exact negation of the biconditional.',
  },
  {
    name: 'Distributive Law (AND over OR)',
    category: 'Classic Equivalences',
    exprA: 'P ∧ (Q ∨ R)',
    exprB: '(P ∧ Q) ∨ (P ∧ R)',
    expectedResult: 'Equivalent',
    description: 'Conjunction distributes over disjunction.',
  },
  {
    name: 'Fallacy: Implication vs Converse',
    category: 'Non-Equivalences (Fallacies)',
    exprA: 'P → Q',
    exprB: 'Q → P',
    expectedResult: 'Not Equivalent',
    description: 'The converse of an implication is NOT logically equivalent (2 counterexamples).',
  },
  {
    name: 'Fallacy: Implication vs Inverse',
    category: 'Non-Equivalences (Fallacies)',
    exprA: 'P → Q',
    exprB: '¬P → ¬Q',
    expectedResult: 'Not Equivalent',
    description: 'The inverse (denying the antecedent) is NOT logically equivalent.',
  },
  {
    name: 'Distinct Variables: Tautologies',
    category: 'Different Variables',
    exprA: 'P ∨ ¬P',
    exprB: 'Q ∨ ¬Q',
    expectedResult: 'Equivalent',
    description: 'Both formulas are independent tautologies; both evaluate to True on {P, Q}.',
  },
  {
    name: 'Distinct Variables: Independent Propositions',
    category: 'Different Variables',
    exprA: 'P',
    exprB: 'Q',
    expectedResult: 'Not Equivalent',
    description: 'Independent propositions P and Q disagree when one is True and the other is False.',
  },
];

export const LogicWorkbench: React.FC<LogicWorkbenchProps> = ({
  initialExprA = 'P → Q',
  initialExprB = '¬P ∨ Q',
  onReturnToGenerator,
  onLoadSingleFormulaToGenerator,
}) => {
  const [exprA, setExprA] = useState<string>(initialExprA);
  const [exprB, setExprB] = useState<string>(initialExprB);
  const [activeInput, setActiveInput] = useState<'A' | 'B'>('A');
  const [comparison, setComparison] = useState<EquivalenceComparison | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'differing' | 'matching'>('all');
  const [formatStyle, setFormatStyle] = useState<'TF' | 'TrueFalse' | '10'>('TF');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'comparison' | 'side-by-side' | 'tableA' | 'tableB'>('comparison');

  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  // Evaluate initial equivalence on mount or when initial props change
  useEffect(() => {
    if (initialExprA) setExprA(initialExprA);
    if (initialExprB) setExprB(initialExprB);
    executeComparison(initialExprA, initialExprB);
  }, [initialExprA, initialExprB]);

  const executeComparison = (formulaA?: string, formulaB?: string) => {
    const a = formulaA !== undefined ? formulaA : exprA;
    const b = formulaB !== undefined ? formulaB : exprB;

    try {
      const res = compareEquivalence(a, b);
      setComparison(res);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error comparing expressions.');
      setComparison(null);
    }
  };

  const handleCompare = () => {
    executeComparison();
  };

  const handleClear = () => {
    setExprA('');
    setExprB('');
    setComparison(null);
    setErrorMessage(null);
  };

  const handleSwap = () => {
    const tempA = exprA;
    const tempB = exprB;
    setExprA(tempB);
    setExprB(tempA);
    executeComparison(tempB, tempA);
  };

  const handleSelectPreset = (preset: EquivalencePreset) => {
    setExprA(preset.exprA);
    setExprB(preset.exprB);
    executeComparison(preset.exprA, preset.exprB);
  };

  const insertSymbol = (sym: string) => {
    const isA = activeInput === 'A';
    const targetInput = isA ? inputARef.current : inputBRef.current;
    const currentVal = isA ? exprA : exprB;
    const setTarget = isA ? setExprA : setExprB;

    if (!targetInput) {
      setTarget(currentVal + sym);
      return;
    }

    const start = targetInput.selectionStart ?? currentVal.length;
    const end = targetInput.selectionEnd ?? currentVal.length;

    const isBinary = ['∧', '∨', '⊕', '→', '↔'].includes(sym);
    const toInsert = isBinary ? ` ${sym} ` : sym;

    const newVal = currentVal.substring(0, start) + toInsert + currentVal.substring(end);
    setTarget(newVal);

    setTimeout(() => {
      targetInput.focus();
      const newCursor = start + toInsert.length;
      targetInput.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeComparison();
    }
  };

  const handleCopyTSV = async () => {
    if (!comparison) return;
    const { allVariables, rows, expressionA, expressionB } = comparison;

    const headers = [
      '#',
      ...allVariables,
      `[A] ${expressionA}`,
      `[B] ${expressionB}`,
      'A ≡ B Match?',
    ];

    const dataRows = rows.map((r) => [
      r.rowIndex,
      ...allVariables.map((v) => formatBool(r.assignments[v], formatStyle)),
      formatBool(r.resultA, formatStyle),
      formatBool(r.resultB, formatStyle),
      r.isEquivalent ? 'MATCH' : 'DIFFERS',
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
    if (!comparison) return;
    const { allVariables, rows, expressionA, expressionB } = comparison;

    const headers = [
      'Row',
      ...allVariables,
      `"Expr A: ${expressionA.replace(/"/g, '""')}"`,
      `"Expr B: ${expressionB.replace(/"/g, '""')}"`,
      'Equivalent',
    ];

    const dataRows = rows.map((r) => [
      r.rowIndex,
      ...allVariables.map((v) => formatBool(r.assignments[v], formatStyle)),
      formatBool(r.resultA, formatStyle),
      formatBool(r.resultB, formatStyle),
      r.isEquivalent ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `equivalence_comparison_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const operatorButtons = [
    { label: 'NOT', symbol: '¬', desc: 'Negation (¬ or NOT)' },
    { label: 'AND', symbol: '∧', desc: 'Conjunction (∧ or AND)' },
    { label: 'OR', symbol: '∨', desc: 'Disjunction (∨ or OR)' },
    { label: 'XOR', symbol: '⊕', desc: 'Exclusive OR (⊕ or XOR)' },
    { label: 'IMPLIES', symbol: '→', desc: 'Conditional (→ or IMPLIES)' },
    { label: 'IFF', symbol: '↔', desc: 'Biconditional (↔ or IFF)' },
    { label: '(', symbol: '(', desc: 'Left parenthesis' },
    { label: ')', symbol: ')', desc: 'Right parenthesis' },
  ];

  const variableButtons = ['P', 'Q', 'R', 'S'];

  const filteredComparisonRows = comparison
    ? comparison.rows.filter((r) => {
        if (filterMode === 'differing') return !r.isEquivalent;
        if (filterMode === 'matching') return r.isEquivalent;
        return true;
      })
    : [];

  const getClassificationBadge = (classification: ExpressionClassification) => {
    switch (classification) {
      case 'Tautology':
        return 'bg-[#EAF1E8] text-[#176B52] border-[#D8DFD5]';
      case 'Contradiction':
        return 'bg-[#FDF3F2] text-[#991B1B] border-[#F5C2C0]';
      case 'Contingency':
      default:
        return 'bg-[#FAF9F5] text-[#183B32] border-[#D8DFD5]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Return to Generator */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 md:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onReturnToGenerator}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B52] dark:text-[#2CA782] hover:text-[#125541] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Truth Table Generator</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#183B32] dark:text-[#E6EFEA] flex items-center gap-2.5">
            <span>Logic Workbench</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] border border-[#D8DFD5] dark:border-[#263C34] font-medium font-sans">
              Dual-Formula Equivalence Lab
            </span>
          </h1>
          <p className="text-[#5A6862] dark:text-[#8FA69D] text-sm mt-1">
            Compare two propositional expressions, test logical equivalence ($A \equiv B$), and pinpoint counterexample assignments.
          </p>
        </div>

        {/* Load Preset Dropdown - 100% width on mobile, bounded inside card */}
        <div className="w-full sm:w-auto max-w-full sm:max-w-xs md:max-w-sm shrink-0">
          <div className="relative w-full max-w-full">
            <select
              aria-label="Load Equivalence Preset"
              defaultValue=""
              onChange={(e) => {
                const preset = EQUIVALENCE_PRESETS.find((p) => p.name === e.target.value);
                if (preset) handleSelectPreset(preset);
              }}
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              className="w-full max-w-full truncate appearance-none bg-[#EAF1E8] dark:bg-[#1A312A] hover:bg-[#DFE9DD] dark:hover:bg-[#203D34] text-[#183B32] dark:text-[#E6EFEA] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg px-3 py-2 pr-8 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#176B52]"
            >
              <option value="" disabled>
                Load Equivalence Theorem / Fallacy...
              </option>
              <optgroup label="Classical Equivalences">
                {EQUIVALENCE_PRESETS.filter((p) => p.category === 'Classic Equivalences').map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.exprA} ≡ {p.exprB})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Common Fallacies (Non-Equivalences)">
                {EQUIVALENCE_PRESETS.filter((p) => p.category === 'Non-Equivalences (Fallacies)').map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.exprA} ≢ {p.exprB})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Different Variable Names">
                {EQUIVALENCE_PRESETS.filter((p) => p.category === 'Different Variables').map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A6862] dark:text-[#8FA69D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dual Expression Editor Card */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expression A Input */}
          <div
            onClick={() => setActiveInput('A')}
            className={`p-4 rounded-lg border transition-all ${
              activeInput === 'A'
                ? 'border-[#176B52] dark:border-[#2CA782] bg-[#FAF9F5] dark:bg-[#0E1A16] ring-1 ring-[#176B52]/20'
                : 'border-[#D8DFD5] dark:border-[#263C34] bg-white dark:bg-[#14221E]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#183B32] dark:text-[#E6EFEA] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-[#176B52] text-white flex items-center justify-center font-mono text-xs">
                  A
                </span>
                <span>Expression A</span>
              </label>
              {activeInput === 'A' && (
                <span className="text-[11px] font-medium text-[#176B52] dark:text-[#2CA782]">
                  ● Active Input
                </span>
              )}
            </div>
            <input
              ref={inputARef}
              type="text"
              value={exprA}
              onFocus={() => setActiveInput('A')}
              onChange={(e) => setExprA(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. P → Q"
              className="w-full bg-white dark:bg-[#121F1B] border border-[#D8DFD5] dark:border-[#263C34] focus:border-[#176B52] rounded-lg px-3 py-2.5 font-mono text-base text-[#183B32] dark:text-[#E6EFEA] focus:outline-none focus:ring-1 focus:ring-[#176B52]"
            />
          </div>

          {/* Expression B Input */}
          <div
            onClick={() => setActiveInput('B')}
            className={`p-4 rounded-lg border transition-all ${
              activeInput === 'B'
                ? 'border-[#176B52] dark:border-[#2CA782] bg-[#FAF9F5] dark:bg-[#0E1A16] ring-1 ring-[#176B52]/20'
                : 'border-[#D8DFD5] dark:border-[#263C34] bg-white dark:bg-[#14221E]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#183B32] dark:text-[#E6EFEA] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-[#183B32] dark:bg-[#2CA782] text-white flex items-center justify-center font-mono text-xs">
                  B
                </span>
                <span>Expression B</span>
              </label>
              {activeInput === 'B' && (
                <span className="text-[11px] font-medium text-[#176B52] dark:text-[#2CA782]">
                  ● Active Input
                </span>
              )}
            </div>
            <input
              ref={inputBRef}
              type="text"
              value={exprB}
              onFocus={() => setActiveInput('B')}
              onChange={(e) => setExprB(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. ¬P ∨ Q"
              className="w-full bg-white dark:bg-[#121F1B] border border-[#D8DFD5] dark:border-[#263C34] focus:border-[#176B52] rounded-lg px-3 py-2.5 font-mono text-base text-[#183B32] dark:text-[#E6EFEA] focus:outline-none focus:ring-1 focus:ring-[#176B52]"
            />
          </div>
        </div>

        {/* Operator Buttons & Target Indicator */}
        <div className="space-y-2 pt-2 border-t border-[#D8DFD5] dark:border-[#263C34]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#5A6862] dark:text-[#8FA69D] mr-1">
                Insert into [{activeInput}]:
              </span>
              {operatorButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => insertSymbol(btn.symbol)}
                  title={btn.desc}
                  className="px-2.5 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] hover:border-[#176B52] rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#176B52] dark:text-[#2CA782] font-bold">{btn.symbol}</span>
                  <span className="text-[#5A6862] dark:text-[#8FA69D] text-[11px]">{btn.label}</span>
                </button>
              ))}

              <div className="h-4 w-px bg-[#D8DFD5] dark:bg-[#263C34] mx-1 hidden sm:block" />

              {variableButtons.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertSymbol(v)}
                  className="px-2.5 py-1.5 bg-[#EAF1E8] dark:bg-[#1A312A] hover:bg-[#DFE9DD] dark:hover:bg-[#223E34] text-[#176B52] dark:text-[#2CA782] border border-[#D8DFD5] dark:border-[#263C34] rounded-md text-xs font-mono font-bold transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Swap Expression A and Expression B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#176B52] dark:text-[#2CA782]" />
              Swap (A ↔ B)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8DFD5] dark:border-[#263C34]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCompare}
              className="px-5 py-2.5 bg-[#176B52] hover:bg-[#125541] dark:bg-[#2CA782] dark:hover:bg-[#248B6C] text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 focus:ring-2 focus:ring-[#176B52]/30 focus:outline-none"
            >
              <Play className="w-4 h-4 fill-white" />
              Compare & Check Equivalence
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-[#5A6862]" />
              Clear
            </button>
          </div>

          <div className="text-xs text-[#5A6862] dark:text-[#8FA69D] flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#5A6862]" />
            <span>Computes $A \leftrightarrow B$ across the unified variable universe.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-[#FDF3F2] dark:bg-[#2A1718] border border-[#F5C2C0] dark:border-[#5C2628] rounded-lg flex items-start gap-3 text-[#991B1B] dark:text-[#F87171] text-sm">
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Expression Error</div>
              <div className="mt-0.5 leading-relaxed">{errorMessage}</div>
            </div>
          </div>
        )}
      </div>

      {/* When Comparison is Computed */}
      {comparison && (
        <>
          {/* Main Equivalence Verdict Card */}
          <div
            className={`border rounded-xl p-5 md:p-6 shadow-xs transition-colors ${
              comparison.isLogicallyEquivalent
                ? 'bg-[#EAF1E8]/90 dark:bg-[#162B23] border-[#176B52]/40 dark:border-[#2CA782]/40'
                : 'bg-[#FFFBEB] dark:bg-[#261F12] border-[#FDE68A] dark:border-[#523F1E]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs ${
                    comparison.isLogicallyEquivalent
                      ? 'bg-[#176B52] dark:bg-[#2CA782] text-white'
                      : 'bg-[#B45309] dark:bg-[#F59E0B] text-white'
                  }`}
                >
                  {comparison.isLogicallyEquivalent ? '≡' : '≢'}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h2
                      className={`text-xl md:text-2xl font-bold ${
                        comparison.isLogicallyEquivalent
                          ? 'text-[#183B32] dark:text-[#E6EFEA]'
                          : 'text-[#92400E] dark:text-[#FDE68A]'
                      }`}
                    >
                      {comparison.isLogicallyEquivalent
                        ? 'Logically Equivalent (A ≡ B)'
                        : 'NOT Logically Equivalent (A ≢ B)'}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        comparison.isLogicallyEquivalent
                          ? 'bg-white dark:bg-[#14221E] text-[#176B52] dark:text-[#2CA782] border-[#176B52]/30'
                          : 'bg-white dark:bg-[#14221E] text-[#B45309] dark:text-[#FBBF24] border-[#FDE68A]'
                      }`}
                    >
                      {comparison.isLogicallyEquivalent
                        ? 'Valid Equivalence'
                        : `${comparison.differingRowsCount} Counterexample${comparison.differingRowsCount === 1 ? '' : 's'}`}
                    </span>
                  </div>

                  <p className="text-sm mt-1.5 text-[#2B3833] dark:text-[#D4E2DC] leading-relaxed max-w-3xl">
                    {comparison.explanation}
                  </p>

                  {comparison.hasDifferentVariableSets && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-[#5A6862] dark:text-[#8FA69D] bg-white/70 dark:bg-[#101E19] px-2.5 py-1 rounded border border-[#D8DFD5] dark:border-[#263C34]">
                      <Layers className="w-3.5 h-3.5 text-[#176B52] dark:text-[#2CA782]" />
                      <span>
                        Distinct variable sets: Expression A has &#123;{comparison.variablesA.join(', ')}&#125;, Expression B has &#123;{comparison.variablesB.join(', ')}&#125;. Evaluated over unified domain &#123;{comparison.allVariables.join(', ')}&#125;.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stat Pill Group */}
              <div className="flex flex-row md:flex-col items-end gap-2 text-right">
                <div className="text-xs text-[#5A6862] dark:text-[#8FA69D]">
                  <span className="font-semibold text-[#183B32] dark:text-[#E6EFEA] tabular-nums">
                    {comparison.matchingRowsCount}
                  </span>{' '}
                  / {comparison.totalRows} rows match ({Math.round((comparison.matchingRowsCount / comparison.totalRows) * 100)}%)
                </div>
                {comparison.differingRowsCount > 0 && (
                  <div className="text-xs text-[#991B1B] dark:text-[#F87171] font-semibold">
                    Row{comparison.differingRowIndices.length === 1 ? '' : 's'} #{comparison.differingRowIndices.join(', #')} differ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Classification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expression A Card */}
            <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A6862] dark:text-[#8FA69D] flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-[#176B52] text-white flex items-center justify-center font-mono text-[10px]">
                      A
                    </span>
                    Expression A Formula
                  </span>
                  <button
                    onClick={() => onLoadSingleFormulaToGenerator(comparison.expressionA)}
                    className="text-xs text-[#176B52] dark:text-[#2CA782] hover:underline font-semibold"
                  >
                    Open in Generator →
                  </button>
                </div>
                <div className="font-mono text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] truncate">
                  {comparison.expressionA}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[#5A6862] dark:text-[#8FA69D]">Classification:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${getClassificationBadge(
                      comparison.classificationA
                    )}`}
                  >
                    {comparison.classificationA}
                  </span>
                </div>

                <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-2 leading-relaxed">
                  {comparison.tableA.classificationExplanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-between text-xs text-[#5A6862] dark:text-[#8FA69D] font-mono">
                <span>Variables: {comparison.variablesA.join(', ') || 'None'}</span>
                <span>
                  {comparison.tableA.trueCount}T / {comparison.tableA.falseCount}F
                </span>
              </div>
            </div>

            {/* Expression B Card */}
            <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A6862] dark:text-[#8FA69D] flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-[#183B32] dark:bg-[#2CA782] text-white flex items-center justify-center font-mono text-[10px]">
                      B
                    </span>
                    Expression B Formula
                  </span>
                  <button
                    onClick={() => onLoadSingleFormulaToGenerator(comparison.expressionB)}
                    className="text-xs text-[#176B52] dark:text-[#2CA782] hover:underline font-semibold"
                  >
                    Open in Generator →
                  </button>
                </div>
                <div className="font-mono text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] truncate">
                  {comparison.expressionB}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[#5A6862] dark:text-[#8FA69D]">Classification:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${getClassificationBadge(
                      comparison.classificationB
                    )}`}
                  >
                    {comparison.classificationB}
                  </span>
                </div>

                <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-2 leading-relaxed">
                  {comparison.tableB.classificationExplanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-between text-xs text-[#5A6862] dark:text-[#8FA69D] font-mono">
                <span>Variables: {comparison.variablesB.join(', ') || 'None'}</span>
                <span>
                  {comparison.tableB.trueCount}T / {comparison.tableB.falseCount}F
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Table View */}
          <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl overflow-hidden shadow-xs">
            {/* View Switcher & Table Toolbar */}
            <div className="p-4 border-b border-[#D8DFD5] dark:border-[#263C34] flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F5] dark:bg-[#111C18]">
              {/* Left: View Tabs */}
              <div className="flex flex-wrap items-center gap-2 max-w-full">
                <div className="flex flex-wrap items-center p-1 bg-[#EAF1E8] dark:bg-[#1A312A] rounded-lg border border-[#D8DFD5] dark:border-[#263C34] max-w-full">
                  <button
                    onClick={() => setActiveViewTab('comparison')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeViewTab === 'comparison'
                        ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                        : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
                    }`}
                  >
                    Unified Equivalence Table
                  </button>
                  <button
                    onClick={() => setActiveViewTab('side-by-side')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeViewTab === 'side-by-side'
                        ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                        : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
                    }`}
                  >
                    Side-by-Side Tables
                  </button>
                  <button
                    onClick={() => setActiveViewTab('tableA')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeViewTab === 'tableA'
                        ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                        : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
                    }`}
                  >
                    Table A ({comparison.variablesA.join(', ')})
                  </button>
                  <button
                    onClick={() => setActiveViewTab('tableB')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                      activeViewTab === 'tableB'
                        ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                        : 'text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32]'
                    }`}
                  >
                    Table B ({comparison.variablesB.join(', ')})
                  </button>
                </div>

                {/* Filter mode for comparison table */}
                {activeViewTab === 'comparison' && (
                  <div className="flex items-center p-1 bg-[#EAF1E8] dark:bg-[#1A312A] rounded-lg border border-[#D8DFD5] dark:border-[#263C34]">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        filterMode === 'all'
                          ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs'
                          : 'text-[#5A6862] dark:text-[#8FA69D]'
                      }`}
                    >
                      All ({comparison.totalRows})
                    </button>
                    <button
                      onClick={() => setFilterMode('differing')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                        filterMode === 'differing'
                          ? 'bg-[#991B1B] text-white shadow-xs'
                          : 'text-[#991B1B] dark:text-[#F87171]'
                      }`}
                    >
                      Differing ({comparison.differingRowsCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('matching')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                        filterMode === 'matching'
                          ? 'bg-[#176B52] text-white shadow-xs'
                          : 'text-[#176B52] dark:text-[#2CA782]'
                      }`}
                    >
                      Matching ({comparison.matchingRowsCount})
                    </button>
                  </div>
                )}

                {/* Format toggle */}
                <div className="flex items-center p-1 bg-[#EAF1E8] dark:bg-[#1A312A] rounded-lg border border-[#D8DFD5] dark:border-[#263C34]">
                  <button
                    onClick={() => setFormatStyle('TF')}
                    className={`px-2 py-1 text-xs font-mono font-medium rounded-md ${
                      formatStyle === 'TF' ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs' : 'text-[#5A6862]'
                    }`}
                  >
                    T/F
                  </button>
                  <button
                    onClick={() => setFormatStyle('TrueFalse')}
                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                      formatStyle === 'TrueFalse' ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs' : 'text-[#5A6862]'
                    }`}
                  >
                    True/False
                  </button>
                  <button
                    onClick={() => setFormatStyle('10')}
                    className={`px-2 py-1 text-xs font-mono font-medium rounded-md ${
                      formatStyle === '10' ? 'bg-white dark:bg-[#14221E] text-[#183B32] dark:text-[#E6EFEA] shadow-xs' : 'text-[#5A6862]'
                    }`}
                  >
                    1/0
                  </button>
                </div>
              </div>

              {/* Right: Export Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyTSV}
                  className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#176B52]" /> : <Copy className="w-3.5 h-3.5 text-[#5A6862]" />}
                  {copied ? 'Copied!' : 'Copy TSV'}
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#5A6862]" />
                  CSV
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#5A6862]" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* TAB 1: Unified Comparison Table */}
            {activeViewTab === 'comparison' && (
              <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#183B32] text-white sticky top-0 z-20 border-b border-[#183B32]">
                    <tr>
                      <th className="py-3 px-3.5 font-mono text-xs font-semibold text-[#D4E2DC] w-12 text-center border-r border-[#274D42]">
                        #
                      </th>
                      {comparison.allVariables.map((v) => (
                        <th
                          key={v}
                          className="py-3 px-4 font-mono font-bold text-sm text-white border-r border-[#274D42]"
                        >
                          {v}
                        </th>
                      ))}
                      <th className="py-3 px-4 font-mono font-bold text-sm text-white bg-[#1A453A] border-r border-[#274D42]">
                        [A] {comparison.expressionA}
                      </th>
                      <th className="py-3 px-4 font-mono font-bold text-sm text-white bg-[#1A453A] border-r border-[#274D42]">
                        [B] {comparison.expressionB}
                      </th>
                      <th className="py-3 px-5 font-mono font-bold text-sm text-white bg-[#135E47] text-center sticky right-0 z-10 border-l border-[#274D42]">
                        Match (A ≡ B)?
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-mono">
                    {filteredComparisonRows.map((row) => {
                      const isDiffering = !row.isEquivalent;
                      return (
                        <tr
                          key={row.rowIndex}
                          className={`transition-colors ${
                            isDiffering
                              ? 'bg-[#FEF2F2] dark:bg-[#2A1617] border-l-4 border-[#DC2626]'
                              : 'bg-white dark:bg-[#14221E] hover:bg-[#FAF9F5] dark:hover:bg-[#182A25]'
                          }`}
                        >
                          <td className="py-2.5 px-3.5 text-xs text-[#5A6862] dark:text-[#8FA69D] text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums">
                            {row.rowIndex}
                          </td>

                          {comparison.allVariables.map((v) => {
                            const val = row.assignments[v];
                            return (
                              <td
                                key={v}
                                className="py-2.5 px-4 font-semibold text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums"
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

                          {/* Result A */}
                          <td className="py-2.5 px-4 font-bold text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums">
                            <span
                              className={
                                row.resultA
                                  ? 'text-[#176B52] dark:text-[#2CA782]'
                                  : 'text-[#991B1B] dark:text-[#F87171]'
                              }
                            >
                              {formatBool(row.resultA, formatStyle)}
                            </span>
                          </td>

                          {/* Result B */}
                          <td className="py-2.5 px-4 font-bold text-center border-r border-[#D8DFD5]/60 dark:border-[#263C34]/60 tabular-nums">
                            <span
                              className={
                                row.resultB
                                  ? 'text-[#176B52] dark:text-[#2CA782]'
                                  : 'text-[#991B1B] dark:text-[#F87171]'
                              }
                            >
                              {formatBool(row.resultB, formatStyle)}
                            </span>
                          </td>

                          {/* Match Result */}
                          <td
                            className={`py-2.5 px-5 font-bold text-center tabular-nums sticky right-0 z-10 border-l border-[#D8DFD5] dark:border-[#263C34] ${
                              row.isEquivalent
                                ? 'bg-[#EAF1E8]/70 dark:bg-[#1E3830]/80 text-[#176B52] dark:text-[#2CA782]'
                                : 'bg-[#FDF3F2]/90 dark:bg-[#34181A] text-[#991B1B] dark:text-[#F87171]'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              {row.isEquivalent ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#176B52] dark:text-[#2CA782]" />
                                  <span className="text-xs">Identical (T)</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#F87171]" />
                                  <span className="text-xs font-bold text-[#DC2626] dark:text-[#F87171]">
                                    Differs (F)
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredComparisonRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={comparison.allVariables.length + 4}
                          className="py-12 text-center text-[#5A6862] dark:text-[#8FA69D] font-sans"
                        >
                          <Filter className="w-8 h-8 text-[#5A6862] mx-auto mb-2" />
                          <p className="text-base font-semibold text-[#183B32] dark:text-[#E6EFEA]">
                            No rows match the filter
                          </p>
                          <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-1">
                            {filterMode === 'differing'
                              ? 'There are zero differing rows because the two formulas are logically equivalent!'
                              : 'Try changing your filter settings.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Side-by-Side Tables */}
            {activeViewTab === 'side-by-side' && (
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#FAF9F5] dark:bg-[#111C18]">
                {/* Table A Mini-container */}
                <div className="border border-[#D8DFD5] dark:border-[#263C34] rounded-lg overflow-hidden bg-white dark:bg-[#14221E]">
                  <div className="p-2.5 bg-[#183B32] text-white font-mono text-xs font-bold flex items-center justify-between">
                    <span>[Expression A] {comparison.expressionA}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 font-sans">
                      {comparison.tableA.totalRows} rows
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="bg-[#EAF1E8] dark:bg-[#1A312A] border-b border-[#D8DFD5] dark:border-[#263C34]">
                        <tr>
                          <th className="p-2 text-center w-10">#</th>
                          {comparison.variablesA.map((v) => (
                            <th key={v} className="p-2 text-center">{v}</th>
                          ))}
                          <th className="p-2 text-center bg-[#176B52] text-white font-bold">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34]">
                        {comparison.tableA.rows.map((r) => (
                          <tr key={r.rowIndex}>
                            <td className="p-2 text-center text-[#5A6862]">{r.rowIndex}</td>
                            {comparison.variablesA.map((v) => (
                              <td key={v} className="p-2 text-center font-bold">
                                {formatBool(r.assignments[v], formatStyle)}
                              </td>
                            ))}
                            <td className={`p-2 text-center font-bold ${r.result ? 'text-[#176B52] bg-[#EAF1E8]/50' : 'text-[#991B1B] bg-[#FDF3F2]/50'}`}>
                              {formatBool(r.result, formatStyle)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table B Mini-container */}
                <div className="border border-[#D8DFD5] dark:border-[#263C34] rounded-lg overflow-hidden bg-white dark:bg-[#14221E]">
                  <div className="p-2.5 bg-[#183B32] text-white font-mono text-xs font-bold flex items-center justify-between">
                    <span>[Expression B] {comparison.expressionB}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 font-sans">
                      {comparison.tableB.totalRows} rows
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="bg-[#EAF1E8] dark:bg-[#1A312A] border-b border-[#D8DFD5] dark:border-[#263C34]">
                        <tr>
                          <th className="p-2 text-center w-10">#</th>
                          {comparison.variablesB.map((v) => (
                            <th key={v} className="p-2 text-center">{v}</th>
                          ))}
                          <th className="p-2 text-center bg-[#176B52] text-white font-bold">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34]">
                        {comparison.tableB.rows.map((r) => (
                          <tr key={r.rowIndex}>
                            <td className="p-2 text-center text-[#5A6862]">{r.rowIndex}</td>
                            {comparison.variablesB.map((v) => (
                              <td key={v} className="p-2 text-center font-bold">
                                {formatBool(r.assignments[v], formatStyle)}
                              </td>
                            ))}
                            <td className={`p-2 text-center font-bold ${r.result ? 'text-[#176B52] bg-[#EAF1E8]/50' : 'text-[#991B1B] bg-[#FDF3F2]/50'}`}>
                              {formatBool(r.result, formatStyle)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Table A Details with Intermediates */}
            {activeViewTab === 'tableA' && (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#183B32] text-white sticky top-0 z-20 border-b border-[#183B32]">
                    <tr>
                      <th className="py-3 px-3.5 font-mono text-xs font-semibold text-[#D4E2DC] w-12 text-center border-r border-[#274D42]">#</th>
                      {comparison.variablesA.map((v) => (
                        <th key={v} className="py-3 px-4 font-mono font-bold text-sm text-white border-r border-[#274D42]">{v}</th>
                      ))}
                      {comparison.tableA.intermediateExpressions.map((sub) => (
                        <th key={sub} className="py-3 px-4 font-mono text-xs text-[#E6EFEA] border-r border-[#274D42] bg-[#1E4339]">{sub}</th>
                      ))}
                      <th className="py-3 px-5 font-mono font-bold text-sm text-white bg-[#135E47] sticky right-0 z-10 border-l border-[#274D42]">
                        {comparison.expressionA} (Result)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-mono">
                    {comparison.tableA.rows.map((r) => (
                      <tr key={r.rowIndex} className="hover:bg-[#FAF9F5] dark:hover:bg-[#182A25]">
                        <td className="py-2 px-3 text-center text-[#5A6862] text-xs border-r border-[#D8DFD5]/60">{r.rowIndex}</td>
                        {comparison.variablesA.map((v) => (
                          <td key={v} className="py-2 px-4 text-center font-bold border-r border-[#D8DFD5]/60">
                            {formatBool(r.assignments[v], formatStyle)}
                          </td>
                        ))}
                        {comparison.tableA.intermediateExpressions.map((sub) => (
                          <td key={sub} className="py-2 px-4 text-center text-xs border-r border-[#D8DFD5]/60">
                            {formatBool(r.intermediateValues[sub], formatStyle)}
                          </td>
                        ))}
                        <td className={`py-2 px-5 text-center font-bold sticky right-0 z-10 border-l border-[#D8DFD5] ${r.result ? 'text-[#176B52] bg-[#EAF1E8]/70' : 'text-[#991B1B] bg-[#FDF3F2]/70'}`}>
                          {formatBool(r.result, formatStyle)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: Table B Details with Intermediates */}
            {activeViewTab === 'tableB' && (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#183B32] text-white sticky top-0 z-20 border-b border-[#183B32]">
                    <tr>
                      <th className="py-3 px-3.5 font-mono text-xs font-semibold text-[#D4E2DC] w-12 text-center border-r border-[#274D42]">#</th>
                      {comparison.variablesB.map((v) => (
                        <th key={v} className="py-3 px-4 font-mono font-bold text-sm text-white border-r border-[#274D42]">{v}</th>
                      ))}
                      {comparison.tableB.intermediateExpressions.map((sub) => (
                        <th key={sub} className="py-3 px-4 font-mono text-xs text-[#E6EFEA] border-r border-[#274D42] bg-[#1E4339]">{sub}</th>
                      ))}
                      <th className="py-3 px-5 font-mono font-bold text-sm text-white bg-[#135E47] sticky right-0 z-10 border-l border-[#274D42]">
                        {comparison.expressionB} (Result)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-mono">
                    {comparison.tableB.rows.map((r) => (
                      <tr key={r.rowIndex} className="hover:bg-[#FAF9F5] dark:hover:bg-[#182A25]">
                        <td className="py-2 px-3 text-center text-[#5A6862] text-xs border-r border-[#D8DFD5]/60">{r.rowIndex}</td>
                        {comparison.variablesB.map((v) => (
                          <td key={v} className="py-2 px-4 text-center font-bold border-r border-[#D8DFD5]/60">
                            {formatBool(r.assignments[v], formatStyle)}
                          </td>
                        ))}
                        {comparison.tableB.intermediateExpressions.map((sub) => (
                          <td key={sub} className="py-2 px-4 text-center text-xs border-r border-[#D8DFD5]/60">
                            {formatBool(r.intermediateValues[sub], formatStyle)}
                          </td>
                        ))}
                        <td className={`py-2 px-5 text-center font-bold sticky right-0 z-10 border-l border-[#D8DFD5] ${r.result ? 'text-[#176B52] bg-[#EAF1E8]/70' : 'text-[#991B1B] bg-[#FDF3F2]/70'}`}>
                          {formatBool(r.result, formatStyle)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
