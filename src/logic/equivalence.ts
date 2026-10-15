/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EquivalenceComparison,
  EquivalenceRow,
} from './types';
import { parseLogicalExpression } from './parser';
import { evaluateExpression, formatBool } from './evaluator';
import {
  extractVariables,
  generateTruthAssignments,
  generateTruthTable,
  MAX_VARIABLES,
} from './truthTable';

/**
 * Compares two propositional logic expressions for logical equivalence.
 * Evaluates both expressions over the unified universe of variables.
 */
export function compareEquivalence(
  rawExpressionA: string,
  rawExpressionB: string
): EquivalenceComparison {
  const trimmedA = rawExpressionA.trim();
  const trimmedB = rawExpressionB.trim();

  if (!trimmedA && !trimmedB) {
    throw new Error('Please enter both Expression A and Expression B to test for logical equivalence.');
  }
  if (!trimmedA) {
    throw new Error('Expression A is empty. Please enter a valid propositional logic formula.');
  }
  if (!trimmedB) {
    throw new Error('Expression B is empty. Please enter a valid propositional logic formula.');
  }

  // Parse each expression
  let astA;
  try {
    astA = parseLogicalExpression(trimmedA);
  } catch (err: any) {
    throw new Error(`Expression A syntax error: ${err.message}`);
  }

  let astB;
  try {
    astB = parseLogicalExpression(trimmedB);
  } catch (err: any) {
    throw new Error(`Expression B syntax error: ${err.message}`);
  }

  // Generate individual tables to obtain standard classifications and metadata
  const tableA = generateTruthTable(trimmedA);
  const tableB = generateTruthTable(trimmedB);

  const variablesA = extractVariables(astA);
  const variablesB = extractVariables(astB);

  // Unified variable set sorted alphabetically
  const allVariables = Array.from(new Set([...variablesA, ...variablesB])).sort();

  if (allVariables.length > MAX_VARIABLES) {
    throw new Error(
      `Combined formulas contain ${allVariables.length} distinct variables (${allVariables.join(', ')}). The maximum limit is ${MAX_VARIABLES} variables ($2^{10} = 1024$ rows) to maintain client-side performance.`
    );
  }

  const hasDifferentVariableSets =
    variablesA.length !== variablesB.length ||
    variablesA.some((v, idx) => v !== variablesB[idx]);

  // Generate assignments for the combined variable universe
  const assignmentsList = generateTruthAssignments(allVariables);

  const rows: EquivalenceRow[] = [];
  const differingRowIndices: number[] = [];
  let matchingCount = 0;
  let differingCount = 0;

  for (let i = 0; i < assignmentsList.length; i++) {
    const assignments = assignmentsList[i];
    const traceA = evaluateExpression(astA, assignments);
    const traceB = evaluateExpression(astB, assignments);

    const resultA = traceA.finalResult;
    const resultB = traceB.finalResult;
    const isEquivalent = resultA === resultB;

    if (isEquivalent) {
      matchingCount++;
    } else {
      differingCount++;
      differingRowIndices.push(i + 1);
    }

    let diffReason: string | undefined;
    if (!isEquivalent) {
      diffReason = `Row #${i + 1}: Expression A yields ${formatBool(resultA, 'TrueFalse')} while Expression B yields ${formatBool(resultB, 'TrueFalse')}.`;
    }

    rows.push({
      rowIndex: i + 1,
      assignments,
      resultA,
      resultB,
      isEquivalent,
      diffReason,
    });
  }

  const totalRows = rows.length;
  const isLogicallyEquivalent = differingCount === 0;

  let explanation = '';
  if (isLogicallyEquivalent) {
    if (hasDifferentVariableSets) {
      explanation = `The expressions are logically equivalent (A ≡ B). Evaluated across the unified variable universe {${allVariables.join(', ')}}, both expressions evaluate to identical truth values for all ${totalRows} assignments. The biconditional (A ↔ B) is a Tautology.`;
    } else {
      explanation = `The expressions are logically equivalent (A ≡ B). Across all ${totalRows} truth assignments for {${allVariables.join(', ')}}, both formulas yield identical truth values. The biconditional (A ↔ B) is a Tautology.`;
    }
  } else {
    explanation = `The expressions are NOT logically equivalent (A ≢ B). There are ${differingCount} differing row${differingCount === 1 ? '' : 's'} (counterexamples) out of ${totalRows} total truth assignments where their truth values disagree.`;
  }

  return {
    expressionA: trimmedA,
    expressionB: trimmedB,
    astA,
    astB,
    variablesA,
    variablesB,
    allVariables,
    hasDifferentVariableSets,
    rows,
    totalRows,
    matchingRowsCount: matchingCount,
    differingRowsCount: differingCount,
    isLogicallyEquivalent,
    tableA,
    tableB,
    classificationA: tableA.classification,
    classificationB: tableB.classification,
    explanation,
    differingRowIndices,
  };
}
