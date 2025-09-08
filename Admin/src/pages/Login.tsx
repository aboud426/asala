import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useDirection } from '@/contexts/DirectionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import hourglassSvg from '@/../public/hourglass-svgrepo-com.svg';
import compassSvg from '@/../public/compass-svgrepo-com.svg';
import museumSvg from '@/../public/museum-svgrepo-com.svg';
import medalSvg from '@/../public/1st-place-medal-svgrepo-com.svg';
import admissionTicketsSvg from '@/../public/admission-tickets-svgrepo-com.svg';
import artistPaletteSvg from '@/../public/artist-palette-svgrepo-com.svg';
import presentSvg from '@/../public/present-svgrepo-com.svg';
import shoppingcartSvg from '@/../public/shoppingcart-svgrepo-com.svg';


interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { isRTL } = useDirection();
    const { colorTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    /**
     * Controls the short "welcome" animation that plays once the user has
     * successfully authenticated. While the animation is running we collapse
     * the form section and expand the branding section, then redirect the user
     * to the dashboard.
     */
    const [playSuccessAnimation, setPlaySuccessAnimation] = useState(false);

    const form = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);

        // Simulate API call - replace with actual authentication logic
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For demo purposes, accept any email/password combination
            if (data.email && data.password) {
                toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');

                // Trigger the post-login animation: collapse the form and
                // enlarge the welcome section. After the animation finishes we
                // navigate to the dashboard.
                setPlaySuccessAnimation(true);
                setTimeout(() => navigate('/'), 2000); // keep in sync with transition duration
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            toast.error(isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Animated SVGs Component
    const AnimatedSvgs: React.FC = () => (
        <div className="relative w-[420px] h-[420px] mx-auto select-none">
            {/* Hourglass */}
            <img
                src={hourglassSvg}
                alt="hourglass"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 md:w-16"
            />

            {/* Compass */}
            <img
                src={compassSvg}
                alt="compass"
                className="absolute top-1/4 right-0 w-14 md:w-20"
            />

            {/* Museum */}
            <img
                src={museumSvg}
                alt="museum"
                className="absolute top-1/2 left-0 w-16 md:w-24 -translate-y-1/2"
            />

            {/* Medal */}
            <img
                src={medalSvg}
                alt="medal"
                className="absolute bottom-1/4 left-1/3 w-12 md:w-16 animate-pulse"
            />

            {/* Admission Tickets */}
            <img
                src={admissionTicketsSvg}
                alt="tickets"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 md:w-20"
            />

            {/* Artist Palette */}
            <img
                src={artistPaletteSvg}
                alt="palette"
                className="absolute top-1/3 left-1/4 w-14 md:w-20"
            />

            {/* Gift */}
            <img
                src={presentSvg}
                alt="present"
                className="absolute bottom-1/3 right-1/4 w-14 md:w-20"
            />

            {/* Shopping Cart */}
            <img
                src={shoppingcartSvg}
                alt="cart"
                className="absolute top-2/3 right-0 w-16 md:w-24 -translate-y-1/2"
            />
        </div>
    );

    return (
        <div className="min-h-screen flex">
            {/* Left side - Login Form */}
            <div
                className={`${isRTL ? 'order-2' : 'order-1'} transition-all duration-700 ease-in-out bg-background flex items-center justify-center p-8
                    ${playSuccessAnimation ? 'w-0 overflow-hidden opacity-0' : 'flex-1'}`}
            >
                <div className="w-full max-w-md space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-primary mb-4">
                            <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isRTL ? 'مرحباً بك' : 'Welcome Back'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRTL ? 'سجل دخولك للوصول إلى لوحة التحكم' : 'Sign in to access your admin dashboard'}
                        </p>
                    </div>

                    {/* Login Form */}
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-center">
                                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        rules={{
                                            required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message: isRTL ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format',
                                            },
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder={isRTL ? 'مثال: admin@asala.com' : 'e.g., admin@asala.com'}
                                                        {...field}
                                                        className="h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        rules={{
                                            required: isRTL ? 'كلمة المرور مطلوبة' : 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
                                            },
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isRTL ? 'كلمة المرور' : 'Password'}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                                                            {...field}
                                                            className="h-11 pr-10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {isRTL ? 'جاري تسجيل الدخول...' : 'Signing In...'}
                                            </>
                                        ) : (
                                            isRTL ? 'تسجيل الدخول' : 'Sign In'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}{' '}
                            <button className="text-primary hover:underline">
                                {isRTL ? 'إعادة تعيين' : 'Reset here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Logo/Branding */}
            <div
                className={`gradient-primary flex items-center justify-center p-8 transition-all duration-700 ease-in-out ${isRTL ? 'order-1' : 'order-2'}
                    ${playSuccessAnimation ? 'flex-[2]' : 'flex-1'}`}
            >
                <div className="text-center">
                    {/* When animation plays, show large welcome message instead of SVG clutter */}
                    {playSuccessAnimation ? (
                        <div className="animate-fade-in-up space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
                                {isRTL ? 'أهلاً وسهلاً' : 'Welcome'}
                            </h1>
                        </div>
                    ) : (
                        <>
                            <AnimatedSvgs />
                            <div className="mt-8 space-y-4">
                                <h2 className="text-2xl font-bold text-primary-foreground">
                                    {isRTL ? 'لوحة تحكم أصالة' : 'Asala Admin Dashboard'}
                                </h2>
                                <p className="text-primary-foreground/80 max-w-md mx-auto leading-relaxed">
                                    {isRTL
                                        ? 'منصة إدارية شاملة لإدارة المتاجر والمنتجات والعملاء بكفاءة عالية ومرونة تامة'
                                        : 'A comprehensive admin platform for managing stores, products, and customers with high efficiency and complete flexibility'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
