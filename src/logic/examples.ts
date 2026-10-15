/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogicExample {
  title: string;
  category: 'Required' | 'Theorems & Laws' | 'Fallacies & Paradoxes';
  formula: string;
  description: string;
  expected: string;
}

export const LOGIC_EXAMPLES: LogicExample[] = [
  // Prompt required examples
  {
    title: 'Conjunction (AND)',
    category: 'Required',
    formula: 'P ∧ Q',
    description: 'True only when both propositions P and Q are true.',
    expected: 'Contingency (1 True, 3 False)',
  },
  {
    title: 'Disjunction (OR)',
    category: 'Required',
    formula: 'P ∨ Q',
    description: 'True when at least one of P or Q is true (inclusive OR).',
    expected: 'Contingency (3 True, 1 False)',
  },
  {
    title: 'Negation (NOT)',
    category: 'Required',
    formula: '¬P',
    description: 'Inverts the truth value of proposition P.',
    expected: 'Contingency (1 True, 1 False)',
  },
  {
    title: 'Material Implication (Conditional)',
    category: 'Required',
    formula: 'P → Q',
    description: 'False only when P is True and Q is False (false promise).',
    expected: 'Contingency (3 True, 1 False)',
  },
  {
    title: 'Biconditional (Equivalence)',
    category: 'Required',
    formula: 'P ↔ Q',
    description: 'True when both propositions have identical truth values.',
    expected: 'Contingency (2 True, 2 False)',
  },
  {
    title: 'Compound Implication',
    category: 'Required',
    formula: '(P ∧ Q) → R',
    description: 'If both P and Q hold, then R must follow.',
    expected: 'Contingency (7 True, 1 False)',
  },
  {
    title: 'Mixed Conjunction & Disjunction',
    category: 'Required',
    formula: '(P ∨ Q) ∧ ¬R',
    description: 'Either P or Q is true, and R is false.',
    expected: 'Contingency (3 True, 5 False)',
  },
  {
    title: 'Mutual Implication (Equivalence definition)',
    category: 'Required',
    formula: '(P → Q) ∧ (Q → P)',
    description: 'Demonstrates that (P → Q) ∧ (Q → P) is logically equivalent to P ↔ Q.',
    expected: 'Contingency (2 True, 2 False)',
  },

  // Academic theorems & laws
  {
    title: "De Morgan's First Law",
    category: 'Theorems & Laws',
    formula: '¬(P ∧ Q) ↔ (¬P ∨ ¬Q)',
    description: 'The negation of a conjunction is the disjunction of the negations.',
    expected: 'Tautology (Always True)',
  },
  {
    title: 'Modus Ponens Deduction',
    category: 'Theorems & Laws',
    formula: '((P → Q) ∧ P) → Q',
    description: 'If P implies Q and P is true, then Q is necessarily true.',
    expected: 'Tautology (Valid Argument)',
  },
  {
    title: 'Contraposition Law',
    category: 'Theorems & Laws',
    formula: '(P → Q) ↔ (¬Q → ¬P)',
    description: 'An implication is logically equivalent to its contrapositive.',
    expected: 'Tautology (Always True)',
  },
  {
    title: 'Law of Excluded Middle',
    category: 'Theorems & Laws',
    formula: 'P ∨ ¬P',
    description: 'A proposition must be either true or false.',
    expected: 'Tautology (Always True)',
  },
  {
    title: 'Self-Contradiction',
    category: 'Theorems & Laws',
    formula: 'P ∧ ¬P',
    description: 'A proposition cannot be simultaneously true and false.',
    expected: 'Contradiction (Always False)',
  },
  {
    title: 'Exclusive OR vs Equivalence',
    category: 'Theorems & Laws',
    formula: '(P ⊕ Q) ↔ ¬(P ↔ Q)',
    description: 'XOR is the exact logical negation of the biconditional.',
    expected: 'Tautology (Always True)',
  },
];
