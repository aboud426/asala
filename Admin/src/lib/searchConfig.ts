export interface SearchableItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  href: string;
  icon?: string;
  keywords?: string[];
  keywordsAr?: string[];
}

export const searchablePages: SearchableItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    description: 'Overview of your business with key metrics and statistics',
    descriptionAr: 'نظرة عامة على عملك مع المقاييس والإحصائيات الرئيسية',
    href: '/',
    keywords: ['home', 'overview', 'stats', 'metrics', 'summary', 'main'],
    keywordsAr: ['الرئيسية', 'نظرة عامة', 'إحصائيات', 'مقاييس', 'ملخص', 'رئيسي']
  },
  {
    id: 'orders',
    title: 'Orders',
    titleAr: 'الطلبات',
    description: 'Manage customer orders, track status and handle fulfillment',
    descriptionAr: 'إدارة طلبات العملاء وتتبع الحالة ومعالجة التسليم',
    href: '/orders',
    keywords: ['orders', 'purchases', 'transactions', 'sales', 'customers', 'buy'],
    keywordsAr: ['طلبات', 'مشتريات', 'معاملات', 'مبيعات', 'عملاء', 'شراء']
  },
  {
    id: 'products',
    title: 'Products',
    titleAr: 'المنتجات',
    description: 'Manage your product catalog, inventory and pricing',
    descriptionAr: 'إدارة كتالوج المنتجات والمخزون والتسعير',
    href: '/products',
    keywords: ['products', 'items', 'catalog', 'inventory', 'stock', 'goods'],
    keywordsAr: ['منتجات', 'عناصر', 'كتالوج', 'مخزون', 'بضائع', 'سلع']
  },
  {
    id: 'customers',
    title: 'Customers',
    titleAr: 'العملاء',
    description: 'View and manage your customer database and profiles',
    descriptionAr: 'عرض وإدارة قاعدة بيانات العملاء والملفات الشخصية',
    href: '/customers',
    keywords: ['customers', 'users', 'clients', 'buyers', 'accounts', 'profiles'],
    keywordsAr: ['عملاء', 'مستخدمين', 'زبائن', 'مشترين', 'حسابات', 'ملفات شخصية']
  },
  {
    id: 'analytics',
    title: 'Analytics',
    titleAr: 'التحليلات',
    description: 'Business insights, reports and performance analytics',
    descriptionAr: 'رؤى الأعمال والتقارير وتحليلات الأداء',
    href: '/analytics',
    keywords: ['analytics', 'reports', 'insights', 'data', 'performance', 'charts'],
    keywordsAr: ['تحليلات', 'تقارير', 'رؤى', 'بيانات', 'أداء', 'مخططات']
  },
  {
    id: 'languages',
    title: 'Languages',
    titleAr: 'اللغات',
    description: 'Manage supported languages and localization settings',
    descriptionAr: 'إدارة اللغات المدعومة وإعدادات الترجمة',
    href: '/languages',
    keywords: ['languages', 'localization', 'translation', 'multilingual', 'locale'],
    keywordsAr: ['لغات', 'ترجمة', 'توطين', 'متعدد اللغات', 'محلي']
  },
  {
    id: 'categories',
    title: 'Categories',
    titleAr: 'الفئات',
    description: 'Organize and manage your main business categories',
    descriptionAr: 'تنظيم وإدارة فئات الأعمال الرئيسية',
    href: '/categories',
    keywords: ['categories', 'groups', 'classification', 'organization', 'structure'],
    keywordsAr: ['فئات', 'مجموعات', 'تصنيف', 'تنظيم', 'هيكل']
  },
  {
    id: 'categories-tree',
    title: 'Categories Tree',
    titleAr: 'شجرة الفئات',
    description: 'View categories in hierarchical tree structure',
    descriptionAr: 'عرض الفئات في هيكل شجري هرمي',
    href: '/categories/tree',
    keywords: ['categories tree', 'hierarchy', 'tree view', 'nested categories', 'structure'],
    keywordsAr: ['شجرة الفئات', 'هرمية', 'عرض شجري', 'فئات متداخلة', 'هيكل']
  },
  {
    id: 'product-categories',
    title: 'Product Categories',
    titleAr: 'فئات المنتجات',
    description: 'Manage product categories and classification structure',
    descriptionAr: 'إدارة فئات المنتجات وهيكل التصنيف',
    href: '/product-categories',
    keywords: ['product categories', 'product groups', 'product classification', 'product organization'],
    keywordsAr: ['فئات المنتجات', 'مجموعات المنتجات', 'تصنيف المنتجات', 'تنظيم المنتجات']
  },
  {
    id: 'product-categories-tree',
    title: 'Product Categories Tree',
    titleAr: 'شجرة فئات المنتجات',
    description: 'View product categories in hierarchical tree structure',
    descriptionAr: 'عرض فئات المنتجات في هيكل شجري هرمي',
    href: '/product-categories/tree',
    keywords: ['product categories tree', 'product hierarchy', 'product tree view', 'nested product categories'],
    keywordsAr: ['شجرة فئات المنتجات', 'هرمية المنتجات', 'عرض شجري للمنتجات', 'فئات منتجات متداخلة']
  },
  {
    id: 'messages',
    title: 'Messages',
    titleAr: 'الرسائل',
    description: 'Manage system messages and communication templates',
    descriptionAr: 'إدارة رسائل النظام وقوالب التواصل',
    href: '/messages',
    keywords: ['messages', 'communication', 'notifications', 'templates', 'content'],
    keywordsAr: ['رسائل', 'تواصل', 'إشعارات', 'قوالب', 'محتوى']
  },
  {
    id: 'employees',
    title: 'Employees',
    titleAr: 'الموظفين',
    description: 'Manage employee data, accounts and user profiles',
    descriptionAr: 'إدارة بيانات الموظفين والحسابات والملفات الشخصية',
    href: '/employees',
    keywords: ['employees', 'staff', 'workers', 'team', 'personnel', 'accounts', 'users', 'profiles'],
    keywordsAr: ['موظفين', 'موظف', 'طاقم', 'عمال', 'فريق', 'كادر', 'حسابات', 'مستخدمين', 'ملفات شخصية']
  },
  {
    id: 'roles',
    title: 'Roles',
    titleAr: 'الأدوار',
    description: 'Manage user roles and permissions system',
    descriptionAr: 'إدارة أدوار المستخدمين ونظام الصلاحيات',
    href: '/roles',
    keywords: ['roles', 'permissions', 'access', 'authorization', 'security', 'users'],
    keywordsAr: ['أدوار', 'صلاحيات', 'وصول', 'تخويل', 'أمان', 'مستخدمين']
  },
  {
    id: 'currencies',
    title: 'Currencies',
    titleAr: 'العملات',
    description: 'Manage currencies and their translations for multilingual support',
    descriptionAr: 'إدارة العملات وترجماتها لدعم متعدد اللغات',
    href: '/currencies',
    keywords: ['currencies', 'money', 'exchange', 'currency code', 'currency symbol', 'financial', 'localization'],
    keywordsAr: ['عملات', 'عملة', 'أموال', 'صرف', 'رمز العملة', 'رمز عملة', 'مالي', 'توطين']
  },
  {
    id: 'permissions',
    title: 'Permissions',
    titleAr: 'الصلاحيات',
    description: 'Manage user permissions and access control system',
    descriptionAr: 'إدارة صلاحيات المستخدمين ونظام التحكم في الوصول',
    href: '/permissions',
    keywords: ['permissions', 'access', 'authorization', 'security', 'rights', 'privileges', 'control'],
    keywordsAr: ['صلاحيات', 'وصول', 'تخويل', 'أمان', 'حقوق', 'امتيازات', 'تحكم']
  },
  {
    id: 'settings',
    title: 'Settings',
    titleAr: 'الإعدادات',
    description: 'Configure system settings and preferences',
    descriptionAr: 'تكوين إعدادات النظام والتفضيلات',
    href: '/settings',
    keywords: ['settings', 'configuration', 'preferences', 'options', 'setup'],
    keywordsAr: ['إعدادات', 'تكوين', 'تفضيلات', 'خيارات', 'إعداد']
  }
];

export function searchPages(query: string, isRTL: boolean = false): SearchableItem[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const results: { item: SearchableItem; score: number }[] = [];

  searchablePages.forEach(item => {
    let score = 0;

    const title = isRTL ? item.titleAr : item.title;
    const description = isRTL ? item.descriptionAr : item.description;
    const keywords = isRTL ? item.keywordsAr || [] : item.keywords || [];

    // Check title match (highest priority)
    if (title.toLowerCase().includes(searchTerm)) {
      score += 10;
      if (title.toLowerCase().startsWith(searchTerm)) {
        score += 5; // Bonus for starting with search term
      }
    }

    // Check description match
    if (description.toLowerCase().includes(searchTerm)) {
      score += 3;
    }

    // Check keywords match
    keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(searchTerm)) {
        score += 2;
      }
    });

    if (score > 0) {
      results.push({ item, score });
    }
  });

  // Sort by score (descending) and return top 5
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(result => result.item);
}
