/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateTruthTable } from './truthTable';
import { parseLogicalExpression } from './parser';
import { evaluateExpression } from './evaluator';
import { compareEquivalence } from './equivalence';

export interface TestCase {
  id: string;
  category: string;
  name: string;
  description: string;
  expression: string;
  expectedClassification?: 'Tautology' | 'Contradiction' | 'Contingency';
  expectedTotalRows?: number;
  expectedTrueCount?: number;
  expectedFalseCount?: number;
  validate?: () => { passed: boolean; message: string };
}

export interface TestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  expression: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export const UNIT_TESTS: TestCase[] = [
  // 1. Basic Operators
  {
    id: 'test-not',
    category: 'Basic Operators',
    name: 'NOT Operator (¬P)',
    description: 'Verifies negation flips True to False and False to True.',
    expression: '¬P',
    expectedClassification: 'Contingency',
    expectedTotalRows: 2,
    expectedTrueCount: 1,
    expectedFalseCount: 1,
  },
  {
    id: 'test-and',
    category: 'Basic Operators',
    name: 'AND Operator (P ∧ Q)',
    description: 'Verifies conjunction is true only when both are true (1 True, 3 False).',
    expression: 'P ∧ Q',
    expectedClassification: 'Contingency',
    expectedTotalRows: 4,
    expectedTrueCount: 1,
    expectedFalseCount: 3,
  },
  {
    id: 'test-or',
    category: 'Basic Operators',
    name: 'OR Operator (P ∨ Q)',
    description: 'Verifies disjunction is true when at least one is true (3 True, 1 False).',
    expression: 'P ∨ Q',
    expectedClassification: 'Contingency',
    expectedTotalRows: 4,
    expectedTrueCount: 3,
    expectedFalseCount: 1,
  },
  {
    id: 'test-xor',
    category: 'Basic Operators',
    name: 'XOR Operator (P ⊕ Q)',
    description: 'Verifies XOR is true only when operands differ (2 True, 2 False).',
    expression: 'P ⊕ Q',
    expectedClassification: 'Contingency',
    expectedTotalRows: 4,
    expectedTrueCount: 2,
    expectedFalseCount: 2,
  },
  {
    id: 'test-implies',
    category: 'Basic Operators',
    name: 'Implication (P → Q)',
    description: 'Verifies implication is false only when T → F (3 True, 1 False).',
    expression: 'P → Q',
    expectedClassification: 'Contingency',
    expectedTotalRows: 4,
    expectedTrueCount: 3,
    expectedFalseCount: 1,
  },
  {
    id: 'test-iff',
    category: 'Basic Operators',
    name: 'Biconditional (P ↔ Q)',
    description: 'Verifies biconditional is true when values match (2 True, 2 False).',
    expression: 'P ↔ Q',
    expectedClassification: 'Contingency',
    expectedTotalRows: 4,
    expectedTrueCount: 2,
    expectedFalseCount: 2,
  },

  // 2. Precedence and Associativity
  {
    id: 'test-precedence-not-and',
    category: 'Operator Precedence',
    name: 'NOT over AND precedence (¬P ∧ Q vs ¬(P ∧ Q))',
    description: '¬P ∧ Q must bind ¬ to P first: (¬P) ∧ Q.',
    expression: '¬P ∧ Q',
    validate: () => {
      const ast1 = parseLogicalExpression('¬P ∧ Q');
      const table1 = generateTruthTable('¬P ∧ Q');
      // For P=T, Q=T: ¬T ∧ T = F ∧ T = F
      // For P=F, Q=T: ¬F ∧ T = T ∧ T = T
      const rowFT = table1.rows.find((r) => !r.assignments.P && r.assignments.Q);
      const rowTT = table1.rows.find((r) => r.assignments.P && r.assignments.Q);
      const passed = rowFT?.result === true && rowTT?.result === false && table1.trueCount === 1;
      return {
        passed,
        message: passed
          ? '¬ binds more tightly than ∧ as specified.'
          : 'Precedence error between NOT and AND.',
      };
    },
  },
  {
    id: 'test-precedence-and-or',
    category: 'Operator Precedence',
    name: 'AND over OR precedence (P ∨ Q ∧ R)',
    description: 'P ∨ Q ∧ R must parse as P ∨ (Q ∧ R).',
    expression: 'P ∨ Q ∧ R',
    validate: () => {
      const table = generateTruthTable('P ∨ Q ∧ R');
      // When P=F, Q=T, R=F -> F ∨ (T ∧ F) = F ∨ F = F
      // If it were (P ∨ Q) ∧ R -> (F ∨ T) ∧ F = T ∧ F = F
      // When P=T, Q=F, R=F -> T ∨ (F ∧ F) = T. (If (P ∨ Q) ∧ R -> T ∧ F = F)
      const testRow = table.rows.find((r) => r.assignments.P && !r.assignments.Q && !r.assignments.R);
      const passed = testRow?.result === true;
      return {
        passed,
        message: passed
          ? 'AND has higher precedence than OR as required.'
          : 'Precedence error between AND and OR.',
      };
    },
  },
  {
    id: 'test-precedence-xor-or',
    category: 'Operator Precedence',
    name: 'XOR over OR precedence (P ∨ Q ⊕ R)',
    description: 'P ∨ Q ⊕ R must parse as P ∨ (Q ⊕ R) since XOR > OR.',
    expression: 'P ∨ Q ⊕ R',
    validate: () => {
      const table = generateTruthTable('P ∨ Q ⊕ R');
      // When P=T, Q=T, R=T: Q ⊕ R is F, P ∨ F is T.
      // When P=F, Q=T, R=T: Q ⊕ R is F, P ∨ F is F.
      const rowFTT = table.rows.find((r) => !r.assignments.P && r.assignments.Q && r.assignments.R);
      const passed = rowFTT?.result === false;
      return {
        passed,
        message: passed
          ? 'XOR has higher precedence than OR.'
          : 'Precedence error between XOR and OR.',
      };
    },
  },
  {
    id: 'test-right-associative-implication',
    category: 'Operator Precedence',
    name: 'Right-associativity of Implication (P → Q → R)',
    description: 'P → Q → R must be right-associative: P → (Q → R), NOT (P → Q) → R.',
    expression: 'P → Q → R',
    validate: () => {
      const table = generateTruthTable('P → Q → R');
      // Let P = F, Q = F, R = F.
      // If right-associative P → (Q → R):
      // Q → R = F → F = T. P → T = F → T = T.
      // If left-associative (P → Q) → R:
      // (F → F) → F = T → F = F.
      const rowFFF = table.rows.find((r) => !r.assignments.P && !r.assignments.Q && !r.assignments.R);
      const passed = rowFFF?.result === true;
      return {
        passed,
        message: passed
          ? 'Implication is strictly right-associative: P → (Q → R).'
          : 'Implication was parsed left-associatively.',
      };
    },
  },
  {
    id: 'test-parentheses-override',
    category: 'Parentheses',
    name: 'Parentheses override precedence ((P ∨ Q) ∧ R)',
    description: 'Explicit parentheses override standard operator precedence.',
    expression: '(P ∨ Q) ∧ R',
    expectedClassification: 'Contingency',
    expectedTotalRows: 8,
    expectedTrueCount: 3,
    expectedFalseCount: 5,
  },

  // 3. Classic Propositional Logic Theorems
  {
    id: 'test-tautology-demorgan',
    category: 'Tautologies & Theorems',
    name: "De Morgan's First Law (¬(P ∧ Q) ↔ (¬P ∨ ¬Q))",
    description: 'Fundamental propositional equivalence theorem.',
    expression: '¬(P ∧ Q) ↔ (¬P ∨ ¬Q)',
    expectedClassification: 'Tautology',
    expectedTotalRows: 4,
    expectedTrueCount: 4,
    expectedFalseCount: 0,
  },
  {
    id: 'test-tautology-modus-ponens',
    category: 'Tautologies & Theorems',
    name: 'Modus Ponens Law (((P → Q) ∧ P) → Q)',
    description: 'Classical deductive reasoning tautology.',
    expression: '((P → Q) ∧ P) → Q',
    expectedClassification: 'Tautology',
    expectedTotalRows: 4,
    expectedTrueCount: 4,
    expectedFalseCount: 0,
  },
  {
    id: 'test-tautology-excluded-middle',
    category: 'Tautologies & Theorems',
    name: 'Law of Excluded Middle (P ∨ ¬P)',
    description: 'Every proposition is either true or false.',
    expression: 'P ∨ ¬P',
    expectedClassification: 'Tautology',
    expectedTotalRows: 2,
    expectedTrueCount: 2,
    expectedFalseCount: 0,
  },
  {
    id: 'test-contradiction-self',
    category: 'Contradictions',
    name: 'Self-Contradiction (P ∧ ¬P)',
    description: 'Statement and its negation cannot simultaneously be true.',
    expression: 'P ∧ ¬P',
    expectedClassification: 'Contradiction',
    expectedTotalRows: 2,
    expectedTrueCount: 0,
    expectedFalseCount: 2,
  },

  // 4. Input Syntax & Error Handling
  {
    id: 'test-syntax-keywords',
    category: 'Text & Symbol Synonyms',
    name: 'Natural Language Keywords (P IMPLIES Q AND NOT R)',
    description: 'Handles text keywords IMPLIES, AND, NOT interchangeably with symbols.',
    expression: 'P IMPLIES Q AND NOT R',
    validate: () => {
      try {
        const table = generateTruthTable('P IMPLIES Q AND NOT R');
        const passed = table.totalRows === 8 && table.variables.length === 3;
        return {
          passed,
          message: passed ? 'Successfully tokenized and evaluated keyword expression.' : 'Failed table size.',
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-error-unmatched-paren',
    category: 'Error Handling',
    name: 'Unmatched Opening Parenthesis ((P ∧ Q)',
    description: 'Catches missing closing bracket with a clear error message.',
    expression: '(P ∧ Q',
    validate: () => {
      try {
        generateTruthTable('(P ∧ Q');
        return { passed: false, message: 'Expected syntax error for missing parenthesis, but none was thrown.' };
      } catch (err: any) {
        const passed = err.message.toLowerCase().includes('closing') || err.message.includes(')');
        return {
          passed,
          message: passed ? 'Accurately caught missing closing parenthesis.' : err.message,
        };
      }
    },
  },
  {
    id: 'test-error-missing-operand',
    category: 'Error Handling',
    name: 'Missing Operand (P ∧)',
    description: 'Catches trailing binary operator with a clear error message.',
    expression: 'P ∧',
    validate: () => {
      try {
        generateTruthTable('P ∧');
        return { passed: false, message: 'Expected syntax error for dangling operator, but none was thrown.' };
      } catch (err: any) {
        const passed = err.message.length > 0;
        return {
          passed,
          message: passed ? 'Accurately caught dangling operator.' : err.message,
        };
      }
    },
  },

  // 5. Logic Workbench & Equivalence Checker Tests
  {
    id: 'test-equiv-demorgan',
    category: 'Logic Workbench (Equivalence)',
    name: "Equivalence: De Morgan's Law (¬(P ∧ Q) ≡ ¬P ∨ ¬Q)",
    description: 'Verifies that De Morgan conjunction negation is logically equivalent to disjunction of negations.',
    expression: '¬(P ∧ Q) ≡ ¬P ∨ ¬Q',
    validate: () => {
      try {
        const comp = compareEquivalence('¬(P ∧ Q)', '¬P ∨ ¬Q');
        const passed = comp.isLogicallyEquivalent && comp.differingRowsCount === 0 && comp.totalRows === 4;
        return {
          passed,
          message: passed
            ? 'Expressions verified logically equivalent across all 4 truth assignments.'
            : `Failed: ${comp.differingRowsCount} differing rows.`,
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-equiv-implication',
    category: 'Logic Workbench (Equivalence)',
    name: 'Equivalence: Material Implication (P → Q ≡ ¬P ∨ Q)',
    description: 'Verifies standard conditional equivalence.',
    expression: 'P → Q ≡ ¬P ∨ Q',
    validate: () => {
      try {
        const comp = compareEquivalence('P → Q', '¬P ∨ Q');
        const passed = comp.isLogicallyEquivalent && comp.differingRowsCount === 0;
        return {
          passed,
          message: passed
            ? 'Implication verified equivalent to ¬P ∨ Q.'
            : `Failed: ${comp.differingRowsCount} differing rows.`,
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-nonequiv-converse',
    category: 'Logic Workbench (Equivalence)',
    name: 'Non-Equivalence: Implication vs Converse (P → Q ≢ Q → P)',
    description: 'Verifies detection of non-equivalent formulas with counterexamples highlighted.',
    expression: 'P → Q ≢ Q → P',
    validate: () => {
      try {
        const comp = compareEquivalence('P → Q', 'Q → P');
        const passed = !comp.isLogicallyEquivalent && comp.differingRowsCount === 2;
        return {
          passed,
          message: passed
            ? 'Correctly identified as NOT equivalent with 2 counterexample rows (P=T,Q=F and P=F,Q=T).'
            : `Expected 2 differing rows, got ${comp.differingRowsCount}.`,
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-equiv-diff-variables-tautology',
    category: 'Logic Workbench (Equivalence)',
    name: 'Different Variable Names: Tautology Equivalence (P ∨ ¬P ≡ Q ∨ ¬Q)',
    description: 'Verifies equivalence over unified variable universe {P, Q} for formulas with different variables.',
    expression: 'P ∨ ¬P ≡ Q ∨ ¬Q',
    validate: () => {
      try {
        const comp = compareEquivalence('P ∨ ¬P', 'Q ∨ ¬Q');
        const passed = comp.isLogicallyEquivalent && comp.hasDifferentVariableSets && comp.allVariables.length === 2 && comp.totalRows === 4;
        return {
          passed,
          message: passed
            ? 'Correctly unified variables {P, Q} and confirmed both are tautologies equivalent across all 4 rows.'
            : 'Failed different variable names equivalence test.',
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-nonequiv-diff-variables',
    category: 'Logic Workbench (Equivalence)',
    name: 'Different Variable Names: Distinct Propositions (P ≢ Q)',
    description: 'Verifies that independent proposition variables P and Q are not equivalent across {P, Q}.',
    expression: 'P ≢ Q',
    validate: () => {
      try {
        const comp = compareEquivalence('P', 'Q');
        const passed = !comp.isLogicallyEquivalent && comp.differingRowsCount === 2 && comp.totalRows === 4;
        return {
          passed,
          message: passed
            ? 'Correctly identified independent variables P and Q as non-equivalent (differ when P≠Q).'
            : `Failed: expected 2 differing rows, got ${comp.differingRowsCount}.`,
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
  {
    id: 'test-equiv-invalid-input',
    category: 'Logic Workbench (Equivalence)',
    name: 'Validation: Missing & Malformed Workbench Inputs',
    description: 'Verifies clear validation error messages when expressions are missing or malformed in Workbench.',
    expression: 'Validation Error Handling',
    validate: () => {
      try {
        // Test 1: Empty expression A
        let threwA = false;
        try {
          compareEquivalence('', 'P ∧ Q');
        } catch (e: any) {
          threwA = e.message.includes('Expression A is empty');
        }

        // Test 2: Malformed expression B
        let threwB = false;
        try {
          compareEquivalence('P ∧ Q', 'P ∧');
        } catch (e: any) {
          threwB = e.message.includes('Expression B syntax error');
        }

        const passed = threwA && threwB;
        return {
          passed,
          message: passed
            ? 'Accurately returned clear validation errors for empty and malformed inputs.'
            : `Failed validation tests (threwA=${threwA}, threwB=${threwB}).`,
        };
      } catch (err: any) {
        return { passed: false, message: err.message };
      }
    },
  },
];

export function runAllUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  for (const test of UNIT_TESTS) {
    const start = performance.now();
    try {
      if (test.validate) {
        const valRes = test.validate();
        results.push({
          id: test.id,
          category: test.category,
          name: test.name,
          description: test.description,
          expression: test.expression,
          passed: valRes.passed,
          message: valRes.message,
          durationMs: Math.round((performance.now() - start) * 100) / 100,
        });
      } else {
        const table = generateTruthTable(test.expression);
        let passed = true;
        const failureReasons: string[] = [];

        if (test.expectedClassification && table.classification !== test.expectedClassification) {
          passed = false;
          failureReasons.push(
            `Classification mismatch: expected ${test.expectedClassification}, got ${table.classification}`
          );
        }
        if (test.expectedTotalRows !== undefined && table.totalRows !== test.expectedTotalRows) {
          passed = false;
          failureReasons.push(`Total rows mismatch: expected ${test.expectedTotalRows}, got ${table.totalRows}`);
        }
        if (test.expectedTrueCount !== undefined && table.trueCount !== test.expectedTrueCount) {
          passed = false;
          failureReasons.push(`True count mismatch: expected ${test.expectedTrueCount}, got ${table.trueCount}`);
        }
        if (test.expectedFalseCount !== undefined && table.falseCount !== test.expectedFalseCount) {
          passed = false;
          failureReasons.push(`False count mismatch: expected ${test.expectedFalseCount}, got ${table.falseCount}`);
        }

        results.push({
          id: test.id,
          category: test.category,
          name: test.name,
          description: test.description,
          expression: test.expression,
          passed,
          message: passed
            ? `Verified mathematically: ${table.classification} (${table.trueCount}T / ${table.falseCount}F across ${table.totalRows} rows).`
            : failureReasons.join('; '),
          durationMs: Math.round((performance.now() - start) * 100) / 100,
        });
      }
    } catch (err: any) {
      results.push({
        id: test.id,
        category: test.category,
        name: test.name,
        description: test.description,
        expression: test.expression,
        passed: false,
        message: `Exception during test execution: ${err.message}`,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    }
  }

  return results;
}
