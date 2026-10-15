/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Cpu, GraduationCap, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 md:p-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#176B52] dark:bg-[#2CA782] flex items-center justify-center text-white font-mono font-bold text-2xl shadow-xs mb-4">
          ⊨
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#183B32] dark:text-[#E6EFEA] tracking-tight">
          About TruthLab — Propositional Logic Workbench
        </h2>
        <p className="text-[#2B3833] dark:text-[#D4E2DC] text-sm md:text-base mt-2 leading-relaxed">
          TruthLab was designed for college Mathematics and Computer Science courses covering discrete
          structures, symbolic logic, proof theory, and Boolean algebra. It provides deterministic,
          unambiguous evaluation of propositional expressions with row-by-row step explanations.
        </p>
      </div>

      {/* Engineering & Mathematical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782] mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#183B32] dark:text-[#E6EFEA] text-base">Accurate Calculations</h3>
          <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-2 leading-relaxed">
            Every truth value is calculated using logical rules to provide consistent and reliable results.
          </p>
        </div>

        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782] mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#183B32] dark:text-[#E6EFEA] text-base">Mathematical Accuracy</h3>
          <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-2 leading-relaxed">
            The app evaluates all possible truth-value combinations according to the rules of propositional logic.
          </p>
        </div>

        <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-5 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#EAF1E8] dark:bg-[#1A312A] border border-[#D8DFD5] dark:border-[#263C34] flex items-center justify-center text-[#176B52] dark:text-[#2CA782] mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#183B32] dark:text-[#E6EFEA] text-base">Easy to Understand</h3>
          <p className="text-xs text-[#5A6862] dark:text-[#8FA69D] mt-2 leading-relaxed">
            Clear truth tables and explanations help students understand why a result is true or false.
          </p>
        </div>
      </div>

      {/* College Mathematics Learning Checklist */}
      <div className="bg-white dark:bg-[#14221E] border border-[#D8DFD5] dark:border-[#263C34] rounded-xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-[#183B32] dark:text-[#E6EFEA] mb-3">
          Topics Covered in Discrete Mathematics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2B3833] dark:text-[#D4E2DC]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>Connectives: Negation, Conjunction, Disjunction, XOR</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>Conditional statements & Contrapositive equivalence</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>Tautologies, Contradictions, and Contingencies</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>De Morgan's Laws & Distributive equivalences</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>Modus Ponens & Modus Tollens valid argument forms</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#176B52] dark:text-[#2CA782] shrink-0" />
            <span>Subexpression evaluation trees and truth table exports</span>
          </div>
        </div>
      </div>
    </div>
  );
};
