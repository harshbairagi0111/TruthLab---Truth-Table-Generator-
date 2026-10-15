/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Play, RotateCcw, ChevronDown, AlertCircle, HelpCircle } from 'lucide-react';
import { LOGIC_EXAMPLES } from '../logic/examples';

interface ExpressionEditorProps {
  expression: string;
  setExpression: (val: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  errorMessage: string | null;
  selectedExample: string;
  onSelectExample: (formula: string) => void;
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  expression,
  setExpression,
  onGenerate,
  onClear,
  errorMessage,
  selectedExample,
  onSelectExample,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertSymbol = (sym: string) => {
    const input = inputRef.current;
    if (!input) {
      setExpression(expression + sym);
      return;
    }

    const start = input.selectionStart ?? expression.length;
    const end = input.selectionEnd ?? expression.length;

    // Add space padding around binary operators for readability
    const isBinary = ['∧', '∨', '⊕', '→', '↔'].includes(sym);
    const toInsert = isBinary ? ` ${sym} ` : sym;

    const newValue = expression.substring(0, start) + toInsert + expression.substring(end);
    setExpression(newValue);

    setTimeout(() => {
      input.focus();
      const newCursor = start + toInsert.length;
      input.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  const operatorButtons = [
    { label: 'NOT', symbol: '¬', keyHint: '!', desc: 'Negation (¬ or NOT)' },
    { label: 'AND', symbol: '∧', keyHint: '&&', desc: 'Conjunction (∧ or AND)' },
    { label: 'OR', symbol: '∨', keyHint: '||', desc: 'Disjunction (∨ or OR)' },
    { label: 'XOR', symbol: '⊕', keyHint: '⊕', desc: 'Exclusive OR (⊕ or XOR)' },
    { label: 'IMPLIES', symbol: '→', keyHint: '->', desc: 'Conditional (→ or IMPLIES)' },
    { label: 'IFF', symbol: '↔', keyHint: '<->', desc: 'Biconditional (↔ or IFF)' },
    { label: '(', symbol: '(', keyHint: '(', desc: 'Left parenthesis' },
    { label: ')', symbol: ')', keyHint: ')', desc: 'Right parenthesis' },
  ];

  const variableButtons = ['P', 'Q', 'R', 'S'];

  return (
    <div className="w-full bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 md:p-6 shadow-xs">
      {/* Title, Subtitle & Example Loader Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#183B32] dark:text-[#E6EFEA]">
            Truth Table Generator
          </h1>
          <p className="text-[#5A6862] dark:text-[#8FA69D] text-sm md:text-base mt-1">
            Explore propositional logic, one truth value at a time.
          </p>
        </div>

        {/* Load Example Dropdown - 100% width on mobile, bounded inside card */}
        <div className="w-full sm:w-auto max-w-full sm:max-w-xs md:max-w-sm shrink-0">
          <div className="relative w-full max-w-full">
            <select
              aria-label="Load Example Formula"
              value={selectedExample}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectExample(e.target.value);
                }
              }}
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              className="w-full max-w-full truncate appearance-none bg-[#EAF1E8] dark:bg-[#1A312A] hover:bg-[#DFE9DD] dark:hover:bg-[#203D34] text-[#183B32] dark:text-[#E6EFEA] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg px-3 py-2 sm:py-1.5 pr-8 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#176B52]"
            >
              <option value="" disabled>
                Load Example Formula...
              </option>
              <optgroup label="Standard Connectives">
                {LOGIC_EXAMPLES.filter((ex) => ex.category === 'Required').map((ex) => (
                  <option key={ex.formula} value={ex.formula}>
                    {ex.formula} — {ex.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Classical Theorems & Laws">
                {LOGIC_EXAMPLES.filter((ex) => ex.category === 'Theorems & Laws').map((ex) => (
                  <option key={ex.formula} value={ex.formula}>
                    {ex.formula} — {ex.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A6862] dark:text-[#8FA69D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Logical Expression Input */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. (P ∧ Q) → R  or  P IMPLIES Q"
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-[#FAF9F5] dark:bg-[#0E1A16] border border-[#D8DFD5] dark:border-[#263C34] focus:border-[#176B52] dark:focus:border-[#2CA782] rounded-lg px-3.5 sm:px-4 py-3 sm:py-3.5 text-base sm:text-lg md:text-xl font-mono text-[#183B32] dark:text-[#E6EFEA] placeholder:text-[#8FA69D] focus:outline-none focus:ring-2 focus:ring-[#176B52]/20 transition-all box-border"
        />
      </div>

      {/* Operator Buttons Bar & Shorthands */}
      <div className="mb-5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs font-medium text-[#5A6862] dark:text-[#8FA69D] mr-1 hidden sm:inline">
              Operators:
            </span>

            {operatorButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => insertSymbol(btn.symbol)}
                title={btn.desc}
                className="px-2 sm:px-2.5 py-1.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] hover:border-[#176B52] dark:hover:border-[#2CA782] rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1 sm:gap-1.5"
              >
                <span className="text-[#176B52] dark:text-[#2CA782] font-bold">{btn.symbol}</span>
                <span className="text-[#5A6862] dark:text-[#8FA69D] text-[11px]">{btn.label}</span>
              </button>
            ))}

            <div className="h-4 w-px bg-[#D8DFD5] dark:bg-[#263C34] mx-1 hidden sm:block" />

            <span className="text-xs font-medium text-[#5A6862] dark:text-[#8FA69D] mr-1 hidden sm:inline">
              Variables:
            </span>

            {variableButtons.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertSymbol(v)}
                className="px-2.5 py-1.5 bg-[#EAF1E8] dark:bg-[#1A312A] hover:bg-[#DFE9DD] dark:hover:bg-[#223E34] text-[#176B52] dark:text-[#2CA782] border border-[#D8DFD5] dark:border-[#263C34] rounded-md text-xs font-mono font-semibold transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Inline keyboard shorthand for large displays */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#5A6862] dark:text-[#8FA69D]">
            <HelpCircle className="w-3.5 h-3.5 text-[#5A6862] dark:text-[#8FA69D] shrink-0" />
            <span>
              Shorthands: <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">!</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">NOT</code>,{' '}
              <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">&amp;&amp;</code>,{' '}
              <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">||</code>,{' '}
              <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">-&gt;</code>,{' '}
              <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded">&lt;-&gt;</code>
            </span>
          </div>
        </div>

        {/* Keyboard shorthand hint for smaller displays */}
        <div className="flex xl:hidden items-start gap-1.5 text-xs text-[#5A6862] dark:text-[#8FA69D] leading-relaxed">
          <HelpCircle className="w-3.5 h-3.5 text-[#5A6862] dark:text-[#8FA69D] shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0">
            Keyboard shorthands accepted:{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">!</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">NOT</code>,{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">&amp;&amp;</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">AND</code>,{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">||</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">OR</code>,{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">XOR</code>,{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">-&gt;</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">IMPLIES</code>,{' '}
            <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">&lt;-&gt;</code> / <code className="text-[#183B32] dark:text-[#D4E2DC] font-mono bg-[#EAF1E8] dark:bg-[#1A312A] px-1 py-0.5 rounded whitespace-nowrap">IFF</code>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8DFD5] dark:border-[#263C34]">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onGenerate}
            className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 bg-[#176B52] hover:bg-[#125541] dark:bg-[#2CA782] dark:hover:bg-[#248B6C] text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center gap-2 focus:ring-2 focus:ring-[#176B52]/30 focus:outline-none"
          >
            <Play className="w-4 h-4 fill-white shrink-0" />
            <span>Generate Truth Table</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-3.5 sm:px-4 py-2.5 bg-white dark:bg-[#1A312A] hover:bg-[#EAF1E8] dark:hover:bg-[#223E34] text-[#2B3833] dark:text-[#D4E2DC] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 focus:outline-none shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-[#5A6862]" />
            <span>Clear</span>
          </button>
        </div>

        <div className="text-xs text-[#5A6862] dark:text-[#8FA69D] hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] rounded text-[#183B32] dark:text-[#E6EFEA] font-mono">Enter</kbd> to evaluate
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-[#FDF3F2] dark:bg-[#2A1718] border border-[#F5C2C0] dark:border-[#5C2628] rounded-lg flex items-start gap-3 text-[#991B1B] dark:text-[#F87171] text-sm">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[#991B1B] dark:text-[#F87171]">Syntax Error</div>
            <div className="mt-0.5 text-[#7F1D1D] dark:text-[#FCA5A5] leading-relaxed">{errorMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
};
