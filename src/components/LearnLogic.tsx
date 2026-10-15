/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface LearnLogicProps {
  onLoadFormula: (formula: string) => void;
}

export const LearnLogic: React.FC<LearnLogicProps> = ({ onLoadFormula }) => {
  const operators = [
    {
      name: 'Negation',
      symbol: '¬',
      altSymbols: 'NOT, !, ~',
      formulaSample: '¬P',
      reading: '"not P" or "it is not the case that P"',
      definition:
        'Inverts the truth value of a proposition. If P is True, ¬P is False. If P is False, ¬P is True.',
      table: [
        { P: true, result: false },
        { P: false, result: true },
      ],
      type: 'unary',
    },
    {
      name: 'Conjunction',
      symbol: '∧',
      altSymbols: 'AND, &&, &',
      formulaSample: 'P ∧ Q',
      reading: '"P and Q"',
      definition:
        'Evaluates to True if and only if both constituent propositions P and Q are True. A single False input falsifies the conjunction.',
      table: [
        { P: true, Q: true, result: true },
        { P: true, Q: false, result: false },
        { P: false, Q: true, result: false },
        { P: false, Q: false, result: false },
      ],
      type: 'binary',
    },
    {
      name: 'Disjunction (Inclusive OR)',
      symbol: '∨',
      altSymbols: 'OR, ||, |',
      formulaSample: 'P ∨ Q',
      reading: '"P or Q" (or both)',
      definition:
        'Evaluates to True if at least one operand is True. It is only False when both propositions are False.',
      table: [
        { P: true, Q: true, result: true },
        { P: true, Q: false, result: true },
        { P: false, Q: true, result: true },
        { P: false, Q: false, result: false },
      ],
      type: 'binary',
    },
    {
      name: 'Exclusive OR (XOR)',
      symbol: '⊕',
      altSymbols: 'XOR, ⊻',
      formulaSample: 'P ⊕ Q',
      reading: '"either P or Q, but not both"',
      definition:
        'Evaluates to True when the truth values of the operands differ (odd parity). Evaluates to False when both operands share the same truth value.',
      table: [
        { P: true, Q: true, result: false },
        { P: true, Q: false, result: true },
        { P: false, Q: true, result: true },
        { P: false, Q: false, result: false },
      ],
      type: 'binary',
    },
    {
      name: 'Material Implication (Conditional)',
      symbol: '→',
      altSymbols: 'IMPLIES, ->, =>',
      formulaSample: 'P → Q',
      reading: '"if P then Q", "P implies Q", "Q whenever P"',
      definition:
        'Evaluates to False in exactly one scenario: when the antecedent (P) is True and the consequent (Q) is False. If P is False, the implication is vacuously True.',
      note: 'Vacuous Truth: When the premise P is False, no promise was broken, hence the implication remains True.',
      table: [
        { P: true, Q: true, result: true },
        { P: true, Q: false, result: false },
        { P: false, Q: true, result: true },
        { P: false, Q: false, result: true },
      ],
      type: 'binary',
    },
    {
      name: 'Biconditional (Equivalence)',
      symbol: '↔',
      altSymbols: 'IFF, <->, <=>',
      formulaSample: 'P ↔ Q',
      reading: '"P if and only if Q", "P is equivalent to Q"',
      definition:
        'Evaluates to True when both propositions have identical truth values (both True or both False). It is equivalent to (P → Q) ∧ (Q → P).',
      table: [
        { P: true, Q: true, result: true },
        { P: true, Q: false, result: false },
        { P: false, Q: true, result: false },
        { P: false, Q: false, result: true },
      ],
      type: 'binary',
    },
  ];

  const precedenceRules = [
    { rank: 1, name: 'Parentheses', symbol: '( ... )', assoc: 'N/A', note: 'Overrides all standard precedence' },
    { rank: 2, name: 'Negation (NOT)', symbol: '¬', assoc: 'Right-to-left (unary)', note: 'Binds tightly to immediately following proposition' },
    { rank: 3, name: 'Conjunction (AND)', symbol: '∧', assoc: 'Left-to-right', note: 'Higher precedence than disjunction and implication' },
    { rank: 4, name: 'Exclusive OR (XOR)', symbol: '⊕', assoc: 'Left-to-right', note: 'Intermediate between AND and OR' },
    { rank: 5, name: 'Disjunction (OR)', symbol: '∨', assoc: 'Left-to-right', note: 'Lower than AND, higher than Implication' },
    { rank: 6, name: 'Material Implication', symbol: '→', assoc: 'Right-to-left', note: 'Right-associative: P → Q → R is P → (Q → R)' },
    { rank: 7, name: 'Biconditional (IFF)', symbol: '↔', assoc: 'Left-to-right', note: 'Lowest precedence among binary connectives' },
  ];

  const theorems = [
    {
      title: "De Morgan's Laws",
      formula: '¬(P ∧ Q) ↔ (¬P ∨ ¬Q)',
      desc: 'The negation of a conjunction is the disjunction of the negations, and vice-versa.',
    },
    {
      title: 'Law of Contrapositive',
      formula: '(P → Q) ↔ (¬Q → ¬P)',
      desc: 'An implication is logically equivalent to its contrapositive.',
    },
    {
      title: 'Material Implication Equivalence',
      formula: '(P → Q) ↔ (¬P ∨ Q)',
      desc: 'An implication can be restated as "either the premise is false or the conclusion is true".',
    },
    {
      title: 'Double Negation Law',
      formula: '¬(¬P) ↔ P',
      desc: 'A proposition is logically equivalent to the negation of its negation.',
    },
    {
      title: 'Distributive Laws',
      formula: '(P ∧ (Q ∨ R)) ↔ ((P ∧ Q) ∨ (P ∧ R))',
      desc: 'Conjunction distributes over disjunction, just as multiplication distributes over addition.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Introduction Banner */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#183B32] dark:text-[#E6EFEA]">
              Propositional Logic Foundations & Truth Tables
            </h2>
            <p className="text-[#2B3833] dark:text-[#D4E2DC] text-sm mt-1.5 leading-relaxed">
              Propositional logic (sentential calculus) is the branch of mathematical logic that studies
              declarative statements whose values are either True (T) or False (F). In this activity, you
              can inspect formal connectives, standard operator precedence, and foundational equivalences.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Logical Connectives Grid */}
      <div>
        <h3 className="text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] mb-4 flex items-center gap-2">
          <span>Standard Propositional Connectives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operators.map((op) => (
            <div
              key={op.name}
              className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-[#176B52] dark:hover:border-[#2CA782] transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D8DFD5] dark:border-[#263C34]">
                  <div>
                    <h4 className="font-bold text-[#183B32] dark:text-[#E6EFEA] text-base">{op.name}</h4>
                    <div className="text-xs text-[#5A6862] dark:text-[#8FA69D] font-mono mt-0.5">
                      Symbols: {op.altSymbols}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] text-[#176B52] dark:text-[#2CA782] font-mono text-xl font-bold flex items-center justify-center shrink-0">
                    {op.symbol}
                  </div>
                </div>

                {/* Natural language reading */}
                <div className="mt-3 text-xs text-[#176B52] dark:text-[#2CA782] italic font-medium">
                  Read as: {op.reading}
                </div>

                {/* Definition */}
                <p className="mt-2 text-xs text-[#2B3833] dark:text-[#D4E2DC] leading-relaxed">
                  {op.definition}
                </p>

                {op.note && (
                  <div className="mt-2.5 p-2.5 bg-[#FFFBEB] dark:bg-[#2A2314] border border-[#FDE68A] dark:border-[#4E3E1C] rounded text-[11px] text-[#92400E] dark:text-[#FCD34D] leading-normal flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FBBF24] shrink-0 mt-0.5" />
                    <span>{op.note}</span>
                  </div>
                )}

                {/* Mini Truth Table */}
                <div className="mt-4 border border-[#D8DFD5] dark:border-[#263C34] rounded-lg overflow-hidden font-mono text-xs">
                  <table className="w-full text-center">
                    <thead className="bg-[#183B32] text-white border-b border-[#183B32]">
                      <tr>
                        <th className="py-1.5 px-2">P</th>
                        {op.type === 'binary' && <th className="py-1.5 px-2">Q</th>}
                        <th className="py-1.5 px-2 bg-[#135E47] text-white font-bold">
                          {op.formulaSample}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34]">
                      {op.table.map((row, i) => (
                        <tr key={i} className="hover:bg-[#FAF9F5] dark:hover:bg-[#1A312A]">
                          <td className="py-1 px-2 font-medium">
                            <span className={row.P ? 'text-[#176B52] dark:text-[#2CA782] font-bold' : 'text-[#5A6862] dark:text-[#8FA69D]'}>
                              {row.P ? 'T' : 'F'}
                            </span>
                          </td>
                          {op.type === 'binary' && 'Q' in row && (
                            <td className="py-1 px-2 font-medium">
                              <span className={row.Q ? 'text-[#176B52] dark:text-[#2CA782] font-bold' : 'text-[#5A6862] dark:text-[#8FA69D]'}>
                                {row.Q ? 'T' : 'F'}
                              </span>
                            </td>
                          )}
                          <td
                            className={`py-1 px-2 font-bold ${
                              row.result ? 'text-[#176B52] dark:text-[#2CA782] bg-[#EAF1E8]/60 dark:bg-[#162722]' : 'text-[#991B1B] dark:text-[#F87171] bg-[#FDF3F2]/60 dark:bg-[#2A1718]'
                            }`}
                          >
                            {row.result ? 'T' : 'F'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Try Formula in Generator */}
              <div className="mt-4 pt-3 border-t border-[#D8DFD5] dark:border-[#263C34]">
                <button
                  type="button"
                  onClick={() => onLoadFormula(op.formulaSample)}
                  className="w-full py-2 px-3 bg-[#EAF1E8] hover:bg-[#DFE9DD] dark:bg-[#1A312A] dark:hover:bg-[#223E34] text-[#176B52] dark:text-[#2CA782] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Evaluate {op.formulaSample} in Workbench</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Precedence Reference Table */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] mb-2">
          Formal Operator Precedence & Associativity
        </h3>
        <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mb-4">
          When an expression lacks explicit parentheses, operators evaluate in this strict mathematical order:
        </p>

        <div className="border border-[#D8DFD5] dark:border-[#263C34] rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#183B32] text-white border-b border-[#183B32] font-mono">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                <th className="py-2.5 px-4">Operator</th>
                <th className="py-2.5 px-4 font-mono text-center w-24">Symbol</th>
                <th className="py-2.5 px-4">Associativity</th>
                <th className="py-2.5 px-4">Semantics / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DFD5] dark:divide-[#263C34] font-sans">
              {precedenceRules.map((rule, idx) => (
                <tr
                  key={rule.rank}
                  className={idx % 2 === 0 ? 'bg-white dark:bg-[#14221E]' : 'bg-[#FAF9F5] dark:bg-[#101A17]'}
                >
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#176B52] dark:text-[#2CA782]">
                    {rule.rank}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#183B32] dark:text-[#E6EFEA]">
                    {rule.name}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-lg text-[#176B52] dark:text-[#2CA782]">
                    {rule.symbol}
                  </td>
                  <td className="py-2.5 px-4 text-[#2B3833] dark:text-[#D4E2DC] font-mono text-xs">
                    {rule.assoc}
                  </td>
                  <td className="py-2.5 px-4 text-[#5A6862] dark:text-[#8FA69D] text-xs">
                    {rule.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classic Logical Equivalence Laws */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] mb-3">
          Fundamental Logical Equivalence Theorems
        </h3>
        <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mb-4">
          Two formulas are logically equivalent if their biconditional is a Tautology (always True).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {theorems.map((thm) => (
            <div
              key={thm.title}
              className="p-4 bg-[#FAF9F5] dark:bg-[#101A17] border border-[#D8DFD5] dark:border-[#263C34] rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-[#183B32] dark:text-[#E6EFEA] text-sm">{thm.title}</div>
                <div className="my-2 p-2 rounded bg-white dark:bg-[#162722] border border-[#D8DFD5] dark:border-[#263C34] font-mono text-[#176B52] dark:text-[#2CA782] text-xs sm:text-sm font-semibold">
                  {thm.formula}
                </div>
                <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] leading-relaxed">{thm.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#D8DFD5] dark:border-[#263C34]">
                <button
                  type="button"
                  onClick={() => onLoadFormula(thm.formula)}
                  className="text-xs text-[#176B52] dark:text-[#2CA782] hover:text-[#125541] font-semibold inline-flex items-center gap-1"
                >
                  Verify Tautology in TruthLab →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
