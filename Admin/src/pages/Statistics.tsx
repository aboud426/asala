import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  BarChart,
  AreaChart,
  Histogram,
  PieChart,
  DonutChart,
  RadarChart,
  ScatterChart,
  GaugeChart,
  FunnelChart,
  createHistogramData,
} from '@/components/charts';
import { ChartConfig } from '@/components/ui/chart';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  Download,
  RefreshCw,
  Settings,
  Radar,
  Network,
  Gauge,
  Filter,
  TreePine,
  Thermometer,
  TrendingDown,
  Circle,
  GitBranch,
  Box,
  Clock,
  Calendar,
  Compass,
  LineChart as LineChartIcon,
  BarChart2,
  Layers,
  Timer,
  Workflow,
  Grid3X3,
  ArrowRightLeft,
  Layout,
  BarChart4,
  Users,
  Shuffle,
  Waves,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

// Sample data
const performanceData = [
  { month: 'Jan', monthAr: 'يناير', users: 400, sessions: 240, pageViews: 800 },
  { month: 'Feb', monthAr: 'فبراير', users: 300, sessions: 139, pageViews: 600 },
  { month: 'Mar', monthAr: 'مارس', users: 200, sessions: 980, pageViews: 1200 },
  { month: 'Apr', monthAr: 'أبريل', users: 278, sessions: 390, pageViews: 950 },
  { month: 'May', monthAr: 'مايو', users: 189, sessions: 480, pageViews: 780 },
  { month: 'Jun', monthAr: 'يونيو', users: 239, sessions: 380, pageViews: 890 },
  { month: 'Jul', monthAr: 'يوليو', users: 349, sessions: 430, pageViews: 1100 },
];

const salesData = [
  {
    product: 'Swedish Massage',
    productAr: 'المساج السويدي',
    sales: 186,
    revenue: 16740,
    unitPrice: 90,
    category: 'Classic',
    categoryAr: 'كلاسيكي'
  },
  {
    product: 'Deep Tissue Massage',
    productAr: 'مساج الأنسجة العميقة',
    sales: 142,
    revenue: 17040,
    unitPrice: 120,
    category: 'Therapeutic',
    categoryAr: 'علاجي'
  },
  {
    product: 'Hot Stone Therapy',
    productAr: 'علاج الأحجار الساخنة',
    sales: 98,
    revenue: 14700,
    unitPrice: 150,
    category: 'Premium',
    categoryAr: 'مميز'
  },
  {
    product: 'Aromatherapy',
    productAr: 'العلاج بالروائح العطرية',
    sales: 89,
    revenue: 9790,
    unitPrice: 110,
    category: 'Wellness',
    categoryAr: 'العافية'
  },
  {
    product: 'Thai Massage',
    productAr: 'المساج التايلاندي',
    sales: 76,
    revenue: 9120,
    unitPrice: 120,
    category: 'Traditional',
    categoryAr: 'تقليدي'
  },
  {
    product: 'Reflexology',
    productAr: 'علاج انعكاسي القدم',
    sales: 64,
    revenue: 5120,
    unitPrice: 80,
    category: 'Specialty',
    categoryAr: 'تخصصي'
  },
].sort((a, b) => b.sales - a.sales); // Sort by sales volume (highest first)

const deviceData = [
  { name: 'Desktop', nameAr: 'سطح المكتب', value: 65, fill: 'hsl(var(--primary))' },
  { name: 'Mobile', nameAr: 'الجوال', value: 25, fill: 'hsl(var(--secondary))' },
  { name: 'Tablet', nameAr: 'اللوحي', value: 10, fill: 'hsl(var(--success))' },
];

const responseTimeData = createHistogramData([
  120, 150, 180, 200, 220, 180, 160, 190, 210, 170,
  140, 160, 180, 200, 230, 190, 170, 150, 160, 180,
  200, 220, 240, 260, 180, 200, 190, 170, 160, 150,
], 8);

const trafficData = [
  { time: '00:00', timeAr: '00:00', organic: 45, paid: 20, social: 15, direct: 25 },
  { time: '04:00', timeAr: '04:00', organic: 35, paid: 15, social: 10, direct: 20 },
  { time: '08:00', timeAr: '08:00', organic: 85, paid: 40, social: 30, direct: 45 },
  { time: '12:00', timeAr: '12:00', organic: 120, paid: 60, social: 45, direct: 70 },
  { time: '16:00', timeAr: '16:00', organic: 100, paid: 55, social: 40, direct: 60 },
  { time: '20:00', timeAr: '20:00', organic: 75, paid: 35, social: 25, direct: 40 },
];

// Radar chart data for service comparison
const serviceRadarData = [
  {
    subject: 'Quality',
    subjectAr: 'الجودة',
    swedish: 95,
    deepTissue: 88,
    hotStone: 92,
    thai: 85,
  },
  {
    subject: 'Popularity',
    subjectAr: 'الشعبية',
    swedish: 90,
    deepTissue: 75,
    hotStone: 60,
    thai: 65,
  },
  {
    subject: 'Profit Margin',
    subjectAr: 'هامش الربح',
    swedish: 70,
    deepTissue: 85,
    hotStone: 95,
    thai: 80,
  },
  {
    subject: 'Customer Satisfaction',
    subjectAr: 'رضا العملاء',
    swedish: 92,
    deepTissue: 87,
    hotStone: 94,
    thai: 89,
  },
  {
    subject: 'Repeat Bookings',
    subjectAr: 'الحجوزات المتكررة',
    swedish: 88,
    deepTissue: 82,
    hotStone: 78,
    thai: 85,
  },
];

// Scatter chart data for price vs satisfaction
const priceVsSatisfactionData = [
  { x: 90, y: 92, z: 186, service: 'Swedish Massage', serviceAr: 'المساج السويدي' },
  { x: 120, y: 87, z: 142, service: 'Deep Tissue', serviceAr: 'مساج الأنسجة العميقة' },
  { x: 150, y: 94, z: 98, service: 'Hot Stone', serviceAr: 'علاج الأحجار الساخنة' },
  { x: 110, y: 85, z: 89, service: 'Aromatherapy', serviceAr: 'العلاج بالروائح' },
  { x: 120, y: 89, z: 76, service: 'Thai Massage', serviceAr: 'المساج التايلاندي' },
  { x: 80, y: 83, z: 64, service: 'Reflexology', serviceAr: 'علاج انعكاسي القدم' },
];

// Funnel chart data for booking conversion
const bookingFunnelData = [
  {
    name: 'Website Visitors',
    nameAr: 'زوار الموقع',
    value: 10000,
    fill: 'hsl(var(--primary))',
  },
  {
    name: 'Service Page Views',
    nameAr: 'مشاهدات صفحات الخدمات',
    value: 5500,
    fill: 'hsl(var(--secondary))',
  },
  {
    name: 'Booking Form Started',
    nameAr: 'بدء ملء نموذج الحجز',
    value: 2800,
    fill: 'hsl(var(--success))',
  },
  {
    name: 'Contact Info Entered',
    nameAr: 'إدخال معلومات الاتصال',
    value: 1900,
    fill: 'hsl(var(--warning))',
  },
  {
    name: 'Payment Completed',
    nameAr: 'اكتمال الدفع',
    value: 1350,
    fill: 'hsl(var(--info))',
  },
];

// TreeMap data for service categories
const serviceTreeMapData = [
  {
    name: 'Classic Massages',
    nameAr: 'المساج الكلاسيكي',
    children: [
      { name: 'Swedish', nameAr: 'السويدي', size: 186, revenue: 16740 },
      { name: 'Relaxation', nameAr: 'الاسترخاء', size: 124, revenue: 9920 },
    ]
  },
  {
    name: 'Therapeutic',
    nameAr: 'العلاجي',
    children: [
      { name: 'Deep Tissue', nameAr: 'الأنسجة العميقة', size: 142, revenue: 17040 },
      { name: 'Sports', nameAr: 'الرياضي', size: 98, revenue: 11760 },
    ]
  },
  {
    name: 'Premium',
    nameAr: 'المميز',
    children: [
      { name: 'Hot Stone', nameAr: 'الأحجار الساخنة', size: 98, revenue: 14700 },
      { name: 'Couple', nameAr: 'للأزواج', size: 45, revenue: 9000 },
    ]
  },
];

// HeatMap data for booking patterns
const heatMapData = [
  { day: 'Mon', dayAr: 'الاثنين', hour: '09:00', value: 15 },
  { day: 'Mon', dayAr: 'الاثنين', hour: '12:00', value: 25 },
  { day: 'Mon', dayAr: 'الاثنين', hour: '15:00', value: 30 },
  { day: 'Mon', dayAr: 'الاثنين', hour: '18:00', value: 20 },
  { day: 'Tue', dayAr: 'الثلاثاء', hour: '09:00', value: 18 },
  { day: 'Tue', dayAr: 'الثلاثاء', hour: '12:00', value: 35 },
  { day: 'Tue', dayAr: 'الثلاثاء', hour: '15:00', value: 40 },
  { day: 'Tue', dayAr: 'الثلاثاء', hour: '18:00', value: 28 },
  { day: 'Wed', dayAr: 'الأربعاء', hour: '09:00', value: 22 },
  { day: 'Wed', dayAr: 'الأربعاء', hour: '12:00', value: 32 },
  { day: 'Wed', dayAr: 'الأربعاء', hour: '15:00', value: 45 },
  { day: 'Wed', dayAr: 'الأربعاء', hour: '18:00', value: 35 },
  { day: 'Thu', dayAr: 'الخميس', hour: '09:00', value: 20 },
  { day: 'Thu', dayAr: 'الخميس', hour: '12:00', value: 38 },
  { day: 'Thu', dayAr: 'الخميس', hour: '15:00', value: 42 },
  { day: 'Thu', dayAr: 'الخميس', hour: '18:00', value: 32 },
  { day: 'Fri', dayAr: 'الجمعة', hour: '09:00', value: 25 },
  { day: 'Fri', dayAr: 'الجمعة', hour: '12:00', value: 45 },
  { day: 'Fri', dayAr: 'الجمعة', hour: '15:00', value: 50 },
  { day: 'Fri', dayAr: 'الجمعة', hour: '18:00', value: 40 },
  { day: 'Sat', dayAr: 'السبت', hour: '09:00', value: 30 },
  { day: 'Sat', dayAr: 'السبت', hour: '12:00', value: 48 },
  { day: 'Sat', dayAr: 'السبت', hour: '15:00', value: 55 },
  { day: 'Sat', dayAr: 'السبت', hour: '18:00', value: 45 },
  { day: 'Sun', dayAr: 'الأحد', hour: '09:00', value: 12 },
  { day: 'Sun', dayAr: 'الأحد', hour: '12:00', value: 22 },
  { day: 'Sun', dayAr: 'الأحد', hour: '15:00', value: 28 },
  { day: 'Sun', dayAr: 'الأحد', hour: '18:00', value: 20 },
];

// Waterfall data for revenue breakdown
const waterfallData = [
  { name: 'Starting Revenue', nameAr: 'الإيرادات الأولية', value: 50000, cumulative: 50000 },
  { name: 'Swedish Massage', nameAr: 'المساج السويدي', value: 16740, cumulative: 66740 },
  { name: 'Deep Tissue', nameAr: 'الأنسجة العميقة', value: 17040, cumulative: 83780 },
  { name: 'Hot Stone', nameAr: 'الأحجار الساخنة', value: 14700, cumulative: 98480 },
  { name: 'Aromatherapy', nameAr: 'العلاج بالروائح', value: 9790, cumulative: 108270 },
  { name: 'Thai Massage', nameAr: 'المساج التايلاندي', value: 9120, cumulative: 117390 },
  { name: 'Reflexology', nameAr: 'علاج القدم', value: 5120, cumulative: 122510 },
  { name: 'Operating Costs', nameAr: 'التكاليف التشغيلية', value: -25000, cumulative: 97510 },
  { name: 'Net Revenue', nameAr: 'الإيرادات الصافية', value: 0, cumulative: 97510 },
];

// Bubble chart data for service performance
const bubbleData = [
  { x: 90, y: 92, r: 186, service: 'Swedish', serviceAr: 'السويدي', category: 'Classic' },
  { x: 120, y: 87, r: 142, service: 'Deep Tissue', serviceAr: 'الأنسجة العميقة', category: 'Therapeutic' },
  { x: 150, y: 94, r: 98, service: 'Hot Stone', serviceAr: 'الأحجار الساخنة', category: 'Premium' },
  { x: 110, y: 85, r: 89, service: 'Aromatherapy', serviceAr: 'العلاج بالروائح', category: 'Wellness' },
  { x: 120, y: 89, r: 76, service: 'Thai', serviceAr: 'التايلاندي', category: 'Traditional' },
  { x: 80, y: 83, r: 64, service: 'Reflexology', serviceAr: 'علاج القدم', category: 'Specialty' },
];

// Polar chart data for seasonal trends
const seasonalTrendsData = [
  {
    month: 'Jan',
    monthAr: 'يناير',
    bookings: 120,
    satisfaction: 85,
    revenue: 18000,
    staffUtilization: 75,
    temperature: 22
  },
  {
    month: 'Feb',
    monthAr: 'فبراير',
    bookings: 135,
    satisfaction: 88,
    revenue: 20250,
    staffUtilization: 82,
    temperature: 24
  },
  {
    month: 'Mar',
    monthAr: 'مارس',
    bookings: 150,
    satisfaction: 90,
    revenue: 22500,
    staffUtilization: 85,
    temperature: 26
  },
  {
    month: 'Apr',
    monthAr: 'أبريل',
    bookings: 165,
    satisfaction: 92,
    revenue: 24750,
    staffUtilization: 88,
    temperature: 28
  },
  {
    month: 'May',
    monthAr: 'مايو',
    bookings: 180,
    satisfaction: 94,
    revenue: 27000,
    staffUtilization: 92,
    temperature: 30
  },
  {
    month: 'Jun',
    monthAr: 'يونيو',
    bookings: 195,
    satisfaction: 96,
    revenue: 29250,
    staffUtilization: 95,
    temperature: 32
  },
  {
    month: 'Jul',
    monthAr: 'يوليو',
    bookings: 210,
    satisfaction: 95,
    revenue: 31500,
    staffUtilization: 98,
    temperature: 34
  },
  {
    month: 'Aug',
    monthAr: 'أغسطس',
    bookings: 205,
    satisfaction: 93,
    revenue: 30750,
    staffUtilization: 96,
    temperature: 33
  },
  {
    month: 'Sep',
    monthAr: 'سبتمبر',
    bookings: 185,
    satisfaction: 91,
    revenue: 27750,
    staffUtilization: 90,
    temperature: 30
  },
  {
    month: 'Oct',
    monthAr: 'أكتوبر',
    bookings: 170,
    satisfaction: 89,
    revenue: 25500,
    staffUtilization: 85,
    temperature: 27
  },
  {
    month: 'Nov',
    monthAr: 'نوفمبر',
    bookings: 155,
    satisfaction: 87,
    revenue: 23250,
    staffUtilization: 80,
    temperature: 24
  },
  {
    month: 'Dec',
    monthAr: 'ديسمبر',
    bookings: 140,
    satisfaction: 86,
    revenue: 21000,
    staffUtilization: 78,
    temperature: 22
  },
];

// Multi-axis comparison data
const multiAxisData = [
  { time: '9:00', timeAr: '9:00', appointments: 12, satisfaction: 4.2, revenue: 1440, waitTime: 5 },
  { time: '10:00', timeAr: '10:00', appointments: 15, satisfaction: 4.3, revenue: 1800, waitTime: 8 },
  { time: '11:00', timeAr: '11:00', appointments: 18, satisfaction: 4.5, revenue: 2160, waitTime: 12 },
  { time: '12:00', timeAr: '12:00', appointments: 22, satisfaction: 4.4, revenue: 2640, waitTime: 15 },
  { time: '13:00', timeAr: '13:00', appointments: 25, satisfaction: 4.6, revenue: 3000, waitTime: 18 },
  { time: '14:00', timeAr: '14:00', appointments: 28, satisfaction: 4.7, revenue: 3360, waitTime: 22 },
  { time: '15:00', timeAr: '15:00', appointments: 32, satisfaction: 4.8, revenue: 3840, waitTime: 25 },
  { time: '16:00', timeAr: '16:00', appointments: 30, satisfaction: 4.9, revenue: 3600, waitTime: 20 },
  { time: '17:00', timeAr: '17:00', appointments: 26, satisfaction: 4.7, revenue: 3120, waitTime: 15 },
  { time: '18:00', timeAr: '18:00', appointments: 20, satisfaction: 4.5, revenue: 2400, waitTime: 10 },
];

// Radial progress data for KPIs
const radialKPIData = [
  { name: 'Customer Retention', nameAr: 'الاحتفاظ بالعملاء', value: 87, target: 90, color: 'hsl(var(--primary))' },
  { name: 'Staff Productivity', nameAr: 'إنتاجية الموظفين', value: 94, target: 95, color: 'hsl(var(--success))' },
  { name: 'Quality Score', nameAr: 'نقاط الجودة', value: 91, target: 85, color: 'hsl(var(--warning))' },
  { name: 'Revenue Growth', nameAr: 'نمو الإيرادات', value: 78, target: 80, color: 'hsl(var(--info))' },
  { name: 'Cost Efficiency', nameAr: 'كفاءة التكلفة', value: 83, target: 85, color: 'hsl(var(--purple))' },
  { name: 'Market Share', nameAr: 'حصة السوق', value: 65, target: 70, color: 'hsl(var(--pink))' },
];

// Time series hourly bookings data
const hourlyBookingsData = [
  { hour: 8, bookings: 2, utilization: 25 },
  { hour: 9, bookings: 5, utilization: 62 },
  { hour: 10, bookings: 8, utilization: 100 },
  { hour: 11, bookings: 12, utilization: 150 },
  { hour: 12, bookings: 15, utilization: 187 },
  { hour: 13, bookings: 18, utilization: 225 },
  { hour: 14, bookings: 22, utilization: 275 },
  { hour: 15, bookings: 25, utilization: 312 },
  { hour: 16, bookings: 28, utilization: 350 },
  { hour: 17, bookings: 24, utilization: 300 },
  { hour: 18, bookings: 20, utilization: 250 },
  { hour: 19, bookings: 15, utilization: 187 },
  { hour: 20, bookings: 10, utilization: 125 },
  { hour: 21, bookings: 5, utilization: 62 },
];

// Step chart data for booking process stages
const bookingProcessData = [
  { stage: 'Initial Contact', stageAr: 'الاتصال الأولي', completions: 1000, dropRate: 0 },
  { stage: 'Service Selection', stageAr: 'اختيار الخدمة', completions: 850, dropRate: 15 },
  { stage: 'Time Booking', stageAr: 'حجز الوقت', completions: 720, dropRate: 28 },
  { stage: 'Payment', stageAr: 'الدفع', completions: 650, dropRate: 35 },
  { stage: 'Confirmation', stageAr: 'التأكيد', completions: 620, dropRate: 38 },
  { stage: 'Service Delivery', stageAr: 'تقديم الخدمة', completions: 590, dropRate: 41 },
  { stage: 'Follow-up', stageAr: 'المتابعة', completions: 450, dropRate: 55 },
];

// Matrix heat map data for service performance by day/time
const serviceMatrixData = [
  { day: 'Monday', dayAr: 'الاثنين', 
    morning: 45, afternoon: 65, evening: 35,
    swedish: 25, deepTissue: 15, hotStone: 18, thai: 12, aromatherapy: 8, reflexology: 6
  },
  { day: 'Tuesday', dayAr: 'الثلاثاء',
    morning: 52, afternoon: 72, evening: 42,
    swedish: 28, deepTissue: 18, hotStone: 21, thai: 15, aromatherapy: 12, reflexology: 9
  },
  { day: 'Wednesday', dayAr: 'الأربعاء',
    morning: 58, afternoon: 78, evening: 48,
    swedish: 32, deepTissue: 22, hotStone: 24, thai: 18, aromatherapy: 14, reflexology: 12
  },
  { day: 'Thursday', dayAr: 'الخميس',
    morning: 55, afternoon: 85, evening: 55,
    swedish: 35, deepTissue: 25, hotStone: 28, thai: 22, aromatherapy: 16, reflexology: 14
  },
  { day: 'Friday', dayAr: 'الجمعة',
    morning: 68, afternoon: 95, evening: 72,
    swedish: 42, deepTissue: 32, hotStone: 35, thai: 28, aromatherapy: 22, reflexology: 18
  },
  { day: 'Saturday', dayAr: 'السبت',
    morning: 75, afternoon: 100, evening: 85,
    swedish: 48, deepTissue: 38, hotStone: 42, thai: 35, aromatherapy: 28, reflexology: 22
  },
  { day: 'Sunday', dayAr: 'الأحد',
    morning: 38, afternoon: 55, evening: 28,
    swedish: 22, deepTissue: 12, hotStone: 15, thai: 8, aromatherapy: 6, reflexology: 4
  },
];

// Customer journey flow data
const customerFlowData = [
  { from: 'Social Media', fromAr: 'وسائل التواصل', to: 'Website', toAr: 'الموقع', value: 2500 },
  { from: 'Google Ads', fromAr: 'إعلانات جوجل', to: 'Website', toAr: 'الموقع', value: 1800 },
  { from: 'Direct', fromAr: 'مباشر', to: 'Website', toAr: 'الموقع', value: 1200 },
  { from: 'Referrals', fromAr: 'الإحالات', to: 'Website', toAr: 'الموقع', value: 800 },
  { from: 'Website', fromAr: 'الموقع', to: 'Service Pages', toAr: 'صفحات الخدمات', value: 4200 },
  { from: 'Service Pages', fromAr: 'صفحات الخدمات', to: 'Booking Form', toAr: 'نموذج الحجز', value: 2800 },
  { from: 'Booking Form', fromAr: 'نموذج الحجز', to: 'Payment', toAr: 'الدفع', value: 1650 },
  { from: 'Payment', fromAr: 'الدفع', to: 'Confirmed', toAr: 'مؤكد', value: 1320 },
];

// Comparative analysis data
const competitorComparisonData = [
  { metric: 'Average Price', metricAr: 'متوسط السعر', us: 120, competitor1: 95, competitor2: 150, competitor3: 110 },
  { metric: 'Customer Rating', metricAr: 'تقييم العملاء', us: 4.8, competitor1: 4.2, competitor2: 4.6, competitor3: 4.1 },
  { metric: 'Booking Volume', metricAr: 'حجم الحجوزات', us: 850, competitor1: 620, competitor2: 720, competitor3: 580 },
  { metric: 'Wait Time (days)', metricAr: 'وقت الانتظار (أيام)', us: 3, competitor1: 7, competitor2: 5, competitor3: 9 },
  { metric: 'Service Variety', metricAr: 'تنوع الخدمات', us: 25, competitor1: 18, competitor2: 22, competitor3: 15 },
];

// Distribution analysis data
const ageDistributionData = [
  { ageGroup: '18-25', ageGroupAr: '18-25', count: 125, percentage: 12.5, avgSpending: 85 },
  { ageGroup: '26-35', ageGroupAr: '26-35', count: 285, percentage: 28.5, avgSpending: 125 },
  { ageGroup: '36-45', ageGroupAr: '36-45', count: 320, percentage: 32.0, avgSpending: 155 },
  { ageGroup: '46-55', ageGroupAr: '46-55', count: 180, percentage: 18.0, avgSpending: 175 },
  { ageGroup: '56-65', ageGroupAr: '56-65', count: 75, percentage: 7.5, avgSpending: 145 },
  { ageGroup: '65+', ageGroupAr: '+65', count: 15, percentage: 1.5, avgSpending: 120 },
];

// Mini dashboard data
const miniDashboardData = {
  todayStats: {
    bookings: 42,
    revenue: 5040,
    satisfaction: 4.7,
    utilization: 87
  },
  weeklyTrend: [
    { day: 'Mon', dayAr: 'الاثنين', value: 35 },
    { day: 'Tue', dayAr: 'الثلاثاء', value: 42 },
    { day: 'Wed', dayAr: 'الأربعاء', value: 48 },
    { day: 'Thu', dayAr: 'الخميس', value: 52 },
    { day: 'Fri', dayAr: 'الجمعة', value: 68 },
    { day: 'Sat', dayAr: 'السبت', value: 75 },
    { day: 'Sun', dayAr: 'الأحد', value: 28 },
  ],
  topServices: [
    { name: 'Swedish Massage', nameAr: 'المساج السويدي', bookings: 18 },
    { name: 'Deep Tissue', nameAr: 'مساج الأنسجة', bookings: 12 },
    { name: 'Hot Stone', nameAr: 'الأحجار الساخنة', bookings: 8 },
  ],
  alertMetrics: [
    { type: 'low_inventory', typeAr: 'نفاد المخزون', value: 3, status: 'warning' },
    { type: 'staff_utilization', typeAr: 'استغلال الموظفين', value: 95, status: 'success' },
    { type: 'avg_wait_time', typeAr: 'متوسط الانتظار', value: 15, status: 'error' },
  ]
};

// Advanced trend data with forecasting
const trendForecastData = [
  { month: 'Jan', monthAr: 'يناير', actual: 1200, forecast: null, upperBound: null, lowerBound: null },
  { month: 'Feb', monthAr: 'فبراير', actual: 1350, forecast: null, upperBound: null, lowerBound: null },
  { month: 'Mar', monthAr: 'مارس', actual: 1480, forecast: null, upperBound: null, lowerBound: null },
  { month: 'Apr', monthAr: 'أبريل', actual: 1620, forecast: null, upperBound: null, lowerBound: null },
  { month: 'May', monthAr: 'مايو', actual: 1780, forecast: null, upperBound: null, lowerBound: null },
  { month: 'Jun', monthAr: 'يونيو', actual: 1950, forecast: null, upperBound: null, lowerBound: null },
  { month: 'Jul', monthAr: 'يوليو', actual: null, forecast: 2100, upperBound: 2350, lowerBound: 1850 },
  { month: 'Aug', monthAr: 'أغسطس', actual: null, forecast: 2050, upperBound: 2300, lowerBound: 1800 },
  { month: 'Sep', monthAr: 'سبتمبر', actual: null, forecast: 1900, upperBound: 2150, lowerBound: 1650 },
  { month: 'Oct', monthAr: 'أكتوبر', actual: null, forecast: 1750, upperBound: 2000, lowerBound: 1500 },
  { month: 'Nov', monthAr: 'نوفمبر', actual: null, forecast: 1600, upperBound: 1850, lowerBound: 1350 },
  { month: 'Dec', monthAr: 'ديسمبر', actual: null, forecast: 1450, upperBound: 1700, lowerBound: 1200 },
];

// Sankey data for customer journey
const sankeyData = {
  nodes: [
    { id: 'website', label: 'Website Visit', labelAr: 'زيارة الموقع' },
    { id: 'services', label: 'View Services', labelAr: 'مشاهدة الخدمات' },
    { id: 'booking', label: 'Start Booking', labelAr: 'بدء الحجز' },
    { id: 'payment', label: 'Complete Payment', labelAr: 'إتمام الدفع' },
    { id: 'visit', label: 'Spa Visit', labelAr: 'زيارة المنتجع' },
    { id: 'feedback', label: 'Leave Feedback', labelAr: 'ترك تقييم' },
  ],
  links: [
    { source: 'website', target: 'services', value: 5500 },
    { source: 'services', target: 'booking', value: 2800 },
    { source: 'booking', target: 'payment', value: 1350 },
    { source: 'payment', target: 'visit', value: 1280 },
    { source: 'visit', target: 'feedback', value: 980 },
  ],
};

// Box plot data for service ratings distribution
const boxPlotData = [
  {
    service: 'Swedish',
    serviceAr: 'السويدي',
    q1: 4.2,
    median: 4.6,
    q3: 4.9,
    min: 3.8,
    max: 5.0,
    outliers: [3.5, 3.7],
  },
  {
    service: 'Deep Tissue',
    serviceAr: 'الأنسجة العميقة',
    q1: 4.0,
    median: 4.4,
    q3: 4.7,
    min: 3.5,
    max: 5.0,
    outliers: [3.2],
  },
  {
    service: 'Hot Stone',
    serviceAr: 'الأحجار الساخنة',
    q1: 4.4,
    median: 4.7,
    q3: 4.9,
    min: 4.0,
    max: 5.0,
    outliers: [],
  },
  {
    service: 'Thai',
    serviceAr: 'التايلاندي',
    q1: 4.1,
    median: 4.5,
    q3: 4.8,
    min: 3.7,
    max: 5.0,
    outliers: [3.4],
  },
];

// Chart configurations
const performanceConfig: ChartConfig = {
  users: {
    label: 'Users / المستخدمون',
    color: 'hsl(var(--primary))',
  },
  sessions: {
    label: 'Sessions / الجلسات',
    color: 'hsl(var(--secondary))',
  },
  pageViews: {
    label: 'Page Views / مشاهدات الصفحة',
    color: 'hsl(var(--success))',
  },
};

const salesConfig: ChartConfig = {
  sales: {
    label: 'Sales / المبيعات',
    color: 'hsl(var(--primary))',
  },
  revenue: {
    label: 'Revenue / الإيرادات',
    color: 'hsl(var(--secondary))',
  },
};

const deviceConfig: ChartConfig = {
  desktop: {
    label: 'Desktop / سطح المكتب',
    color: 'hsl(var(--primary))',
  },
  mobile: {
    label: 'Mobile / الجوال',
    color: 'hsl(var(--secondary))',
  },
  tablet: {
    label: 'Tablet / اللوحي',
    color: 'hsl(var(--success))',
  },
};

const responseTimeConfig: ChartConfig = {
  frequency: {
    label: 'Frequency / التكرار',
    color: 'hsl(var(--warning))',
  },
};

const trafficConfig: ChartConfig = {
  organic: {
    label: 'Organic / عضوي',
    color: 'hsl(var(--primary))',
  },
  paid: {
    label: 'Paid / مدفوع',
    color: 'hsl(var(--secondary))',
  },
  social: {
    label: 'Social / اجتماعي',
    color: 'hsl(var(--success))',
  },
  direct: {
    label: 'Direct / مباشر',
    color: 'hsl(var(--warning))',
  },
};

const serviceRadarConfig: ChartConfig = {
  swedish: {
    label: 'Swedish / السويدي',
    color: 'hsl(var(--primary))',
  },
  deepTissue: {
    label: 'Deep Tissue / الأنسجة العميقة',
    color: 'hsl(var(--secondary))',
  },
  hotStone: {
    label: 'Hot Stone / الأحجار الساخنة',
    color: 'hsl(var(--success))',
  },
  thai: {
    label: 'Thai / التايلاندي',
    color: 'hsl(var(--warning))',
  },
};

const scatterConfig: ChartConfig = {
  price: {
    label: 'Price ($) / السعر',
    color: 'hsl(var(--primary))',
  },
  satisfaction: {
    label: 'Satisfaction (%) / الرضا',
    color: 'hsl(var(--secondary))',
  },
};

const gaugeConfig: ChartConfig = {
  value: {
    label: 'Value / القيمة',
    color: 'hsl(var(--primary))',
  },
};

const funnelConfig: ChartConfig = {
  conversion: {
    label: 'Conversion / التحويل',
    color: 'hsl(var(--primary))',
  },
};

const treeMapConfig: ChartConfig = {
  classic: {
    label: 'Classic / كلاسيكي',
    color: 'hsl(var(--primary))',
  },
  therapeutic: {
    label: 'Therapeutic / علاجي',
    color: 'hsl(var(--secondary))',
  },
  premium: {
    label: 'Premium / مميز',
    color: 'hsl(var(--success))',
  },
};

const heatMapConfig: ChartConfig = {
  intensity: {
    label: 'Booking Intensity / كثافة الحجوزات',
    color: 'hsl(var(--primary))',
  },
};

const waterfallConfig: ChartConfig = {
  positive: {
    label: 'Revenue / الإيرادات',
    color: 'hsl(var(--success))',
  },
  negative: {
    label: 'Costs / التكاليف',
    color: 'hsl(var(--destructive))',
  },
  total: {
    label: 'Total / الإجمالي',
    color: 'hsl(var(--primary))',
  },
};

const bubbleConfig: ChartConfig = {
  price: {
    label: 'Price ($) / السعر',
    color: 'hsl(var(--primary))',
  },
  satisfaction: {
    label: 'Satisfaction (%) / الرضا',
    color: 'hsl(var(--secondary))',
  },
  volume: {
    label: 'Sales Volume / حجم المبيعات',
    color: 'hsl(var(--success))',
  },
};

const sankeyConfig: ChartConfig = {
  flow: {
    label: 'Customer Flow / تدفق العملاء',
    color: 'hsl(var(--primary))',
  },
};

const boxPlotConfig: ChartConfig = {
  rating: {
    label: 'Rating Distribution / توزيع التقييمات',
    color: 'hsl(var(--primary))',
  },
};

// New chart configurations
const seasonalConfig: ChartConfig = {
  bookings: {
    label: 'Bookings / الحجوزات',
    color: 'hsl(var(--primary))',
  },
  satisfaction: {
    label: 'Satisfaction / الرضا',
    color: 'hsl(var(--secondary))',
  },
  revenue: {
    label: 'Revenue / الإيرادات',
    color: 'hsl(var(--success))',
  },
  staffUtilization: {
    label: 'Staff Utilization / استغلال الموظفين',
    color: 'hsl(var(--warning))',
  },
  temperature: {
    label: 'Temperature / درجة الحرارة',
    color: 'hsl(var(--info))',
  },
};

const multiAxisConfig: ChartConfig = {
  appointments: {
    label: 'Appointments / المواعيد',
    color: 'hsl(var(--primary))',
  },
  satisfaction: {
    label: 'Satisfaction / الرضا',
    color: 'hsl(var(--secondary))',
  },
  revenue: {
    label: 'Revenue / الإيرادات',
    color: 'hsl(var(--success))',
  },
  waitTime: {
    label: 'Wait Time / وقت الانتظار',
    color: 'hsl(var(--warning))',
  },
};

const radialConfig: ChartConfig = {
  value: {
    label: 'Current / الحالي',
    color: 'hsl(var(--primary))',
  },
  target: {
    label: 'Target / الهدف',
    color: 'hsl(var(--muted))',
  },
};

const hourlyConfig: ChartConfig = {
  bookings: {
    label: 'Hourly Bookings / الحجوزات في الساعة',
    color: 'hsl(var(--primary))',
  },
  utilization: {
    label: 'Utilization % / نسبة الاستغلال',
    color: 'hsl(var(--secondary))',
  },
};

const processConfig: ChartConfig = {
  completions: {
    label: 'Completions / المكتمل',
    color: 'hsl(var(--success))',
  },
  dropRate: {
    label: 'Drop Rate % / معدل التسرب',
    color: 'hsl(var(--destructive))',
  },
};

// Additional chart configurations
const matrixConfig: ChartConfig = {
  morning: {
    label: 'Morning / الصباح',
    color: 'hsl(var(--primary))',
  },
  afternoon: {
    label: 'Afternoon / بعد الظهر',
    color: 'hsl(var(--secondary))',
  },
  evening: {
    label: 'Evening / المساء',
    color: 'hsl(var(--success))',
  },
  swedish: {
    label: 'Swedish / السويدي',
    color: 'hsl(var(--primary))',
  },
  deepTissue: {
    label: 'Deep Tissue / الأنسجة العميقة',
    color: 'hsl(var(--secondary))',
  },
  hotStone: {
    label: 'Hot Stone / الأحجار الساخنة',
    color: 'hsl(var(--success))',
  },
};

const flowConfig: ChartConfig = {
  flow: {
    label: 'Customer Flow / تدفق العملاء',
    color: 'hsl(var(--primary))',
  },
};

const comparisonConfig: ChartConfig = {
  us: {
    label: 'Us / نحن',
    color: 'hsl(var(--primary))',
  },
  competitor1: {
    label: 'Competitor A / منافس أ',
    color: 'hsl(var(--secondary))',
  },
  competitor2: {
    label: 'Competitor B / منافس ب',
    color: 'hsl(var(--success))',
  },
  competitor3: {
    label: 'Competitor C / منافس ج',
    color: 'hsl(var(--warning))',
  },
};

const distributionConfig: ChartConfig = {
  count: {
    label: 'Count / العدد',
    color: 'hsl(var(--primary))',
  },
  avgSpending: {
    label: 'Avg Spending / متوسط الإنفاق',
    color: 'hsl(var(--secondary))',
  },
};

const trendConfig: ChartConfig = {
  actual: {
    label: 'Actual / فعلي',
    color: 'hsl(var(--primary))',
  },
  forecast: {
    label: 'Forecast / توقع',
    color: 'hsl(var(--secondary))',
  },
  upperBound: {
    label: 'Upper Bound / الحد الأعلى',
    color: 'hsl(var(--success))',
  },
  lowerBound: {
    label: 'Lower Bound / الحد الأدنى',
    color: 'hsl(var(--warning))',
  },
};

const miniConfig: ChartConfig = {
  value: {
    label: 'Value / القيمة',
    color: 'hsl(var(--primary))',
  },
  bookings: {
    label: 'Bookings / الحجوزات',
    color: 'hsl(var(--primary))',
  },
};

const Statistics: React.FC = () => {
  const { isRTL } = useDirection();
  const [timeRange, setTimeRange] = useState('30days');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'الإحصائيات والرسوم البيانية' : 'Statistics & Charts'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'تصور البيانات باستخدام الرسوم البيانية والإحصائيات المختلفة'
                : 'Visualize your data with various charts and statistical insights'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{isRTL ? '7 أيام' : 'Last 7 days'}</SelectItem>
                <SelectItem value="30days">{isRTL ? '30 يوم' : 'Last 30 days'}</SelectItem>
                <SelectItem value="90days">{isRTL ? '90 يوم' : 'Last 90 days'}</SelectItem>
                <SelectItem value="1year">{isRTL ? 'سنة واحدة' : 'Last year'}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {isRTL ? 'إعدادات' : 'Settings'}
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الزيارات' : 'Total Visits'}
                  </p>
                  <p className="text-2xl font-bold">24,567</p>
                  <div className="flex items-center gap-1 mt-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+12.5%</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                  </p>
                  <p className="text-2xl font-bold">3.24%</p>
                  <div className="flex items-center gap-1 mt-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+0.5%</span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}
                  </p>
                  <p className="text-2xl font-bold">187ms</p>
                  <div className="flex items-center gap-1 mt-2 text-warning">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+2.1%</span>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'النشاط الحالي' : 'Active Now'}
                  </p>
                  <p className="text-2xl font-bold">1,234</p>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">{isRTL ? 'مباشر' : 'Live'}</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-1 h-auto p-1">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {isRTL ? 'الأداء' : 'Performance'}
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isRTL ? 'المبيعات' : 'Sales'}
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              {isRTL ? 'الأجهزة' : 'Devices'}
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {isRTL ? 'الاستجابة' : 'Response'}
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {isRTL ? 'الزيارات' : 'Traffic'}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              {isRTL ? 'المقارنة' : 'Comparison'}
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              {isRTL ? 'الارتباط' : 'Correlation'}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              {isRTL ? 'المقاييس' : 'Metrics'}
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              {isRTL ? 'التسلسل' : 'Hierarchy'}
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              {isRTL ? 'الأنماط' : 'Patterns'}
            </TabsTrigger>
            <TabsTrigger value="waterfall" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {isRTL ? 'الشلال' : 'Waterfall'}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              {isRTL ? 'متقدم' : 'Advanced'}
            </TabsTrigger>
            <TabsTrigger value="polar" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              {isRTL ? 'قطبي' : 'Polar'}
            </TabsTrigger>
            <TabsTrigger value="multiaxis" className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              {isRTL ? 'متعدد المحاور' : 'Multi-Axis'}
            </TabsTrigger>
            <TabsTrigger value="radial" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              {isRTL ? 'شعاعي' : 'Radial'}
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isRTL ? 'زمني' : 'Temporal'}
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              {isRTL ? 'مصفوفة' : 'Matrix'}
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              {isRTL ? 'تدفق' : 'Flow'}
            </TabsTrigger>
            <TabsTrigger value="composite" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              {isRTL ? 'مركب' : 'Composite'}
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              {isRTL ? 'اتجاهات' : 'Trends'}
            </TabsTrigger>
            <TabsTrigger value="distributions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isRTL ? 'التوزيعات' : 'Distributions'}
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {isRTL ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={performanceData}
                    config={performanceConfig}
                    xAxisDataKey={isRTL ? 'monthAr' : 'month'}
                    lines={[
                      { dataKey: 'users', stroke: 'hsl(var(--primary))' },
                      { dataKey: 'sessions', stroke: 'hsl(var(--secondary))' },
                      { dataKey: 'pageViews', stroke: 'hsl(var(--success))' },
                    ]}
                    height={350}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {isRTL ? 'أداء المستخدمين' : 'User Performance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={performanceData}
                    config={performanceConfig}
                    xAxisDataKey={isRTL ? 'monthAr' : 'month'}
                    areas={[
                      { dataKey: 'users', fill: 'hsl(var(--primary))', fillOpacity: 0.3, stackId: '1' },
                      { dataKey: 'sessions', fill: 'hsl(var(--secondary))', fillOpacity: 0.3, stackId: '1' },
                    ]}
                    height={350}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {isRTL ? 'أداء الخدمات - المبيعات والإيرادات' : 'Service Performance - Sales & Revenue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Header with metrics summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {salesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'إجمالي المبيعات' : 'Total Sales'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">
                        ${salesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning">
                        ${Math.round(salesData.reduce((sum, item) => sum + item.revenue, 0) / salesData.reduce((sum, item) => sum + item.sales, 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'متوسط السعر' : 'Avg. Price'}
                      </p>
                    </div>
                  </div>

                  {/* Chart legend */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'الخدمات مرتبة حسب الأداء (الأعلى مبيعاً أولاً)' : 'Services ranked by performance (highest sales first)'}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded"></div>
                        <span>{isRTL ? 'عدد المبيعات' : 'Sales Volume'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded"></div>
                        <span>{isRTL ? 'الإيرادات ($)' : 'Revenue ($)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main chart */}
                  <BarChart
                    data={salesData}
                    config={salesConfig}
                    xAxisDataKey={isRTL ? 'productAr' : 'product'}
                    bars={[
                      { dataKey: 'sales', fill: 'hsl(var(--primary))' },
                      { dataKey: 'revenue', fill: 'hsl(var(--secondary))' },
                    ]}
                    height={400}
                    layout="vertical"
                  />

                  {/* Service details table */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {isRTL ? 'تفاصيل الخدمات' : 'Service Details'}
                    </h4>
                    <div className="grid gap-2">
                      {salesData.map((service, index) => (
                        <div key={service.product} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground w-6">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {isRTL ? service.productAr : service.product}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isRTL ? service.categoryAr : service.category} • ${service.unitPrice}
                                {isRTL ? ' للجلسة' : ' per session'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{service.sales} {isRTL ? 'مبيعة' : 'sales'}</p>
                            <p className="text-xs text-success">${service.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    {isRTL ? 'توزيع الأجهزة' : 'Device Distribution'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={deviceData.map(item => ({
                      ...item,
                      name: isRTL ? item.nameAr : item.name
                    }))}
                    config={deviceConfig}
                    height={300}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    {isRTL ? 'توزيع الأجهزة (دونات)' : 'Device Distribution (Donut)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={deviceData.map(item => ({
                      ...item,
                      name: isRTL ? item.nameAr : item.name
                    }))}
                    config={deviceConfig}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Response Time Tab */}
          <TabsContent value="response" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {isRTL ? 'توزيع أوقات الاستجابة' : 'Response Time Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Histogram
                  data={responseTimeData}
                  config={responseTimeConfig}
                  height={400}
                  barColor="hsl(var(--warning))"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {isRTL ? 'مصادر الزيارات عبر الوقت' : 'Traffic Sources Over Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={trafficData}
                  config={trafficConfig}
                  xAxisDataKey={isRTL ? 'timeAr' : 'time'}
                  areas={[
                    { dataKey: 'organic', fill: 'hsl(var(--primary))', stackId: '1' },
                    { dataKey: 'paid', fill: 'hsl(var(--secondary))', stackId: '1' },
                    { dataKey: 'social', fill: 'hsl(var(--success))', stackId: '1' },
                    { dataKey: 'direct', fill: 'hsl(var(--warning))', stackId: '1' },
                  ]}
                  height={400}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radar className="h-5 w-5 text-primary" />
                    {isRTL ? 'مقارنة الخدمات متعددة الأبعاد' : 'Multi-dimensional Service Comparison'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart
                    data={serviceRadarData.map(item => ({
                      ...item,
                      subject: isRTL ? item.subjectAr : item.subject
                    }))}
                    config={serviceRadarConfig}
                    radarProps={[
                      { dataKey: 'swedish', stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary))', fillOpacity: 0.1 },
                      { dataKey: 'deepTissue', stroke: 'hsl(var(--secondary))', fill: 'hsl(var(--secondary))', fillOpacity: 0.1 },
                      { dataKey: 'hotStone', stroke: 'hsl(var(--success))', fill: 'hsl(var(--success))', fillOpacity: 0.1 },
                      { dataKey: 'thai', stroke: 'hsl(var(--warning))', fill: 'hsl(var(--warning))', fillOpacity: 0.1 },
                    ]}
                    height={500}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Correlation Tab */}
          <TabsContent value="correlation" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  {isRTL ? 'تحليل الارتباط: السعر مقابل الرضا' : 'Correlation Analysis: Price vs Satisfaction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScatterChart
                  data={priceVsSatisfactionData}
                  config={scatterConfig}
                  xAxisLabel={isRTL ? 'السعر ($)' : 'Price ($)'}
                  yAxisLabel={isRTL ? 'رضا العملاء (%)' : 'Customer Satisfaction (%)'}
                  xDomain={[70, 160]}
                  yDomain={[80, 100]}
                  showReferenceLines={false}
                  height={450}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    {isRTL ? 'نتائج التحليل' : 'Analysis Results'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'تظهر البيانات ارتباط إيجابي ضعيف بين السعر ورضا العملاء. الخدمات المميزة تحقق رضا أعلى رغم السعر المرتفع.'
                      : 'Data shows a weak positive correlation between price and customer satisfaction. Premium services achieve higher satisfaction despite higher prices.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <GaugeChart
                    value={87}
                    max={100}
                    config={gaugeConfig}
                    title={isRTL ? 'رضا العملاء العام' : 'Overall Customer Satisfaction'}
                    subtitle={isRTL ? 'متوسط جميع الخدمات' : 'Average across all services'}
                    unit="%"
                    height={250}
                    colors={{
                      low: "hsl(var(--destructive))",
                      medium: "hsl(var(--warning))",
                      high: "hsl(var(--success))",
                      background: "hsl(var(--muted))",
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <GaugeChart
                    value={2340}
                    max={3000}
                    config={gaugeConfig}
                    title={isRTL ? 'الهدف الشهري' : 'Monthly Target'}
                    subtitle={isRTL ? 'الحجوزات المكتملة' : 'Completed bookings'}
                    unit=""
                    height={250}
                    thresholds={{ low: 40, medium: 70 }}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <GaugeChart
                    value={94.5}
                    max={100}
                    config={gaugeConfig}
                    title={isRTL ? 'وقت التشغيل' : 'System Uptime'}
                    subtitle={isRTL ? 'آخر 30 يوماً' : 'Last 30 days'}
                    unit="%"
                    height={250}
                    colors={{
                      low: "hsl(var(--destructive))",
                      medium: "hsl(var(--warning))",
                      high: "hsl(var(--success))",
                      background: "hsl(var(--muted))",
                    }}
                    thresholds={{ low: 95, medium: 98 }}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    {isRTL ? 'مسار تحويل الحجوزات' : 'Booking Conversion Funnel'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelChart
                    data={bookingFunnelData}
                    config={funnelConfig}
                    height={450}
                    showPercentages={true}
                    showValues={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-primary" />
                  {isRTL ? 'التسلسل الهرمي للخدمات' : 'Service Hierarchy TreeMap'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={serviceTreeMapData.flatMap(category => 
                    category.children.map(child => ({
                      name: isRTL ? `${category.nameAr} - ${child.nameAr}` : `${category.name} - ${child.name}`,
                      size: child.size,
                      revenue: child.revenue,
                      category: isRTL ? category.nameAr : category.name
                    }))
                  )}
                  config={{
                    size: { label: 'Sales Volume / حجم المبيعات', color: 'hsl(var(--primary))' },
                    revenue: { label: 'Revenue / الإيرادات', color: 'hsl(var(--secondary))' }
                  }}
                  xAxisDataKey="name"
                  bars={[
                    { dataKey: 'size', fill: 'hsl(var(--primary))' },
                    { dataKey: 'revenue', fill: 'hsl(var(--secondary))' },
                  ]}
                  height={450}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'يظهر هذا الرسم التوزيع الهرمي للخدمات حسب الفئة وحجم المبيعات'
                      : 'This chart shows the hierarchical distribution of services by category and sales volume'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-primary" />
                  {isRTL ? 'أنماط الحجوزات اليومية' : 'Booking Patterns Heatmap'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={heatMapData.reduce((acc, curr) => {
                    const existing = acc.find((item: { hour: string; [key: string]: string | number }) => item.hour === curr.hour);
                    if (existing) {
                      existing[isRTL ? curr.dayAr : curr.day] = curr.value;
                    } else {
                      acc.push({
                        hour: curr.hour,
                        [isRTL ? curr.dayAr : curr.day]: curr.value
                      });
                    }
                    return acc;
                  }, [] as Array<{ hour: string; [key: string]: string | number }>)}
                  config={{
                    ...(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce((acc, day, index) => {
                      const colors = [
                        'hsl(var(--primary))',
                        'hsl(var(--secondary))',
                        'hsl(var(--success))',
                        'hsl(var(--warning))',
                        'hsl(var(--info))',
                        'hsl(var(--purple))',
                        'hsl(var(--pink))',
                      ];
                      const dayAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'][index];
                      acc[isRTL ? dayAr : day] = {
                        label: isRTL ? dayAr : day,
                        color: colors[index]
                      };
                      return acc;
                    }, {} as Record<string, { label: string; color: string }>))
                  }}
                  xAxisDataKey="hour"
                  bars={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const colors = [
                      'hsl(var(--primary))',
                      'hsl(var(--secondary))',
                      'hsl(var(--success))',
                      'hsl(var(--warning))',
                      'hsl(var(--info))',
                      'hsl(var(--purple))',
                      'hsl(var(--pink))',
                    ];
                    const dayAr = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'][index];
                    return {
                      dataKey: isRTL ? dayAr : day,
                      fill: colors[index],
                      stackId: '1'
                    };
                  })}
                  height={400}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? 'الأوقات الذروة' : 'Peak Hours'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'الجمعة والسبت 15:00-18:00' : 'Friday & Saturday 3:00-6:00 PM'}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? 'أقل الأوقات ازدحاماً' : 'Quiet Hours'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'الأحد والاثنين 09:00-12:00' : 'Sunday & Monday 9:00 AM-12:00 PM'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waterfall Tab */}
          <TabsContent value="waterfall" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  {isRTL ? 'تحليل الإيرادات المتدرج' : 'Revenue Waterfall Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={waterfallData.map((item, index) => ({
                    ...item,
                    name: isRTL ? item.nameAr : item.name,
                    color: item.value > 0 ? 'positive' : item.value < 0 ? 'negative' : 'total',
                    absValue: Math.abs(item.value)
                  }))}
                  config={{
                    value: { label: 'Amount / المبلغ', color: 'hsl(var(--primary))' },
                    positive: { label: 'Revenue / إيرادات', color: 'hsl(var(--success))' },
                    negative: { label: 'Costs / تكاليف', color: 'hsl(var(--destructive))' },
                  }}
                  xAxisDataKey="name"
                  bars={[
                    { dataKey: 'value', fill: 'hsl(var(--primary))' },
                  ]}
                  height={450}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="text-lg font-bold text-success">$72,510</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'إجمالي الإيرادات من الخدمات' : 'Total Service Revenue'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-destructive/10 rounded-lg">
                    <p className="text-lg font-bold text-destructive">-$25,000</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'التكاليف التشغيلية' : 'Operating Costs'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-lg font-bold text-primary">$97,510</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'صافي الربح' : 'Net Profit'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Circle className="h-5 w-5 text-primary" />
                    {isRTL ? 'الرسم البياني الفقاعي للأداء' : 'Service Performance Bubble Chart'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <ScatterChart
                  data={bubbleData.map(item => ({
                    ...item,
                    service: isRTL ? item.serviceAr : item.service
                  }))}
                  config={bubbleConfig}
                  xAxisLabel={isRTL ? 'السعر ($)' : 'Price ($)'}
                  yAxisLabel={isRTL ? 'رضا العملاء (%)' : 'Customer Satisfaction (%)'}
                  xDomain={[70, 160]}
                  yDomain={[80, 100]}
                  height={400}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isRTL ? 'حجم النقطة يمثل عدد المبيعات' : 'Point size represents sales volume'}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>{isRTL ? 'المحور السيني: السعر' : 'X-axis: Price'}</span>
                    <span>{isRTL ? 'المحور الصادي: الرضا' : 'Y-axis: Satisfaction'}</span>
                    <span>{isRTL ? 'حجم النقطة: المبيعات' : 'Point size: Sales volume'}</span>
                  </div>
                </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    {isRTL ? 'مسار رحلة العميل' : 'Customer Journey Flow'}
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <AreaChart
                  data={[
                    { stage: isRTL ? 'زيارة الموقع' : 'Website Visit', value: 10000, remaining: 10000 },
                    { stage: isRTL ? 'مشاهدة الخدمات' : 'View Services', value: 5500, remaining: 4500 },
                    { stage: isRTL ? 'بدء الحجز' : 'Start Booking', value: 2800, remaining: 2700 },
                    { stage: isRTL ? 'إتمام الدفع' : 'Complete Payment', value: 1350, remaining: 1450 },
                    { stage: isRTL ? 'زيارة المنتجع' : 'Spa Visit', value: 1280, remaining: 70 },
                    { stage: isRTL ? 'ترك تقييم' : 'Leave Feedback', value: 980, remaining: 300 },
                  ]}
                  config={{
                    value: { label: 'Active Flow / التدفق النشط', color: 'hsl(var(--primary))' },
                    remaining: { label: 'Drop-off / التسرب', color: 'hsl(var(--muted))' }
                  }}
                  xAxisDataKey="stage"
                  areas={[
                    { dataKey: 'value', fill: 'hsl(var(--primary))', fillOpacity: 0.6, stackId: '1' },
                    { dataKey: 'remaining', fill: 'hsl(var(--muted))', fillOpacity: 0.3, stackId: '1' },
                  ]}
                  height={400}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    {isRTL ? 'معدلات التحويل' : 'Conversion Rates'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="font-medium">55%</p>
                      <p className="text-muted-foreground">
                        {isRTL ? 'زيارة → خدمات' : 'Visit → Services'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">51%</p>
                      <p className="text-muted-foreground">
                        {isRTL ? 'خدمات → حجز' : 'Services → Booking'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">48%</p>
                      <p className="text-muted-foreground">
                        {isRTL ? 'حجز → دفع' : 'Booking → Payment'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">77%</p>
                      <p className="text-muted-foreground">
                        {isRTL ? 'زيارة → تقييم' : 'Visit → Feedback'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    {isRTL ? 'توزيع تقييمات الخدمات' : 'Service Ratings Distribution'}
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <BarChart
                  data={boxPlotData.map(item => ({
                    service: isRTL ? item.serviceAr : item.service,
                    min: item.min,
                    q1: item.q1,
                    median: item.median,
                    q3: item.q3,
                    max: item.max,
                    range: item.max - item.min,
                    iqr: item.q3 - item.q1
                  }))}
                  config={{
                    median: { label: 'Median / المتوسط', color: 'hsl(var(--primary))' },
                    iqr: { label: 'IQR / النطاق الربعي', color: 'hsl(var(--secondary))' },
                    range: { label: 'Range / النطاق', color: 'hsl(var(--muted))' }
                  }}
                  xAxisDataKey="service"
                  bars={[
                    { dataKey: 'median', fill: 'hsl(var(--primary))' },
                    { dataKey: 'iqr', fill: 'hsl(var(--secondary))' },
                  ]}
                  height={350}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    {isRTL ? 'ملخص التقييمات' : 'Ratings Summary'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {boxPlotData.map((item, index) => (
                      <div key={index} className="p-2 bg-muted/10 rounded">
                        <p className="font-medium">{isRTL ? item.serviceAr : item.service}</p>
                        <p className="text-muted-foreground">
                          {isRTL ? `متوسط: ${item.median}` : `Median: ${item.median}`} | 
                          {isRTL ? ` نطاق: ${item.min}-${item.max}` : ` Range: ${item.min}-${item.max}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Polar Tab */}
          <TabsContent value="polar" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    {isRTL ? 'الاتجاهات الموسمية - رادار' : 'Seasonal Trends - Radar View'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart
                    data={seasonalTrendsData.map(item => ({
                      subject: isRTL ? item.monthAr : item.month,
                      bookings: item.bookings,
                      satisfaction: item.satisfaction,
                      staffUtilization: item.staffUtilization,
                      temperature: item.temperature,
                    }))}
                    config={seasonalConfig}
                    radarProps={[
                      { dataKey: 'bookings', stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary))', fillOpacity: 0.1 },
                      { dataKey: 'satisfaction', stroke: 'hsl(var(--secondary))', fill: 'hsl(var(--secondary))', fillOpacity: 0.1 },
                      { dataKey: 'staffUtilization', stroke: 'hsl(var(--success))', fill: 'hsl(var(--success))', fillOpacity: 0.1 },
                      { dataKey: 'temperature', stroke: 'hsl(var(--warning))', fill: 'hsl(var(--warning))', fillOpacity: 0.1 },
                    ]}
                    height={450}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? 'المؤشرات الرئيسية' : 'Key Insights'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'يظهر الرسم البياني ارتباط قوي بين درجة الحرارة وعدد الحجوزات. الفصل الذروة في يوليو.'
                        : 'The chart shows a strong correlation between temperature and bookings. Peak season in July with highest utilization.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {isRTL ? 'الإيرادات الموسمية - دائرة' : 'Seasonal Revenue - Circular'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={seasonalTrendsData.map(item => ({
                      name: isRTL ? item.monthAr : item.month,
                      value: item.revenue / 1000, // Convert to thousands for better display
                      fill: `hsl(${(seasonalTrendsData.indexOf(item) * 30) % 360}, 70%, 60%)`
                    }))}
                    config={seasonalConfig}
                    height={450}
                  />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {seasonalTrendsData.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: `hsl(${(index * 30) % 360}, 70%, 60%)` }}
                        ></div>
                        <span>{isRTL ? item.monthAr : item.month}: ${(item.revenue / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Multi-Axis Tab */}
          <TabsContent value="multiaxis" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  {isRTL ? 'تحليل متعدد المحاور' : 'Multi-Axis Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LineChart
                    data={multiAxisData}
                    config={multiAxisConfig}
                    xAxisDataKey={isRTL ? 'timeAr' : 'time'}
                    lines={[
                      { dataKey: 'appointments', stroke: 'hsl(var(--primary))' },
                      { dataKey: 'satisfaction', stroke: 'hsl(var(--secondary))' },
                      { dataKey: 'waitTime', stroke: 'hsl(var(--warning))' },
                    ]}
                    height={350}
                  />
                  
                  <AreaChart
                    data={multiAxisData}
                    config={multiAxisConfig}
                    xAxisDataKey={isRTL ? 'timeAr' : 'time'}
                    areas={[
                      { dataKey: 'revenue', fill: 'hsl(var(--success))', fillOpacity: 0.6, stackId: '1' },
                    ]}
                    height={200}
                  />
                </div>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{Math.max(...multiAxisData.map(d => d.appointments))}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'ذروة المواعيد' : 'Peak Appointments'}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary">{Math.max(...multiAxisData.map(d => d.satisfaction))}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'أعلى رضا' : 'Highest Satisfaction'}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-success">${Math.max(...multiAxisData.map(d => d.revenue))}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'ذروة الإيرادات' : 'Peak Revenue'}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-warning">{Math.max(...multiAxisData.map(d => d.waitTime))}m</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'أطول انتظار' : 'Longest Wait'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radial Tab */}
          <TabsContent value="radial" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {radialKPIData.map((kpi, index) => (
                <Card key={index} className="border-0 shadow-elegant">
                  <CardContent className="p-6">
                    <GaugeChart
                      value={kpi.value}
                      max={100}
                      config={radialConfig}
                      title={isRTL ? kpi.nameAr : kpi.name}
                      subtitle={`Target: ${kpi.target}%`}
                      unit="%"
                      height={200}
                      colors={{
                        low: "hsl(var(--destructive))",
                        medium: "hsl(var(--warning))",
                        high: kpi.color,
                        background: "hsl(var(--muted))",
                      }}
                      thresholds={{ low: 60, medium: 80 }}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{isRTL ? 'الحالي: ' : 'Current: '}{kpi.value}%</span>
                      <span className={kpi.value >= kpi.target ? 'text-success' : 'text-warning'}>
                        {kpi.value >= kpi.target 
                          ? (isRTL ? 'تحقق الهدف' : 'Target Met')
                          : `${kpi.target - kpi.value}% ${isRTL ? 'للهدف' : 'to goal'}`
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {isRTL ? 'متوسط الأداء اليومي' : 'Daily Performance Average'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={radialKPIData.map(item => ({
                    name: isRTL ? item.nameAr : item.name,
                    value: item.value,
                    fill: item.color
                  }))}
                  config={radialConfig}
                  height={350}
                />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {radialKPIData.map((kpi, index) => (
                    <div key={index} className="p-3 bg-muted/20 rounded-lg text-center">
                      <div className="w-4 h-4 rounded mx-auto mb-2" style={{ backgroundColor: kpi.color }}></div>
                      <p className="text-sm font-medium">{kpi.value}%</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? kpi.nameAr : kpi.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Temporal Tab */}
          <TabsContent value="temporal" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {isRTL ? 'نمط الحجوزات اليومي' : 'Daily Booking Pattern'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={hourlyBookingsData}
                    config={hourlyConfig}
                    xAxisDataKey="hour"
                    bars={[
                      { dataKey: 'bookings', fill: 'hsl(var(--primary))' },
                    ]}
                    height={350}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      {isRTL ? 'أوقات الذروة' : 'Peak Hours'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium">{isRTL ? 'الأعلى نشاطاً: ' : 'Most Active: '}16:00-17:00</p>
                        <p className="text-muted-foreground">28 {isRTL ? 'حجز' : 'bookings'}</p>
                      </div>
                      <div>
                        <p className="font-medium">{isRTL ? 'الأقل نشاطاً: ' : 'Least Active: '}8:00-9:00</p>
                        <p className="text-muted-foreground">2 {isRTL ? 'حجز' : 'bookings'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    {isRTL ? 'استغلال الوقت' : 'Time Utilization'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={hourlyBookingsData}
                    config={hourlyConfig}
                    xAxisDataKey="hour"
                    areas={[
                      { dataKey: 'utilization', fill: 'hsl(var(--secondary))', fillOpacity: 0.6 },
                    ]}
                    height={350}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <p className="text-lg font-bold text-success">{Math.max(...hourlyBookingsData.map(d => d.utilization))}%</p>
                        <p className="text-muted-foreground">{isRTL ? 'ذروة الاستغلال' : 'Peak Utilization'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{(hourlyBookingsData.reduce((sum, d) => sum + d.utilization, 0) / hourlyBookingsData.length).toFixed(0)}%</p>
                        <p className="text-muted-foreground">{isRTL ? 'متوسط الاستغلال' : 'Avg. Utilization'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-warning">{Math.min(...hourlyBookingsData.map(d => d.utilization))}%</p>
                        <p className="text-muted-foreground">{isRTL ? 'أدنى استغلال' : 'Lowest Utilization'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-primary" />
                  {isRTL ? 'مراحل عملية الحجز' : 'Booking Process Stages'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={bookingProcessData.map((item, index) => ({
                    ...item,
                    stage: isRTL ? item.stageAr : item.stage,
                    color: index === 0 ? 'success' : index < 3 ? 'primary' : index < 5 ? 'warning' : 'destructive'
                  }))}
                  config={processConfig}
                  xAxisDataKey="stage"
                  bars={[
                    { dataKey: 'completions', fill: 'hsl(var(--success))' },
                  ]}
                  height={350}
                  layout="vertical"
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">
                    {isRTL ? 'معدلات التحويل' : 'Conversion Rates'}
                  </h4>
                  <div className="space-y-2">
                    {bookingProcessData.map((stage, index) => {
                      const prevStage = index > 0 ? bookingProcessData[index - 1] : null;
                      const conversionRate = prevStage ? ((stage.completions / prevStage.completions) * 100).toFixed(1) : '100.0';
                      return (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>{isRTL ? stage.stageAr : stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stage.completions}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              parseFloat(conversionRate) > 80 ? 'bg-success/10 text-success' :
                              parseFloat(conversionRate) > 60 ? 'bg-warning/10 text-warning' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                              {conversionRate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5 text-primary" />
                    {isRTL ? 'مصفوفة أوقات اليوم' : 'Daily Time Matrix'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={serviceMatrixData}
                    config={matrixConfig}
                    xAxisDataKey={isRTL ? 'dayAr' : 'day'}
                    bars={[
                      { dataKey: 'morning', fill: 'hsl(var(--primary))' },
                      { dataKey: 'afternoon', fill: 'hsl(var(--secondary))' },
                      { dataKey: 'evening', fill: 'hsl(var(--success))' },
                    ]}
                    height={350}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <p className="text-lg font-bold text-primary">{serviceMatrixData.reduce((sum, d) => sum + d.morning, 0)}</p>
                        <p className="text-muted-foreground">{isRTL ? 'إجمالي الصباح' : 'Total Morning'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-secondary">{serviceMatrixData.reduce((sum, d) => sum + d.afternoon, 0)}</p>
                        <p className="text-muted-foreground">{isRTL ? 'إجمالي بعد الظهر' : 'Total Afternoon'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-success">{serviceMatrixData.reduce((sum, d) => sum + d.evening, 0)}</p>
                        <p className="text-muted-foreground">{isRTL ? 'إجمالي المساء' : 'Total Evening'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    {isRTL ? 'مصفوفة الخدمات' : 'Service Heatmap'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={serviceMatrixData}
                    config={matrixConfig}
                    xAxisDataKey={isRTL ? 'dayAr' : 'day'}
                    bars={[
                      { dataKey: 'swedish', fill: 'hsl(var(--primary))' },
                      { dataKey: 'deepTissue', fill: 'hsl(var(--secondary))' },
                      { dataKey: 'hotStone', fill: 'hsl(var(--success))' },
                      { dataKey: 'thai', fill: 'hsl(var(--warning))' },
                      { dataKey: 'aromatherapy', fill: 'hsl(var(--info))' },
                      { dataKey: 'reflexology', fill: 'hsl(var(--purple))' },
                    ]}
                    height={350}
                    layout="vertical"
                  />
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { key: 'swedish', label: isRTL ? 'السويدي' : 'Swedish', color: 'hsl(var(--primary))' },
                      { key: 'deepTissue', label: isRTL ? 'الأنسجة العميقة' : 'Deep Tissue', color: 'hsl(var(--secondary))' },
                      { key: 'hotStone', label: isRTL ? 'الأحجار الساخنة' : 'Hot Stone', color: 'hsl(var(--success))' },
                      { key: 'thai', label: isRTL ? 'التايلاندي' : 'Thai', color: 'hsl(var(--warning))' },
                      { key: 'aromatherapy', label: isRTL ? 'العلاج بالروائح' : 'Aromatherapy', color: 'hsl(var(--info))' },
                      { key: 'reflexology', label: isRTL ? 'علاج القدم' : 'Reflexology', color: 'hsl(var(--purple))' },
                    ].map((service, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: service.color }}></div>
                        <span>{service.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flow Tab */}
          <TabsContent value="flow" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  {isRTL ? 'تدفق العملاء' : 'Customer Flow Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FunnelChart
                    data={customerFlowData.map(item => ({
                      name: `${isRTL ? item.fromAr : item.from} → ${isRTL ? item.toAr : item.to}`,
                      value: item.value,
                      fill: `hsl(${(customerFlowData.indexOf(item) * 45) % 360}, 70%, 60%)`
                    }))}
                    config={flowConfig}
                    height={400}
                    showPercentages={true}
                    showValues={true}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AreaChart
                      data={[
                        { stage: isRTL ? 'مصادر' : 'Sources', value: 6300, flow: 6300 },
                        { stage: isRTL ? 'الموقع' : 'Website', value: 4200, flow: 2100 },
                        { stage: isRTL ? 'صفحات الخدمات' : 'Service Pages', value: 2800, flow: 1400 },
                        { stage: isRTL ? 'نموذج الحجز' : 'Booking Form', value: 1650, flow: 1150 },
                        { stage: isRTL ? 'الدفع' : 'Payment', value: 1320, flow: 330 },
                      ]}
                      config={{
                        value: { label: 'Active Flow / التدفق النشط', color: 'hsl(var(--primary))' },
                        flow: { label: 'Drop-off / التسرب', color: 'hsl(var(--muted))' }
                      }}
                      xAxisDataKey="stage"
                      areas={[
                        { dataKey: 'value', fill: 'hsl(var(--primary))', fillOpacity: 0.6, stackId: '1' },
                        { dataKey: 'flow', fill: 'hsl(var(--muted))', fillOpacity: 0.3, stackId: '1' },
                      ]}
                      height={300}
                    />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">{isRTL ? 'معدلات التحويل' : 'Conversion Rates'}</h4>
                      {customerFlowData.map((flow, index) => {
                        const conversionRate = index === 0 ? '100.0' : ((flow.value / customerFlowData[0].value) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {isRTL ? `${flow.fromAr} → ${flow.toAr}` : `${flow.from} → ${flow.to}`}
                                </p>
                                <p className="text-xs text-muted-foreground">{flow.value.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded text-xs font-medium ${
                              parseFloat(conversionRate) > 80 ? 'bg-success/10 text-success' :
                              parseFloat(conversionRate) > 50 ? 'bg-warning/10 text-warning' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                              {conversionRate}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Composite Tab */}
          <TabsContent value="composite" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-elegant">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isRTL ? 'اليوم' : 'Today'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{miniDashboardData.todayStats.bookings}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'حجز' : 'Bookings'}</p>
                  </div>
                  <BarChart
                    data={[{ value: miniDashboardData.todayStats.bookings, target: 50 }]}
                    config={miniConfig}
                    xAxisDataKey="value"
                    bars={[{ dataKey: 'value', fill: 'hsl(var(--primary))' }]}
                    height={80}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isRTL ? 'الإيرادات' : 'Revenue'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">${miniDashboardData.todayStats.revenue}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'اليوم' : 'Today'}</p>
                  </div>
                  <GaugeChart
                    value={miniDashboardData.todayStats.revenue}
                    max={6000}
                    config={miniConfig}
                    height={80}
                    colors={{
                      low: "hsl(var(--destructive))",
                      medium: "hsl(var(--warning))",
                      high: "hsl(var(--success))",
                      background: "hsl(var(--muted))",
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isRTL ? 'الرضا' : 'Satisfaction'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{miniDashboardData.todayStats.satisfaction}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'من 5' : 'out of 5'}</p>
                  </div>
                  <DonutChart
                    data={[{ name: 'Satisfaction', value: miniDashboardData.todayStats.satisfaction * 20, fill: 'hsl(var(--secondary))' }]}
                    config={miniConfig}
                    height={80}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{isRTL ? 'الاستغلال' : 'Utilization'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">{miniDashboardData.todayStats.utilization}%</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'معدل الاستغلال' : 'Capacity'}</p>
                  </div>
                  <PieChart
                    data={[{ name: 'Used', value: miniDashboardData.todayStats.utilization, fill: 'hsl(var(--warning))' }]}
                    config={miniConfig}
                    height={80}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {isRTL ? 'اتجاه الأسبوع' : 'Weekly Trend'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={miniDashboardData.weeklyTrend}
                    config={miniConfig}
                    xAxisDataKey={isRTL ? 'dayAr' : 'day'}
                    lines={[
                      { dataKey: 'value', stroke: 'hsl(var(--primary))' },
                    ]}
                    height={200}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    {isRTL ? 'أفضل الخدمات' : 'Top Services'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {miniDashboardData.topServices.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-primary/20 text-primary' :
                            index === 1 ? 'bg-secondary/20 text-secondary' :
                            'bg-success/20 text-success'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{isRTL ? service.nameAr : service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.bookings} {isRTL ? 'حجز' : 'bookings'}</p>
                          </div>
                        </div>
                        <div className="h-2 w-16 bg-muted rounded">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${(service.bookings / 18) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-primary" />
                  {isRTL ? 'مؤعلشر الأداء' : 'Performance Alerts'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {miniDashboardData.alertMetrics.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.status === 'success' ? 'bg-success/5 border-success' :
                      alert.status === 'warning' ? 'bg-warning/5 border-warning' :
                      'bg-destructive/5 border-destructive'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{isRTL ? alert.typeAr : alert.type.replace('_', ' ')}</p>
                          <p className={`text-lg font-bold ${
                            alert.status === 'success' ? 'text-success' :
                            alert.status === 'warning' ? 'text-warning' :
                            'text-destructive'
                          }`}>
                            {alert.value}{alert.type === 'avg_wait_time' ? 'm' : alert.type.includes('utilization') ? '%' : ''}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          alert.status === 'success' ? 'bg-success' :
                          alert.status === 'warning' ? 'bg-warning' :
                          'bg-destructive'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  {isRTL ? 'توقعات الاتجاه' : 'Trend Forecasting'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={trendForecastData.map(item => ({
                    month: isRTL ? item.monthAr : item.month,
                    actual: item.actual,
                    forecast: item.forecast,
                    upperBound: item.upperBound,
                    lowerBound: item.lowerBound,
                  }))}
                  config={trendConfig}
                  xAxisDataKey="month"
                  lines={[
                    { dataKey: 'actual', stroke: 'hsl(var(--primary))' },
                    { dataKey: 'forecast', stroke: 'hsl(var(--secondary))' },
                    { dataKey: 'upperBound', stroke: 'hsl(var(--success))' },
                    { dataKey: 'lowerBound', stroke: 'hsl(var(--warning))' },
                  ]}
                  height={400}
                />
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">{isRTL ? 'تحليل الاتجاه' : 'Trend Analysis'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-muted/10 rounded">
                      <p className="font-medium text-success">↗ {isRTL ? 'نمو متوقع' : 'Expected Growth'}</p>
                      <p className="text-muted-foreground">{isRTL ? '15% في الربع الثالث' : '15% in Q3'}</p>
                    </div>
                    <div className="p-3 bg-muted/10 rounded">
                      <p className="font-medium text-warning">📈 {isRTL ? 'ذروة الصيف' : 'Summer Peak'}</p>
                      <p className="text-muted-foreground">{isRTL ? 'يوليو 2100+' : 'July 2100+'}</p>
                    </div>
                    <div className="p-3 bg-muted/10 rounded">
                      <p className="font-medium text-info">📊 {isRTL ? 'نطاق الثقة' : 'Confidence Range'}</p>
                      <p className="text-muted-foreground">±15% {isRTL ? 'هامش خطأ' : 'margin'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {isRTL ? 'مؤعشرات النمو' : 'Growth Indicators'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={[
                      { month: 'Jan', monthAr: 'يناير', growth: 8.2 },
                      { month: 'Feb', monthAr: 'فبراير', growth: 12.5 },
                      { month: 'Mar', monthAr: 'مارس', growth: 9.6 },
                      { month: 'Apr', monthAr: 'أبريل', growth: 9.5 },
                      { month: 'May', monthAr: 'مايو', growth: 9.9 },
                      { month: 'Jun', monthAr: 'يونيو', growth: 9.6 },
                    ]}
                    config={{
                      growth: { label: 'Growth Rate % / معدل النمو', color: 'hsl(var(--primary))' }
                    }}
                    xAxisDataKey={isRTL ? 'monthAr' : 'month'}
                    areas={[
                      { dataKey: 'growth', fill: 'hsl(var(--primary))', fillOpacity: 0.3 },
                    ]}
                    height={250}
                  />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {isRTL ? 'اتجاهات الموسم' : 'Seasonal Patterns'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart
                    data={[
                      { subject: isRTL ? 'الربيع' : 'Spring', value: 75 },
                      { subject: isRTL ? 'الصيف' : 'Summer', value: 95 },
                      { subject: isRTL ? 'الخريف' : 'Fall', value: 68 },
                      { subject: isRTL ? 'الشتاء' : 'Winter', value: 52 },
                    ]}
                    config={{
                      value: { label: 'Seasonal Index / المؤعشر الموسمي', color: 'hsl(var(--primary))' }
                    }}
                    radarProps={[
                      { dataKey: 'value', stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary))', fillOpacity: 0.2 },
                    ]}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distributions Tab */}
          <TabsContent value="distributions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {isRTL ? 'توزيع العمر' : 'Age Distribution'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={ageDistributionData}
                    config={distributionConfig}
                    xAxisDataKey={isRTL ? 'ageGroupAr' : 'ageGroup'}
                    bars={[
                      { dataKey: 'count', fill: 'hsl(var(--primary))' },
                    ]}
                    height={300}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">{isRTL ? 'ملخص التوزيع' : 'Distribution Summary'}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium">{isRTL ? 'أعلى فئة: ' : 'Largest Group: '}36-45</p>
                        <p className="text-muted-foreground">32% {isRTL ? 'من العملاء' : 'of customers'}</p>
                      </div>
                      <div>
                        <p className="font-medium">{isRTL ? 'متوسط العمر: ' : 'Avg Age: '}38.5</p>
                        <p className="text-muted-foreground">{isRTL ? 'سنة' : 'years old'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {isRTL ? 'الإنفاق حسب العمر' : 'Spending by Age'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={ageDistributionData}
                    config={distributionConfig}
                    xAxisDataKey={isRTL ? 'ageGroupAr' : 'ageGroup'}
                    areas={[
                      { dataKey: 'avgSpending', fill: 'hsl(var(--secondary))', fillOpacity: 0.6 },
                    ]}
                    height={300}
                  />
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">{isRTL ? 'تحليل الإنفاق' : 'Spending Analysis'}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium">{isRTL ? 'أعلى إنفاق: ' : 'Highest Spending: '}46-55</p>
                        <p className="text-muted-foreground">$175 {isRTL ? 'متوسط' : 'average'}</p>
                      </div>
                      <div>
                        <p className="font-medium">{isRTL ? 'مجموع الإيرادات: ' : 'Total Revenue: '}</p>
                        <p className="text-muted-foreground">${(ageDistributionData.reduce((sum, item) => sum + (item.count * item.avgSpending), 0)).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  {isRTL ? 'توزيع نسبي' : 'Percentage Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  <PieChart
                    data={ageDistributionData.map(item => ({
                      name: isRTL ? item.ageGroupAr : item.ageGroup,
                      value: item.percentage,
                      fill: `hsl(${(ageDistributionData.indexOf(item) * 60) % 360}, 70%, 60%)`
                    }))}
                    config={distributionConfig}
                    height={300}
                  />

                  <DonutChart
                    data={ageDistributionData.map(item => ({
                      name: isRTL ? item.ageGroupAr : item.ageGroup,
                      value: item.count,
                      fill: `hsl(${(ageDistributionData.indexOf(item) * 60) % 360}, 70%, 60%)`
                    }))}
                    config={distributionConfig}
                    height={300}
                  />
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ageDistributionData.map((item, index) => (
                    <div key={index} className="p-3 bg-muted/20 rounded-lg text-center">
                      <div 
                        className="w-4 h-4 rounded mx-auto mb-2" 
                        style={{ backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }}
                      ></div>
                      <p className="text-sm font-medium">{isRTL ? item.ageGroupAr : item.ageGroup}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}% • {item.count} {isRTL ? 'عميل' : 'customers'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
