/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sun, Moon, BookOpen, CheckCircle2, Info, Table2, ArrowRightLeft, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'workbench' | 'learn' | 'tests' | 'about';
  setActiveTab: (tab: 'generator' | 'workbench' | 'learn' | 'tests' | 'about') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleSelectTab = (tab: 'generator' | 'workbench' | 'learn' | 'tests' | 'about') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full border-b border-[#D8DFD5] dark:border-[#263C34] bg-white/95 dark:bg-[#14221E]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element Brand wordmark with permanent static logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-[#176B52] dark:bg-[#2CA782] shadow-xs shrink-0 select-none">
            <img
              src="/logo.svg"
              alt="TruthLab Logo"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
          <button
            onClick={() => handleSelectTab('generator')}
            className="text-left text-lg font-bold tracking-tight text-[#183B32] dark:text-[#E6EFEA] hover:text-[#176B52] dark:hover:text-[#2CA782] transition-colors whitespace-nowrap shrink-0"
          >
            TruthLab
          </button>
        </div>

        {/* Zone 2: Desktop clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => handleSelectTab('generator')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'border-[#176B52] text-[#176B52] dark:border-[#2CA782] dark:text-[#2CA782] font-semibold'
                : 'border-transparent text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <Table2 className="w-4 h-4" />
            Generator
          </button>
          <button
            onClick={() => handleSelectTab('workbench')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'workbench'
                ? 'border-[#176B52] text-[#176B52] dark:border-[#2CA782] dark:text-[#2CA782] font-semibold'
                : 'border-transparent text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Workbench
          </button>
          <button
            onClick={() => handleSelectTab('learn')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'learn'
                ? 'border-[#176B52] text-[#176B52] dark:border-[#2CA782] dark:text-[#2CA782] font-semibold'
                : 'border-transparent text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Learn Logic
          </button>
          <button
            onClick={() => handleSelectTab('tests')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'border-[#176B52] text-[#176B52] dark:border-[#2CA782] dark:text-[#2CA782] font-semibold'
                : 'border-transparent text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Test Suite
          </button>
          <button
            onClick={() => handleSelectTab('about')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'border-[#176B52] text-[#176B52] dark:border-[#2CA782] dark:text-[#2CA782] font-semibold'
                : 'border-transparent text-[#5A6862] dark:text-[#8FA69D] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <Info className="w-4 h-4" />
            About
          </button>
        </nav>

        {/* Zone 3: Actions - Theme toggle and Mobile Hamburger button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg border border-[#D8DFD5] dark:border-[#263C34] hover:border-[#176B52] dark:hover:border-[#2CA782] bg-[#F7F5EF] dark:bg-[#1A312A] text-[#2B3833] dark:text-[#D4E2DC] transition-colors"
            title={isDark ? 'Switch to Paper & Emerald mode' : 'Switch to Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 rounded-lg border border-[#D8DFD5] dark:border-[#263C34] hover:border-[#176B52] dark:hover:border-[#2CA782] bg-[#F7F5EF] dark:bg-[#1A312A] text-[#2B3833] dark:text-[#D4E2DC] transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#176B52] dark:text-[#2CA782]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#D8DFD5] dark:border-[#263C34] bg-white dark:bg-[#14221E] px-4 py-3 shadow-lg space-y-1 transition-all"
        >
          <button
            onClick={() => handleSelectTab('generator')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'generator'
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] font-semibold'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:bg-[#F7F5EF] dark:hover:bg-[#1D2F28] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <Table2 className="w-4 h-4 shrink-0" />
            <span>Generator</span>
          </button>

          <button
            onClick={() => handleSelectTab('workbench')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'workbench'
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] font-semibold'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:bg-[#F7F5EF] dark:hover:bg-[#1D2F28] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <span>Workbench</span>
          </button>

          <button
            onClick={() => handleSelectTab('learn')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'learn'
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] font-semibold'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:bg-[#F7F5EF] dark:hover:bg-[#1D2F28] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Learn Logic</span>
          </button>

          <button
            onClick={() => handleSelectTab('tests')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'tests'
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] font-semibold'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:bg-[#F7F5EF] dark:hover:bg-[#1D2F28] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Test Suite</span>
          </button>

          <button
            onClick={() => handleSelectTab('about')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'about'
                ? 'bg-[#EAF1E8] dark:bg-[#1A312A] text-[#176B52] dark:text-[#2CA782] font-semibold'
                : 'text-[#5A6862] dark:text-[#8FA69D] hover:bg-[#F7F5EF] dark:hover:bg-[#1D2F28] hover:text-[#183B32] dark:hover:text-[#E6EFEA]'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>About</span>
          </button>
        </nav>
      )}
    </header>
  );
};
