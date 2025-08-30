import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings as SettingsIcon,
  Store,
  Bell,
  Shield,
  Palette,
  Globe,
  User,
  CreditCard,
  Mail,
  Smartphone,
  Save,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useTheme } from '@/contexts/ThemeContext';

const Settings: React.FC = () => {
  const { isRTL } = useDirection();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailCustomers: false,
    smsOrders: true,
    pushNotifications: true,
  });

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

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {isRTL ? 'عام' : 'General'}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {isRTL ? 'الأمان' : 'Security'}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {isRTL ? 'المظهر' : 'Appearance'}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {isRTL ? 'الفواتير' : 'Billing'}
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات المتجر' : 'Store Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">
                      {isRTL ? 'اسم المتجر' : 'Store Name'}
                    </Label>
                    <Input id="store-name" defaultValue="Asala Store" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">
                      {isRTL ? 'البريد الإلكتروني' : 'Store Email'}
                    </Label>
                    <Input id="store-email" defaultValue="admin@asala.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-description">
                    {isRTL ? 'وصف المتجر' : 'Store Description'}
                  </Label>
                  <Textarea 
                    id="store-description" 
                    rows={3}
                    defaultValue="Premium e-commerce platform for modern businesses"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {isRTL ? 'العملة' : 'Currency'}
                    </Label>
                    <Select defaultValue="usd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="sar">SAR (ر.س)</SelectItem>
                        <SelectItem value="aed">AED (د.إ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">
                      {isRTL ? 'المنطقة الزمنية' : 'Timezone'}
                    </Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="riyadh">Riyadh (GMT+3)</SelectItem>
                        <SelectItem value="dubai">Dubai (GMT+4)</SelectItem>
                        <SelectItem value="cairo">Cairo (GMT+2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {isRTL ? 'الملف الشخصي' : 'Profile Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">
                      {isRTL ? 'الاسم الأول' : 'First Name'}
                    </Label>
                    <Input id="first-name" defaultValue="Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">
                      {isRTL ? 'اسم العائلة' : 'Last Name'}
                    </Label>
                    <Input id="last-name" defaultValue="User" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input id="phone" defaultValue="+966 50 123 4567" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gradient-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {isRTL ? 'إشعارات الطلبات عبر البريد الإلكتروني' : 'Email Order Notifications'}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'احصل على إشعارات عند وصول طلبات جديدة'
                        : 'Get notified when new orders are received'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailOrders}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, emailOrders: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {isRTL ? 'إشعارات العملاء الجدد' : 'New Customer Notifications'}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'إشعارات عند تسجيل عملاء جدد'
                        : 'Notifications when new customers register'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailCustomers}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, emailCustomers: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {isRTL ? 'إشعارات SMS للطلبات' : 'SMS Order Notifications'}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'إشعارات نصية للطلبات المهمة'
                        : 'Text notifications for important orders'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsOrders}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, smsOrders: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {isRTL ? 'الإشعارات الفورية' : 'Push Notifications'}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'إشعارات فورية في المتصفح'
                        : 'Browser push notifications'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gradient-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                  </Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                  </Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {isRTL ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
                  </Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="font-medium">
                      {isRTL ? 'التحقق بخطوتين' : 'Two-Factor Authentication'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'أضف طبقة أمان إضافية لحسابك'
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                  </div>
                  <Button variant="outline">
                    {isRTL ? 'تفعيل' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gradient-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'تحديث كلمة المرور' : 'Update Password'}
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  {isRTL ? 'إعدادات المظهر' : 'Appearance Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">
                      {isRTL ? 'السمة' : 'Theme'}
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRTL 
                        ? 'اختر بين الوضع الفاتح والداكن'
                        : 'Choose between light and dark mode'
                      }
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}>
                        <div className="space-y-2">
                          <div className="h-4 bg-white rounded border"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">
                          {isRTL ? 'فاتح' : 'Light'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-800 rounded border"></div>
                          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                        </div>
                        <p className="text-sm font-medium mt-2">
                          {isRTL ? 'داكن' : 'Dark'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="font-medium">
                      {isRTL ? 'اللغة والاتجاه' : 'Language & Direction'}
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRTL 
                        ? 'اختر لغة الواجهة واتجاه النص'
                        : 'Choose interface language and text direction'
                      }
                    </p>
                    <Select defaultValue={isRTL ? 'ar' : 'en'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (LTR)</SelectItem>
                        <SelectItem value="ar">العربية (RTL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gradient-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {isRTL ? 'معلومات الفواتير' : 'Billing Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-success">
                        {isRTL ? 'الخطة الحالية: المحترف' : 'Current Plan: Professional'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? '$99.99 شهرياً' : '$99.99 per month'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                  </Label>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">**** **** **** 4242</p>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? 'تنتهي في 12/25' : 'Expires 12/25'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {isRTL ? 'تحديث' : 'Update'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gradient-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;