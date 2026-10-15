/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, EvaluationStep, EvaluationTrace } from './types';

export function formatBool(val: boolean, style: 'TF' | 'TrueFalse' | '10' = 'TF'): string {
  switch (style) {
    case 'TrueFalse':
      return val ? 'True' : 'False';
    case '10':
      return val ? '1' : '0';
    case 'TF':
    default:
      return val ? 'T' : 'F';
  }
}

export class Evaluator {
  private assignments: Record<string, boolean>;
  private steps: EvaluationStep[] = [];
  private subexpressionResults: Record<string, boolean> = {};
  private stepCounter = 1;

  constructor(assignments: Record<string, boolean>) {
    this.assignments = assignments;
  }

  public evaluateWithTrace(node: ASTNode): EvaluationTrace {
    this.steps = [];
    this.subexpressionResults = {};
    this.stepCounter = 1;

    const finalResult = this.traverse(node);

    return {
      finalResult,
      steps: this.steps,
      subexpressionResults: this.subexpressionResults,
    };
  }

  private traverse(node: ASTNode): boolean {
    if (node.type === 'variable') {
      const val = this.assignments[node.name] ?? false;
      this.subexpressionResults[node.raw] = val;
      return val;
    }

    if (node.type === 'constant') {
      this.subexpressionResults[node.raw] = node.value;
      return node.value;
    }

    if (node.type === 'unary') {
      const operandVal = this.traverse(node.operand);
      const result = !operandVal;
      const subExpr = node.raw;

      const operandStr = formatBool(operandVal, 'TF');
      const resultStr = formatBool(result, 'TF');

      const explanation = `Negation (¬): The operand ${node.operand.raw} is ${operandStr}, inverted by ¬ to ${resultStr}.`;

      this.steps.push({
        id: `step-${this.stepCounter++}`,
        subexpression: subExpr,
        operator: '¬',
        operands: [{ name: node.operand.raw, value: operandVal }],
        result,
        explanation,
      });

      this.subexpressionResults[subExpr] = result;
      return result;
    }

    if (node.type === 'binary') {
      const leftVal = this.traverse(node.left);
      const rightVal = this.traverse(node.right);

      let result: boolean;
      let opSymbol = '';
      let explanation = '';

      const lStr = formatBool(leftVal, 'TF');
      const rStr = formatBool(rightVal, 'TF');

      switch (node.operator) {
        case 'AND':
          opSymbol = '∧';
          result = leftVal && rightVal;
          if (leftVal && rightVal) {
            explanation = `Conjunction (∧): Both ${node.left.raw} (${lStr}) and ${node.right.raw} (${rStr}) are True, so the conjunction evaluates to True.`;
          } else if (!leftVal && !rightVal) {
            explanation = `Conjunction (∧): Both operands are False, so the conjunction evaluates to False.`;
          } else {
            const falseSide = !leftVal ? node.left.raw : node.right.raw;
            explanation = `Conjunction (∧): ${falseSide} is False, which forces the conjunction to False.`;
          }
          break;

        case 'OR':
          opSymbol = '∨';
          result = leftVal || rightVal;
          if (leftVal || rightVal) {
            const trueSides = [
              leftVal ? `${node.left.raw} (${lStr})` : null,
              rightVal ? `${node.right.raw} (${rStr})` : null,
            ]
              .filter(Boolean)
              .join(' and ');
            explanation = `Disjunction (∨): At least one operand (${trueSides}) is True, so the disjunction evaluates to True.`;
          } else {
            explanation = `Disjunction (∨): Neither operand is True (both are False), so the disjunction evaluates to False.`;
          }
          break;

        case 'XOR':
          opSymbol = '⊕';
          result = leftVal !== rightVal;
          if (result) {
            explanation = `Exclusive OR (⊕): Operands have differing truth values (${node.left.raw} is ${lStr}, ${node.right.raw} is ${rStr}), so XOR evaluates to True.`;
          } else {
            explanation = `Exclusive OR (⊕): Both operands have identical truth values (${lStr}), so XOR evaluates to False.`;
          }
          break;

        case 'IMPLIES':
          opSymbol = '→';
          // Implication is false ONLY when Antecedent is True and Consequent is False
          result = !leftVal || rightVal;
          if (leftVal && !rightVal) {
            explanation = `Implication (→): Antecedent ${node.left.raw} is True and Consequent ${node.right.raw} is False. This is the only falsifying condition for implication. Result: False.`;
          } else if (!leftVal) {
            explanation = `Implication (→): Antecedent ${node.left.raw} is False. An implication with a false premise is vacuously True regardless of consequent. Result: True.`;
          } else {
            explanation = `Implication (→): Antecedent ${node.left.raw} is True and Consequent ${node.right.raw} is True. Result: True.`;
          }
          break;

        case 'IFF':
          opSymbol = '↔';
          result = leftVal === rightVal;
          if (result) {
            explanation = `Biconditional (↔): Both sides share identical truth values (${lStr}), so the equivalence holds. Result: True.`;
          } else {
            explanation = `Biconditional (↔): Sides disagree (${node.left.raw} is ${lStr}, ${node.right.raw} is ${rStr}), so the equivalence fails. Result: False.`;
          }
          break;
      }

      const subExpr = node.raw;
      this.steps.push({
        id: `step-${this.stepCounter++}`,
        subexpression: subExpr,
        operator: opSymbol,
        operands: [
          { name: node.left.raw, value: leftVal },
          { name: node.right.raw, value: rightVal },
        ],
        result,
        explanation,
      });

      this.subexpressionResults[subExpr] = result;
      return result;
    }

    return false;
  }
}

export function evaluateExpression(
  node: ASTNode,
  assignments: Record<string, boolean>
): EvaluationTrace {
  const evaluator = new Evaluator(assignments);
  return evaluator.evaluateWithTrace(node);
}
