import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Store,
  Bell,
  Shield,
  Palette,
  CreditCard
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useTheme } from '@/contexts/ThemeContext';

// Import types for TypeScript
type ColorTheme = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' | 'neutral' | 'stone';
type FontTheme = 'inter' | 'roboto' | 'poppins' | 'system' | 'nunito' | 'source-sans' | 'work-sans' | 'dosis' | 'outfit' | 'space-grotesk' | 'amiri' | 'cairo' | 'tajawal' | 'almarai' | 'noto-sans-arabic' | 'scheherazade' | 'markazi-text' | 'reem-kufi' | 'changa' | 'ibm-plex-sans-arabic';

const Settings: React.FC = () => {
  const { isRTL } = useDirection();
  const { theme, colorTheme, fontTheme, setTheme, setColorTheme, setFontTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailCustomers: false,
    smsOrders: true,
    pushNotifications: true,
  });

  const colorThemes = [
    { id: 'blue', name: isRTL ? 'أزرق' : 'Blue', color: 'hsl(262, 83%, 58%)', category: 'vibrant' },
    { id: 'purple', name: isRTL ? 'بنفسجي' : 'Purple', color: 'hsl(280, 89%, 60%)', category: 'vibrant' },
    { id: 'indigo', name: isRTL ? 'نيلي' : 'Indigo', color: 'hsl(239, 84%, 67%)', category: 'vibrant' },
    { id: 'cyan', name: isRTL ? 'سماوي' : 'Cyan', color: 'hsl(188, 94%, 43%)', category: 'vibrant' },
    { id: 'green', name: isRTL ? 'أخضر' : 'Green', color: 'hsl(142, 76%, 36%)', category: 'nature' },
    { id: 'emerald', name: isRTL ? 'زمردي' : 'Emerald', color: 'hsl(160, 84%, 39%)', category: 'nature' },
    { id: 'orange', name: isRTL ? 'برتقالي' : 'Orange', color: 'hsl(25, 95%, 53%)', category: 'warm' },
    { id: 'amber', name: isRTL ? 'كهرماني' : 'Amber', color: 'hsl(43, 96%, 56%)', category: 'warm' },
    { id: 'red', name: isRTL ? 'أحمر' : 'Red', color: 'hsl(0, 84%, 60%)', category: 'warm' },
    { id: 'pink', name: isRTL ? 'زهري' : 'Pink', color: 'hsl(330, 81%, 60%)', category: 'warm' },
    { id: 'rose', name: isRTL ? 'وردي' : 'Rose', color: 'hsl(351, 83%, 61%)', category: 'warm' },
    { id: 'slate', name: isRTL ? 'أردوازي' : 'Slate', color: 'hsl(215, 28%, 17%)', category: 'neutral' },
    { id: 'neutral', name: isRTL ? 'محايد' : 'Neutral', color: 'hsl(0, 0%, 23%)', category: 'neutral' },
    { id: 'stone', name: isRTL ? 'حجري' : 'Stone', color: 'hsl(25, 5%, 25%)', category: 'neutral' },
  ];

  const fontThemes = [
    {
      id: 'inter',
      name: 'Inter',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط عصري ومقروء' : 'Modern and readable',
      category: 'modern'
    },
    {
      id: 'roboto',
      name: 'Roboto',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط جوجل الشهير' : 'Google\'s popular font',
      category: 'classic'
    },
    {
      id: 'poppins',
      name: 'Poppins',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط دائري وودود' : 'Rounded and friendly',
      category: 'modern'
    },
    {
      id: 'nunito',
      name: 'Nunito',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط متوازن ومريح' : 'Balanced and comfortable',
      category: 'modern'
    },
    {
      id: 'source-sans',
      name: 'Source Sans',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط أدوبي المفتوح' : 'Adobe\'s open source',
      category: 'professional'
    },
    {
      id: 'work-sans',
      name: 'Work Sans',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'مصمم للشاشات' : 'Optimized for screens',
      category: 'professional'
    },
    {
      id: 'outfit',
      name: 'Outfit',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط عصري وأنيق' : 'Modern and stylish',
      category: 'trendy'
    },
    {
      id: 'space-grotesk',
      name: 'Space Grotesk',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط مستقبلي' : 'Futuristic design',
      category: 'trendy'
    },
    {
      id: 'dosis',
      name: 'Dosis',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط نظيف وبسيط' : 'Clean and minimal',
      category: 'minimal'
    },
    // Arabic Fonts
    {
      id: 'amiri',
      name: isRTL ? 'أميري' : 'Amiri',
      preview: isRTL ? 'إن الخط العربي فن جميل يعبر عن ثقافة الأمة' : 'Beautiful Arabic calligraphy font',
      description: isRTL ? 'خط تقليدي كلاسيكي' : 'Classical traditional Arabic font',
      category: 'arabic-classic'
    },
    {
      id: 'cairo',
      name: isRTL ? 'القاهرة' : 'Cairo',
      preview: isRTL ? 'خط عصري للاستخدام في التطبيقات الحديثة' : 'Modern font for contemporary applications',
      description: isRTL ? 'خط عربي عصري' : 'Modern Arabic typeface',
      category: 'arabic-modern'
    },
    {
      id: 'tajawal',
      name: isRTL ? 'تجول' : 'Tajawal',
      preview: isRTL ? 'خط نظيف وسهل القراءة للاستخدام اليومي' : 'Clean and readable for daily use',
      description: isRTL ? 'خط عربي نظيف' : 'Clean Arabic font',
      category: 'arabic-modern'
    },
    {
      id: 'almarai',
      name: isRTL ? 'المرعي' : 'Almarai',
      preview: isRTL ? 'تصميم بسيط وأنيق للمحتوى الرقمي' : 'Simple and elegant design for digital content',
      description: isRTL ? 'خط بسيط وأنيق' : 'Simple and elegant',
      category: 'arabic-modern'
    },
    {
      id: 'noto-sans-arabic',
      name: isRTL ? 'نوتو سانس العربية' : 'Noto Sans Arabic',
      preview: isRTL ? 'خط جوجل الشامل لدعم اللغة العربية' : 'Google\'s comprehensive Arabic font',
      description: isRTL ? 'خط جوجل العربي' : 'Google\'s Arabic font',
      category: 'arabic-professional'
    },
    {
      id: 'scheherazade',
      name: isRTL ? 'شهرزاد' : 'Scheherazade',
      preview: isRTL ? 'خط تقليدي مستوحى من الخط النسخي' : 'Traditional font inspired by Naskh calligraphy',
      description: isRTL ? 'خط نسخي تقليدي' : 'Traditional Naskh style',
      category: 'arabic-classic'
    },
    {
      id: 'markazi-text',
      name: isRTL ? 'نص مرقزي' : 'Markazi Text',
      preview: isRTL ? 'خط مناسب للنصوص الطويلة والمقالات' : 'Perfect for long texts and articles',
      description: isRTL ? 'للنصوص الطويلة' : 'For long texts',
      category: 'arabic-professional'
    },
    {
      id: 'reem-kufi',
      name: isRTL ? 'ريم كوفي' : 'Reem Kufi',
      preview: isRTL ? 'تصميم هندسي حديث مستوحى من الخط الكوفي' : 'Modern geometric design inspired by Kufi',
      description: isRTL ? 'خط كوفي هندسي' : 'Geometric Kufi style',
      category: 'arabic-trendy'
    },
    {
      id: 'changa',
      name: isRTL ? 'تشانغا' : 'Changa',
      preview: isRTL ? 'خط عربي جريء ومميز للعناوين' : 'Bold and distinctive Arabic font for headlines',
      description: isRTL ? 'خط عربي جريء' : 'Bold Arabic font',
      category: 'arabic-trendy'
    },
    {
      id: 'ibm-plex-sans-arabic',
      name: isRTL ? 'آي بي إم عربي' : 'IBM Plex Arabic',
      preview: isRTL ? 'خط مؤسسي احترافي من شركة آي بي إم' : 'Professional corporate font from IBM',
      description: isRTL ? 'خط مؤسسي احترافي' : 'Professional corporate font',
      category: 'arabic-professional'
    },
    {
      id: 'system',
      name: isRTL ? 'خط النظام' : 'System',
      preview: isRTL ? 'نص تجريبي للخط' : 'The quick brown fox jumps over the lazy dog.',
      description: isRTL ? 'خط النظام الافتراضي' : 'Default system fonts',
      category: 'system'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? 'إدارة إعدادات المتجر والتفضيلات الشخصية'
              : 'Manage your store settings and preferences'
            }
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-5 ${isRTL ? '' : ''}`}>
            <TabsTrigger value="appearance" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Palette className="h-4 w-4" />
              {isRTL ? 'المظهر' : 'Appearance'}
            </TabsTrigger>
            <TabsTrigger value="general" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Store className="h-4 w-4" />
              {isRTL ? 'عام' : 'General'}
            </TabsTrigger>
            <TabsTrigger value="notifications" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Bell className="h-4 w-4" />
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="security" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className="h-4 w-4" />
              {isRTL ? 'الأمان' : 'Security'}
            </TabsTrigger>
            <TabsTrigger value="billing" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="h-4 w-4" />
              {isRTL ? 'الفواتير' : 'Billing'}
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className={`border-0 shadow-elegant`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Store className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRTL ? 'قادم قريباً' : 'Coming Soon'}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className={`border-0 shadow-elegant`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRTL ? 'قادم قريباً' : 'Coming Soon'}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className={`border-0 shadow-elegant`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRTL ? 'قادم قريباً' : 'Coming Soon'}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className={`border-0 shadow-elegant`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Palette className="h-5 w-5 text-primary" />
                  {isRTL ? 'إعدادات المظهر' : 'Appearance Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  {/* Theme Mode Selection */}
                  <div>
                    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <Label className="font-medium text-lg">
                          {isRTL ? 'وضع السمة' : 'Theme Mode'}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isRTL
                            ? 'اختر بين الوضع الفاتح والداكن'
                            : 'Choose between light and dark mode'
                          }
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {theme === 'light' ? (isRTL ? 'فاتح' : 'Light') : (isRTL ? 'داكن' : 'Dark')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${theme === 'light'
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border hover:border-primary/30 hover:shadow-md'
                          }`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="space-y-3 mb-4">
                          <div className="h-3 bg-gradient-to-r from-white to-gray-100 rounded border shadow-sm"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p className="font-medium">
                            {isRTL ? 'فاتح' : 'Light'}
                          </p>
                          {theme === 'light' && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {theme === 'light' && (
                          <div className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-4 h-4 bg-primary rounded-full flex items-center justify-center`}>
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${theme === 'dark'
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border hover:border-primary/30 hover:shadow-md'
                          }`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="space-y-3 mb-4">
                          <div className="h-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded border border-gray-700 shadow-sm"></div>
                          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                        </div>
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p className="font-medium">
                            {isRTL ? 'داكن' : 'Dark'}
                          </p>
                          {theme === 'dark' && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {theme === 'dark' && (
                          <div className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-4 h-4 bg-primary rounded-full flex items-center justify-center`}>
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Color Theme Selection */}
                  <div>
                    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <Label className="font-medium text-lg">
                          {isRTL ? 'لون السمة' : 'Color Theme'}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isRTL
                            ? 'اختر لون السمة الرئيسي للتطبيق'
                            : 'Choose the primary color theme for the application'
                          }
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: colorThemes.find(c => c.id === colorTheme)?.color }}
                        />
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {colorThemes.find(c => c.id === colorTheme)?.name}
                        </span>
                      </div>
                    </div>

                    {/* Color Categories */}
                    {['vibrant', 'nature', 'warm', 'neutral'].map((category) => (
                      <div key={category} className="mb-6">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {category === 'vibrant' && (isRTL ? 'نابض بالحياة' : 'Vibrant')}
                          {category === 'nature' && (isRTL ? 'طبيعي' : 'Nature')}
                          {category === 'warm' && (isRTL ? 'دافئ' : 'Warm')}
                          {category === 'neutral' && (isRTL ? 'محايد' : 'Neutral')}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {colorThemes.filter(c => c.category === category).map((colorTheme_) => (
                            <div
                              key={colorTheme_.id}
                              className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${colorTheme === colorTheme_.id
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                : 'border-border hover:border-primary/30 hover:shadow-md'
                                }`}
                              onClick={() => setColorTheme(colorTheme_.id as ColorTheme)}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: colorTheme_.color }}
                                />
                                <span className="text-xs font-medium text-center">{colorTheme_.name}</span>
                              </div>
                              {colorTheme === colorTheme_.id && (
                                <div className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-4 h-4 bg-primary rounded-full flex items-center justify-center`}>
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Font Theme Selection */}
                  <div>
                    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <Label className="font-medium text-lg">
                          {isRTL ? 'خط السمة' : 'Font Theme'}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isRTL
                            ? 'اختر الخط المستخدم في التطبيق'
                            : 'Choose the font family used throughout the application'
                          }
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-medium">Aa</span>
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {fontThemes.find(f => f.id === fontTheme)?.name}
                        </span>
                      </div>
                    </div>

                    {/* Font Categories */}
                    {['modern', 'classic', 'professional', 'trendy', 'minimal', 'arabic-classic', 'arabic-modern', 'arabic-professional', 'arabic-trendy', 'system'].map((category) => {
                      const categoryFonts = fontThemes.filter(f => f.category === category);
                      if (categoryFonts.length === 0) return null;

                      return (
                        <div key={category} className="mb-6">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            {category === 'modern' && (isRTL ? 'عصري' : 'Modern')}
                            {category === 'classic' && (isRTL ? 'كلاسيكي' : 'Classic')}
                            {category === 'professional' && (isRTL ? 'مهني' : 'Professional')}
                            {category === 'trendy' && (isRTL ? 'عصري' : 'Trendy')}
                            {category === 'minimal' && (isRTL ? 'بسيط' : 'Minimal')}
                            {category === 'arabic-classic' && (isRTL ? 'خطوط عربية تقليدية' : 'Arabic Classic')}
                            {category === 'arabic-modern' && (isRTL ? 'خطوط عربية عصرية' : 'Arabic Modern')}
                            {category === 'arabic-professional' && (isRTL ? 'خطوط عربية مهنية' : 'Arabic Professional')}
                            {category === 'arabic-trendy' && (isRTL ? 'خطوط عربية أنيقة' : 'Arabic Trendy')}
                            {category === 'system' && (isRTL ? 'النظام' : 'System')}
                          </h4>
                          <div className="grid gap-3">
                            {categoryFonts.map((font) => (
                              <div
                                key={font.id}
                                className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${fontTheme === font.id
                                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                                  : 'border-border hover:border-primary/30'
                                  }`}
                                onClick={() => setFontTheme(font.id as FontTheme)}
                              >
                                <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div>
                                    <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <h5 className="font-semibold">{font.name}</h5>
                                      {fontTheme === font.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{font.description}</p>
                                  </div>
                                  <span className={`text-2xl font-${font.id} text-muted-foreground group-hover:text-foreground transition-colors`}>
                                    Aa
                                  </span>
                                </div>
                                <div className={`text-sm text-muted-foreground font-${font.id} leading-relaxed`}>
                                  {font.preview}
                                </div>
                                {fontTheme === font.id && (
                                  <div className={`absolute -top-1 ${isRTL ? '-left-1' : '-right-1'} w-4 h-4 bg-primary rounded-full flex items-center justify-center`}>
                                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card className={`border-0 shadow-elegant`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRTL ? 'قادم قريباً' : 'Coming Soon'}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;