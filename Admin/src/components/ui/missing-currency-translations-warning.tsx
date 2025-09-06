import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Languages, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  CheckCircle2,
  X,
  Coins
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

interface MissingCurrencyTranslationsWarningProps {
  missingCount: number;
  onApplyTranslations?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const MissingCurrencyTranslationsWarning: React.FC<MissingCurrencyTranslationsWarningProps> = ({
  missingCount,
  onApplyTranslations,
  onDismiss,
  className = "",
}) => {
  const { isRTL } = useDirection();

  if (missingCount < 1) return null;

  return (
    <Alert 
      className={`
        relative border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 
        dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800
        shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl
        rounded-xl p-4 sm:p-6 overflow-hidden
        ${className}
      `}
    >
      {/* Warning Icon */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        {/* Icon and Title Row */}
        <div className="flex items-start gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex-shrink-0 mt-0.5 sm:mt-1">
            <div className="relative">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded-full animate-ping" />
            </div>
          </div>

          {/* Title and Badge - Mobile Layout */}
          <div className="flex-1 sm:hidden">
            <div className="flex items-center justify-between gap-3 mb-2">
              <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold text-base sm:text-lg flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {isRTL ? 'ترجمات العملات مفقودة' : 'Missing Currency Translations'}
              </AlertTitle>
              <Badge 
                variant="secondary" 
                className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 font-medium px-2 py-1 text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                {missingCount}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
          {/* Title - Desktop Layout */}
          <div className="hidden sm:block space-y-2">
            <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold text-base sm:text-lg flex items-center gap-2">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
              {isRTL ? 'ترجمات العملات مفقودة' : 'Missing Currency Translations'}
            </AlertTitle>
          </div>

          {/* Description */}
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm sm:text-base leading-relaxed">
            {isRTL 
              ? `يوجد ${missingCount} عملة${missingCount > 1 ? ' عملات' : ''} تحتاج إلى ترجمات. قم بإضافة الترجمات المفقودة لتحسين تجربة المستخدم متعدد اللغات.`
              : `There ${missingCount === 1 ? 'is' : 'are'} ${missingCount} currency${missingCount === 1 ? '' : 'ies'} missing translations. Add missing translations to improve multilingual user experience.`
            }
          </AlertDescription>

          {/* Stats and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
            {/* Stats - Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 font-medium px-3 py-1.5"
              >
                <Globe className="h-3 w-3 mr-1" />
                {missingCount} {isRTL ? 'عملة' : 'currencies'}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3 w-3" />
                {isRTL ? 'تحتاج ترجمة' : 'Need translation'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              {/* Additional info for mobile */}
              <div className="sm:hidden flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3 w-3" />
                {isRTL ? 'تحتاج ترجمة' : 'Need translation'}
              </div>

              <div className="flex items-center gap-2">
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {onApplyTranslations && (
                  <Button
                    onClick={onApplyTranslations}
                    size="sm"
                    className="
                      bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                      text-white shadow-md hover:shadow-lg transition-all duration-200
                      border-0 font-medium px-3 py-2 sm:px-4 text-xs sm:text-sm h-8 sm:h-9
                      min-w-0 flex-shrink-0
                    "
                  >
                    <Languages className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
                    <span className="hidden xs:inline">
                      {isRTL ? 'إضافة الترجمات' : 'Apply Translations'}
                    </span>
                    <span className="xs:hidden">
                      {isRTL ? 'إضافة' : 'Apply'}
                    </span>
                    {isRTL ? (
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    ) : (
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Responsive */}
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12 pointer-events-none" />
    </Alert>
  );
};

export default MissingCurrencyTranslationsWarning;
