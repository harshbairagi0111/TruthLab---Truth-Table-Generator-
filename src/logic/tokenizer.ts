/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Token, TokenType } from './types';

export class Tokenizer {
  private input: string;
  private cursor: number = 0;
  private length: number;

  constructor(input: string) {
    this.input = input;
    this.length = input.length;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.cursor < this.length) {
      const char = this.input[this.cursor];

      // Skip whitespaces
      if (/\s/.test(char)) {
        this.cursor++;
        continue;
      }

      const startPos = this.cursor;

      // Parentheses & Brackets
      if (char === '(' || char === '[' || char === '{') {
        tokens.push({ type: 'LPAREN', value: char, position: startPos });
        this.cursor++;
        continue;
      }
      if (char === ')' || char === ']' || char === '}') {
        tokens.push({ type: 'RPAREN', value: char, position: startPos });
        this.cursor++;
        continue;
      }

      // Unicode & Multi-character Operators
      // Biconditional: ↔, <->, <=>, ⇔
      if (
        char === '↔' ||
        char === '⇔' ||
        this.matchString('<->') ||
        this.matchString('<=>')
      ) {
        const len = (char === '↔' || char === '⇔') ? 1 : 3;
        tokens.push({ type: 'IFF', value: '↔', position: startPos });
        this.cursor += len;
        continue;
      }

      // Implication: →, ->, =>, ⇒
      if (
        char === '→' ||
        char === '⇒' ||
        this.matchString('->') ||
        this.matchString('=>')
      ) {
        const len = (char === '→' || char === '⇒') ? 1 : 2;
        tokens.push({ type: 'IMPLIES', value: '→', position: startPos });
        this.cursor += len;
        continue;
      }

      // NOT: ¬, !, ~
      if (char === '¬' || char === '!' || char === '~') {
        tokens.push({ type: 'NOT', value: '¬', position: startPos });
        this.cursor++;
        continue;
      }

      // AND: ∧, &&, &
      if (char === '∧' || this.matchString('&&') || (char === '&' && !this.matchString('&&'))) {
        const len = this.matchString('&&') ? 2 : 1;
        tokens.push({ type: 'AND', value: '∧', position: startPos });
        this.cursor += len;
        continue;
      }

      // OR: ∨, ||, |
      if (char === '∨' || this.matchString('||') || (char === '|' && !this.matchString('||'))) {
        const len = this.matchString('||') ? 2 : 1;
        tokens.push({ type: 'OR', value: '∨', position: startPos });
        this.cursor += len;
        continue;
      }

      // XOR: ⊕, ⊻
      if (char === '⊕' || char === '⊻') {
        tokens.push({ type: 'XOR', value: '⊕', position: startPos });
        this.cursor++;
        continue;
      }

      // Constants: ⊤ (True), ⊥ (False)
      if (char === '⊤') {
        tokens.push({ type: 'CONST', value: 'TRUE', position: startPos });
        this.cursor++;
        continue;
      }
      if (char === '⊥') {
        tokens.push({ type: 'CONST', value: 'FALSE', position: startPos });
        this.cursor++;
        continue;
      }

      // Word-based tokens: NOT, AND, OR, XOR, IMPLIES, IFF, TRUE, FALSE
      if (/[a-zA-Z0-9_]/.test(char)) {
        let word = '';
        while (this.cursor < this.length && /[a-zA-Z0-9_]/.test(this.input[this.cursor])) {
          word += this.input[this.cursor];
          this.cursor++;
        }

        const upper = word.toUpperCase();

        if (upper === 'NOT') {
          tokens.push({ type: 'NOT', value: '¬', position: startPos });
        } else if (upper === 'AND') {
          tokens.push({ type: 'AND', value: '∧', position: startPos });
        } else if (upper === 'OR') {
          tokens.push({ type: 'OR', value: '∨', position: startPos });
        } else if (upper === 'XOR') {
          tokens.push({ type: 'XOR', value: '⊕', position: startPos });
        } else if (upper === 'IMPLIES' || upper === 'THEN') {
          tokens.push({ type: 'IMPLIES', value: '→', position: startPos });
        } else if (upper === 'IFF' || upper === 'XNOR' || upper === 'EQUIV') {
          tokens.push({ type: 'IFF', value: '↔', position: startPos });
        } else if (upper === 'TRUE') {
          tokens.push({ type: 'CONST', value: 'TRUE', position: startPos });
        } else if (upper === 'FALSE') {
          tokens.push({ type: 'CONST', value: 'FALSE', position: startPos });
        } else {
          // If word is multiple single letters without spaces e.g. "PQ", in propositional logic
          // someone might write "P" or "P1", or if single letter like "P", "Q", "R", "S"
          // If it's a single letter or letter with digit like P1, treat as variable
          // To be helpful, if someone types "P Q" it's 2 tokens. If someone types "P", it's 1 token.
          // If someone types "PQ", let's treat it as variable "PQ" or if single letter:
          tokens.push({ type: 'VAR', value: upper, position: startPos });
        }
        continue;
      }

      // Unknown character error
      throw new Error(
        `Unrecognized character '${char}' at position ${startPos + 1}. Please use standard propositional logic operators (¬, ∧, ∨, ⊕, →, ↔) or words (NOT, AND, OR, XOR, IMPLIES, IFF).`
      );
    }

    tokens.push({ type: 'EOF', value: '', position: this.cursor });
    return tokens;
  }

  private matchString(expected: string): boolean {
    return this.input.startsWith(expected, this.cursor);
  }
}
