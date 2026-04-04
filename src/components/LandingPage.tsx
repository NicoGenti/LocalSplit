import React from 'react';
import {
  Wallet,
  Shield,
  Zap,
  SplitSquareHorizontal,
  Globe,
  Moon,
  Sun,
  ArrowRight,
  Users,
  Receipt,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from '../i18n/index';

interface LandingPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onEnterApp: () => void;
}

function FeatureCard({
  icon,
  title,
  desc,
  iconBgClass,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  iconBgClass: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBgClass}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  desc,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center flex-1">
      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md">
        {number}
      </div>
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[180px]">{desc}</p>
    </div>
  );
}

export function LandingPage({ isDarkMode, onToggleDarkMode, onEnterApp }: LandingPageProps) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 font-sans">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">

        {/* Top bar */}
        <div className="flex items-center justify-end gap-3 px-5 pt-5">
          <button
            onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
            className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            aria-label="Change language"
          >
            {language === 'it' ? 'EN' : 'IT'}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Toggle dark mode"
          >
            <span
              className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-flex h-4 w-4 transform rounded-full bg-white transition-transform items-center justify-center shadow-sm`}
            >
              {isDarkMode
                ? <Moon size={10} className="text-blue-700" />
                : <Sun size={10} className="text-yellow-500" />}
            </span>
          </button>
        </div>

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-24 pt-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
              <Wallet size={34} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">LocalSplit</span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white whitespace-pre-line leading-tight mb-6 drop-shadow-sm">
            {t('landing.tagline')}
          </h1>

          {/* Sub-tagline */}
          <p className="text-white/75 text-lg sm:text-xl max-w-md leading-relaxed mb-10">
            {t('landing.subtagline')}
          </p>

          {/* CTA button */}
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/40"
          >
            {t('landing.cta')}
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce pointer-events-none">
          <ChevronDown size={22} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-white dark:bg-gray-900 px-6 transition-colors duration-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-3">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-center text-gray-400 dark:text-gray-500 mb-12 text-sm">LocalSplit</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Shield size={22} />}
              title={t('landing.feature1Title')}
              desc={t('landing.feature1Desc')}
              iconBgClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            />
            <FeatureCard
              icon={<Zap size={22} />}
              title={t('landing.feature2Title')}
              desc={t('landing.feature2Desc')}
              iconBgClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            />
            <FeatureCard
              icon={<SplitSquareHorizontal size={22} />}
              title={t('landing.feature3Title')}
              desc={t('landing.feature3Desc')}
              iconBgClass="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            />
            <FeatureCard
              icon={<Globe size={22} />}
              title={t('landing.feature4Title')}
              desc={t('landing.feature4Desc')}
              iconBgClass="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50 px-6 transition-colors duration-200">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
            {t('landing.howTitle')}
          </h2>

          <div className="flex flex-col sm:flex-row gap-10 sm:gap-4 items-center sm:items-start">
            <StepCard
              number={1}
              icon={<Users size={20} />}
              title={t('landing.step1Title')}
              desc={t('landing.step1Desc')}
            />

            {/* Connector */}
            <div className="hidden sm:flex items-start pt-7 shrink-0">
              <div className="w-12 h-px bg-blue-200 dark:bg-blue-800 mt-7" />
            </div>

            <StepCard
              number={2}
              icon={<Receipt size={20} />}
              title={t('landing.step2Title')}
              desc={t('landing.step2Desc')}
            />

            {/* Connector */}
            <div className="hidden sm:flex items-start pt-7 shrink-0">
              <div className="w-12 h-px bg-blue-200 dark:bg-blue-800 mt-7" />
            </div>

            <StepCard
              number={3}
              icon={<TrendingDown size={20} />}
              title={t('landing.step3Title')}
              desc={t('landing.step3Desc')}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
          {language === 'it' ? 'Pronto a iniziare?' : 'Ready to get started?'}
        </h2>
        <p className="text-white/70 mb-8 max-w-sm mx-auto">
          {language === 'it' ? 'Nessuna registrazione. Funziona subito.' : 'No sign-up. Works instantly.'}
        </p>
        <button
          onClick={onEnterApp}
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/40"
        >
          {t('landing.cta')}
          <ArrowRight size={20} />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 bg-gray-900 dark:bg-gray-950 px-6 transition-colors duration-200">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">LocalSplit</span>
          </div>

          {/* Open source badge */}
          <span className="text-xs font-medium text-gray-400 bg-gray-800 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
            {t('landing.openSource')}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-1">
            <button
              onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              aria-label="Change language"
            >
              {language === 'it' ? 'EN' : 'IT'}
            </button>
            <button
              onClick={onToggleDarkMode}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode"
            >
              <span
                className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-flex h-4 w-4 transform rounded-full bg-white transition-transform items-center justify-center shadow-sm`}
              >
                {isDarkMode
                  ? <Moon size={10} className="text-gray-800" />
                  : <Sun size={10} className="text-yellow-500" />}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
