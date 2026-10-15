/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExpressionEditor } from './components/ExpressionEditor';
import { StatsCards } from './components/StatsCards';
import { TruthTableView } from './components/TruthTableView';
import { StepExplanation } from './components/StepExplanation';
import { LogicWorkbench } from './components/LogicWorkbench';
import { LearnLogic } from './components/LearnLogic';
import { TestSuiteView } from './components/TestSuiteView';
import { AboutSection } from './components/AboutSection';
import { generateTruthTable } from './logic/truthTable';
import { TruthTableResult } from './logic/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'workbench' | 'learn' | 'tests' | 'about'>('generator');
  // Default to Paper & Emerald light academic theme
  const [isDark, setIsDark] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('(P ∧ Q) → R');
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [truthTableResult, setTruthTableResult] = useState<TruthTableResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(1);

  // Sync theme with document class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Generate initial truth table on mount
  useEffect(() => {
    executeGeneration('(P ∧ Q) → R');
  }, []);

  const executeGeneration = (formulaToEvaluate?: string) => {
    const target = formulaToEvaluate !== undefined ? formulaToEvaluate : expression;
    if (!target.trim()) {
      setErrorMessage('Please enter a logical expression.');
      setTruthTableResult(null);
      return;
    }

    try {
      const result = generateTruthTable(target);
      setTruthTableResult(result);
      setErrorMessage(null);
      setSelectedRowIndex(1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Syntax error while evaluating expression.');
      setTruthTableResult(null);
    }
  };

  const handleGenerate = () => {
    executeGeneration();
  };

  const handleClear = () => {
    setExpression('');
    setTruthTableResult(null);
    setErrorMessage(null);
    setSelectedRowIndex(null);
    setSelectedExample('');
  };

  const [workbenchExprA, setWorkbenchExprA] = useState<string>('P → Q');
  const [workbenchExprB, setWorkbenchExprB] = useState<string>('¬P ∨ Q');

  const handleSelectExample = (formula: string) => {
    setExpression(formula);
    setSelectedExample(formula);
    executeGeneration(formula);
  };

  const handleLoadFormulaFromOtherTab = (formula: string) => {
    if (formula.includes('≡') || formula.includes('≢')) {
      const parts = formula.split(/[≡≢]/).map((s) => s.trim());
      if (parts.length >= 2) {
        setWorkbenchExprA(parts[0]);
        setWorkbenchExprB(parts[1]);
        setActiveTab('workbench');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setExpression(formula);
    setSelectedExample(formula);
    setActiveTab('generator');
    executeGeneration(formula);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 w-full max-w-full overflow-x-clip ${
        isDark
          ? 'bg-[#0D1714] text-[#D4E2DC]'
          : 'bg-[#F7F5EF] text-[#2B3833]'
      }`}
    >
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1560px] min-w-0 mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-6 md:py-8">
        {activeTab === 'generator' && (
          <div className="space-y-6 min-w-0 w-full max-w-full">
            {/* Expression Editor Section */}
            <ExpressionEditor
              expression={expression}
              setExpression={setExpression}
              onGenerate={handleGenerate}
              onClear={handleClear}
              errorMessage={errorMessage}
              selectedExample={selectedExample}
              onSelectExample={handleSelectExample}
            />

            {/* When Result is Available */}
            {truthTableResult && (
              <>
                {/* Summary Metrics & Classification */}
                <StatsCards result={truthTableResult} />

                {/* Interactive Truth Table */}
                <TruthTableView
                  result={truthTableResult}
                  selectedRowIndex={selectedRowIndex}
                  onSelectRow={(idx) => setSelectedRowIndex(idx)}
                />

                {/* Step-by-Step Explanation for Selected Row */}
                {selectedRowIndex !== null && (
                  <StepExplanation
                    result={truthTableResult}
                    selectedRowIndex={selectedRowIndex}
                    onSelectRow={(idx) => setSelectedRowIndex(idx)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'workbench' && (
          <LogicWorkbench
            initialExprA={workbenchExprA}
            initialExprB={workbenchExprB}
            onReturnToGenerator={() => setActiveTab('generator')}
            onLoadSingleFormulaToGenerator={handleLoadFormulaFromOtherTab}
          />
        )}

        {activeTab === 'learn' && (
          <LearnLogic onLoadFormula={handleLoadFormulaFromOtherTab} />
        )}

        {activeTab === 'tests' && (
          <TestSuiteView onLoadFormula={handleLoadFormulaFromOtherTab} />
        )}

        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* Quiet Academic Footer */}
      <footer className="border-t border-[#D8DFD5] dark:border-[#263C34] bg-[#F0EEE6] dark:bg-[#121F1B] py-6 text-xs text-[#5A6862] dark:text-[#8FA69D] no-print">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#183B32] dark:text-[#E6EFEA]">TruthLab</span>
            <span aria-hidden="true">·</span>
            <span>Propositional Logic Activity & Workbench</span>
            <span aria-hidden="true">·</span>
            <span>College Mathematics</span>
          </div>

          <div className="flex items-center gap-4 text-[#5A6862] dark:text-[#8FA69D]">
            <button
              onClick={() => setActiveTab('generator')}
              className="hover:text-[#183B32] dark:hover:text-[#E6EFEA] transition-colors"
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('workbench')}
              className="hover:text-[#183B32] dark:hover:text-[#E6EFEA] transition-colors font-medium text-[#176B52] dark:text-[#2CA782]"
            >
              Workbench
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="hover:text-[#183B32] dark:hover:text-[#E6EFEA] transition-colors"
            >
              Connectives Guide
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className="hover:text-[#183B32] dark:hover:text-[#E6EFEA] transition-colors"
            >
              Test Suite
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-[#183B32] dark:hover:text-[#E6EFEA] transition-colors"
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
