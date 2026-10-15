/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Token, TokenType, ASTNode } from './types';
import { Tokenizer } from './tokenizer';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): ASTNode {
    if (this.isAtEnd()) {
      throw new Error('Expression is empty. Please enter a logical proposition (e.g., P ∧ Q).');
    }

    const ast = this.parseBiconditional();

    if (!this.isAtEnd()) {
      const remaining = this.peek();
      throw new Error(
        `Unexpected token '${remaining.value}' at character ${remaining.position + 1}. Check operator syntax or missing parentheses.`
      );
    }

    return ast;
  }

  // Precedence 7 (Lowest): Biconditional (↔)
  private parseBiconditional(): ASTNode {
    let expr = this.parseImplication();

    while (this.match('IFF')) {
      const right = this.parseImplication();
      expr = {
        type: 'binary',
        operator: 'IFF',
        left: expr,
        right,
        raw: `(${expr.raw} ↔ ${right.raw})`,
      };
    }

    return expr;
  }

  // Precedence 6: Implication (→) - RIGHT-ASSOCIATIVE
  // e.g. P → Q → R is parsed as P → (Q → R)
  private parseImplication(): ASTNode {
    const expr = this.parseOr();

    if (this.match('IMPLIES')) {
      // Recursively call parseImplication on the right to preserve right-associativity
      const right = this.parseImplication();
      return {
        type: 'binary',
        operator: 'IMPLIES',
        left: expr,
        right,
        raw: `(${expr.raw} → ${right.raw})`,
      };
    }

    return expr;
  }

  // Precedence 5: OR (∨)
  private parseOr(): ASTNode {
    let expr = this.parseXor();

    while (this.match('OR')) {
      const right = this.parseXor();
      expr = {
        type: 'binary',
        operator: 'OR',
        left: expr,
        right,
        raw: `(${expr.raw} ∨ ${right.raw})`,
      };
    }

    return expr;
  }

  // Precedence 4: XOR (⊕)
  private parseXor(): ASTNode {
    let expr = this.parseAnd();

    while (this.match('XOR')) {
      const right = this.parseAnd();
      expr = {
        type: 'binary',
        operator: 'XOR',
        left: expr,
        right,
        raw: `(${expr.raw} ⊕ ${right.raw})`,
      };
    }

    return expr;
  }

  // Precedence 3: AND (∧)
  private parseAnd(): ASTNode {
    let expr = this.parseNot();

    while (this.match('AND')) {
      const right = this.parseNot();
      expr = {
        type: 'binary',
        operator: 'AND',
        left: expr,
        right,
        raw: `(${expr.raw} ∧ ${right.raw})`,
      };
    }

    return expr;
  }

  // Precedence 2: NOT (¬) - Unary prefix
  private parseNot(): ASTNode {
    if (this.match('NOT')) {
      const operand = this.parseNot(); // Right-associative unary prefix (¬¬P = ¬(¬P))
      return {
        type: 'unary',
        operator: 'NOT',
        operand,
        raw: `¬${operand.raw}`,
      };
    }

    return this.parsePrimary();
  }

  // Precedence 1 (Highest): Primary (Variables, Constants, Parentheses)
  private parsePrimary(): ASTNode {
    if (this.match('VAR')) {
      const token = this.previous();
      return {
        type: 'variable',
        name: token.value,
        raw: token.value,
      };
    }

    if (this.match('CONST')) {
      const token = this.previous();
      const val = token.value === 'TRUE';
      return {
        type: 'constant',
        value: val,
        raw: val ? '⊤' : '⊥',
      };
    }

    if (this.match('LPAREN')) {
      const lParenToken = this.previous();
      const expr = this.parseBiconditional();

      if (!this.match('RPAREN')) {
        throw new Error(
          `Missing closing parenthesis ')' matching opening '${lParenToken.value}' at position ${lParenToken.position + 1}.`
        );
      }

      return {
        ...expr,
        raw: `(${stripOuterParens(expr.raw)})`,
      };
    }

    const token = this.peek();
    if (token.type === 'EOF') {
      throw new Error(`Unexpected end of expression. Expected a proposition variable, negation, or '('.`);
    }

    throw new Error(
      `Unexpected token '${token.value}' at position ${token.position + 1}. Expected a variable (P, Q), constant, or '('.`
    );
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', position: 0 };
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

/**
 * Removes redundant outer parentheses if they wrap the entire string.
 */
function stripOuterParens(str: string): string {
  if (str.startsWith('(') && str.endsWith(')')) {
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') depth--;
      if (depth === 0 && i < str.length - 1) {
        return str; // Closed before end
      }
    }
    return str.slice(1, -1);
  }
  return str;
}

export function parseLogicalExpression(input: string): ASTNode {
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
