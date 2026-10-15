/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, TruthTableResult, TruthTableRow, ExpressionClassification } from './types';
import { evaluateExpression } from './evaluator';
import { parseLogicalExpression } from './parser';

export const MAX_VARIABLES = 10;

/**
 * Extracts unique variable names from the AST and sorts them alphabetically.
 */
export function extractVariables(node: ASTNode): string[] {
  const vars = new Set<string>();

  function walk(current: ASTNode) {
    if (current.type === 'variable') {
      vars.add(current.name);
    } else if (current.type === 'unary') {
      walk(current.operand);
    } else if (current.type === 'binary') {
      walk(current.left);
      walk(current.right);
    }
  }

  walk(node);
  return Array.from(vars).sort();
}

/**
 * Extracts all non-trivial intermediate subexpressions in bottom-up evaluation order.
 * Excludes single variables and constants, and excludes the root expression itself.
 */
export function extractIntermediateExpressions(node: ASTNode): string[] {
  const subexprs: string[] = [];
  const seen = new Set<string>();

  function walk(current: ASTNode) {
    if (current.type === 'variable' || current.type === 'constant') {
      return;
    }

    if (current.type === 'unary') {
      walk(current.operand);
    } else if (current.type === 'binary') {
      walk(current.left);
      walk(current.right);
    }

    // Only add if not seen and not identical to root raw
    if (!seen.has(current.raw) && current.raw !== node.raw) {
      seen.add(current.raw);
      subexprs.push(current.raw);
    }
  }

  walk(node);
  return subexprs;
}

/**
 * Generates all 2^n truth assignments in canonical descending truth table order (T first, then F).
 */
export function generateTruthAssignments(variables: string[]): Record<string, boolean>[] {
  const n = variables.length;
  if (n === 0) {
    return [{}];
  }

  const total = Math.pow(2, n);
  const assignments: Record<string, boolean>[] = [];

  for (let i = 0; i < total; i++) {
    const row: Record<string, boolean> = {};
    for (let v = 0; v < n; v++) {
      // In canonical truth table order:
      // variable 0 flips every 2^(n-1) rows, variable 1 every 2^(n-2), etc.
      const period = Math.pow(2, n - 1 - v);
      const isTrue = Math.floor(i / period) % 2 === 0;
      row[variables[v]] = isTrue;
    }
    assignments.push(row);
  }

  return assignments;
}

/**
 * Builds the complete TruthTableResult for an input expression string.
 */
export function generateTruthTable(input: string): TruthTableResult {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Please enter a propositional logic formula.');
  }

  const ast = parseLogicalExpression(trimmed);
  const variables = extractVariables(ast);

  if (variables.length > MAX_VARIABLES) {
    throw new Error(
      `Formula contains ${variables.length} distinct variables (${variables.join(', ')}). The maximum limit is ${MAX_VARIABLES} variables ($2^{10} = 1024$ rows) to prevent browser unresponsiveness.`
    );
  }

  const intermediates = extractIntermediateExpressions(ast);
  const assignmentsList = generateTruthAssignments(variables);

  const rows: TruthTableRow[] = [];
  let trueCount = 0;
  let falseCount = 0;

  for (let i = 0; i < assignmentsList.length; i++) {
    const assignments = assignmentsList[i];
    const trace = evaluateExpression(ast, assignments);

    const intermediateValues: Record<string, boolean> = {};
    for (const expr of intermediates) {
      intermediateValues[expr] = trace.subexpressionResults[expr] ?? false;
    }

    if (trace.finalResult) {
      trueCount++;
    } else {
      falseCount++;
    }

    rows.push({
      rowIndex: i + 1,
      assignments,
      intermediateValues,
      result: trace.finalResult,
    });
  }

  const totalRows = rows.length;
  let classification: ExpressionClassification = 'Contingency';
  let classificationExplanation = '';

  if (trueCount === totalRows) {
    classification = 'Tautology';
    classificationExplanation =
      'This statement is a Tautology (logically valid). It evaluates to True under every possible interpretation and truth assignment.';
  } else if (falseCount === totalRows) {
    classification = 'Contradiction';
    classificationExplanation =
      'This statement is a Contradiction (unsatisfiable). It evaluates to False under every possible interpretation and truth assignment.';
  } else {
    classification = 'Contingency';
    const truePercent = Math.round((trueCount / totalRows) * 100);
    classificationExplanation = `This statement is a Contingency. Its truth value depends on variable assignments (${trueCount} True / ${falseCount} False, ${truePercent}% true).`;
  }

  return {
    expression: trimmed,
    canonicalExpression: ast.raw,
    variables,
    intermediateExpressions: intermediates,
    rows,
    totalRows,
    trueCount,
    falseCount,
    classification,
    classificationExplanation,
    ast,
  };
}
