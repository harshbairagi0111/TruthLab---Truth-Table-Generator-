/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TokenType =
  | 'VAR'
  | 'CONST'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'IMPLIES'
  | 'IFF'
  | 'LPAREN'
  | 'RPAREN'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export type ASTNode =
  | { type: 'variable'; name: string; raw: string }
  | { type: 'constant'; value: boolean; raw: string }
  | { type: 'unary'; operator: 'NOT'; operand: ASTNode; raw: string }
  | {
      type: 'binary';
      operator: 'AND' | 'OR' | 'XOR' | 'IMPLIES' | 'IFF';
      left: ASTNode;
      right: ASTNode;
      raw: string;
    };

export interface EvaluationStep {
  id: string;
  subexpression: string;
  operator?: string;
  operands?: { name: string; value: boolean }[];
  result: boolean;
  explanation: string;
}

export interface EvaluationTrace {
  finalResult: boolean;
  steps: EvaluationStep[];
  subexpressionResults: Record<string, boolean>;
}

export interface TruthTableRow {
  rowIndex: number;
  assignments: Record<string, boolean>;
  intermediateValues: Record<string, boolean>;
  result: boolean;
}

export type ExpressionClassification = 'Tautology' | 'Contradiction' | 'Contingency';

export interface TruthTableResult {
  expression: string;
  canonicalExpression: string;
  variables: string[];
  intermediateExpressions: string[];
  rows: TruthTableRow[];
  totalRows: number;
  trueCount: number;
  falseCount: number;
  classification: ExpressionClassification;
  classificationExplanation: string;
  ast: ASTNode;
}

export interface ParseError {
  message: string;
  position?: number;
}

export interface EquivalenceRow {
  rowIndex: number;
  assignments: Record<string, boolean>;
  resultA: boolean;
  resultB: boolean;
  isEquivalent: boolean;
  diffReason?: string;
}

export interface EquivalenceComparison {
  expressionA: string;
  expressionB: string;
  astA: ASTNode;
  astB: ASTNode;
  variablesA: string[];
  variablesB: string[];
  allVariables: string[];
  hasDifferentVariableSets: boolean;
  rows: EquivalenceRow[];
  totalRows: number;
  matchingRowsCount: number;
  differingRowsCount: number;
  isLogicallyEquivalent: boolean;
  tableA: TruthTableResult;
  tableB: TruthTableResult;
  classificationA: ExpressionClassification;
  classificationB: ExpressionClassification;
  explanation: string;
  differingRowIndices: number[];
}
