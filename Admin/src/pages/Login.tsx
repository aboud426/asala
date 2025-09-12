import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { employeeAuthService } from '@/services/employeeAuthService';
import {
    TypewriterText,
    StaggeredText,
    CharacterFade,
    GradientText,
    SlidingText,
    WaveText
} from '@/components/ui/animated-text';
import TextType from './TextType';
import { LogoLoop, type LogoItem } from '@/components/LogoLoop.tsx';
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
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberPassword, setRememberPassword] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState<{ email: string, password: string }[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    // Refs for managing focus and click outside detection
    const emailInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
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

    // Load saved credentials from localStorage on component mount
    useEffect(() => {
        const savedCredentialsStr = localStorage.getItem('asala_saved_credentials');
        if (savedCredentialsStr) {
            try {
                const credentials = JSON.parse(savedCredentialsStr);
                setSavedCredentials(credentials);
            } catch (error) {
                console.error('Error parsing saved credentials:', error);
                localStorage.removeItem('asala_saved_credentials');
            }
        }
    }, []);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showSuggestions &&
                suggestionsRef.current &&
                emailInputRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                !emailInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSuggestions]);

    // Filter credentials based on input
    const filteredCredentials = savedCredentials.filter(cred =>
        cred.email.toLowerCase().includes(form.watch('email').toLowerCase())
    );

    // Helper functions for credential suggestions
    const handleSuggestionClick = useCallback((credential: { email: string, password: string }, index?: number) => {
        form.setValue('email', credential.email);
        form.setValue('password', credential.password);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setRememberPassword(true);

        // Focus back to the email input for better UX
        setTimeout(() => {
            emailInputRef.current?.focus();
        }, 100);
    }, [form]);

    // Handle keyboard navigation for suggestions
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!showSuggestions || filteredCredentials.length === 0) return;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                        prev < filteredCredentials.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setSelectedSuggestionIndex(prev =>
                        prev > 0 ? prev - 1 : filteredCredentials.length - 1
                    );
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < filteredCredentials.length) {
                        handleSuggestionClick(filteredCredentials[selectedSuggestionIndex]);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                    emailInputRef.current?.focus();
                    break;
            }
        };

        if (showSuggestions) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showSuggestions, selectedSuggestionIndex, filteredCredentials, handleSuggestionClick]);

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);

        try {
            // Call the actual employee authentication API
            const authResponse = await employeeAuthService.login({
                email: data.email,
                password: data.password
            });

            // Use the AuthContext login method to save to cookies and update state
            login(authResponse);

            // Save or update credentials in localStorage based on user preference
            if (rememberPassword) {
                const newCredential = { email: data.email, password: data.password };
                const existingCredentials = savedCredentials.filter(cred => cred.email !== data.email);
                const updatedCredentials = [newCredential, ...existingCredentials].slice(0, 5); // Keep only 5 most recent
                localStorage.setItem('asala_saved_credentials', JSON.stringify(updatedCredentials));
                setSavedCredentials(updatedCredentials);
            }

            // Show success message
            toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Login successful');

            // Trigger the post-login animation: collapse the form and
            // enlarge the welcome section. After the animation finishes we
            // navigate to the dashboard.
            setPlaySuccessAnimation(true);
            setTimeout(() => navigate('/'), 2000); // keep in sync with transition duration

        } catch (error) {
            console.error('Login error:', error);

            // Show error message from API or generic message
            const errorMessage = error instanceof Error
                ? error.message
                : (isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed');

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailFocus = () => {
        if (savedCredentials.length > 0) {
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
        }
    };

    const handleEmailBlur = () => {
        // Don't hide suggestions immediately to allow clicking on them
        // The click outside handler will take care of hiding them
    };

    const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredCredentials.length > 0) {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setSelectedSuggestionIndex(0);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setSelectedSuggestionIndex(filteredCredentials.length - 1);
                    break;
                case 'Escape':
                    event.preventDefault();
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                    break;
            }
        }
    };

    const handleSuggestionMouseEnter = (index: number) => {
        setSelectedSuggestionIndex(index);
    };

    const handleSuggestionMouseLeave = () => {
        setSelectedSuggestionIndex(-1);
    };

    // Animated SVGs Component using LogoLoop
    const AnimatedSvgs: React.FC = () => {
        const logoItems: LogoItem[] = [
            {
                src: hourglassSvg,
                alt: 'hourglass',
                title: 'Hourglass'
            },
            {
                src: compassSvg,
                alt: 'compass',
                title: 'Compass'
            },
            {
                src: museumSvg,
                alt: 'museum',
                title: 'Museum'
            },
            {
                src: medalSvg,
                alt: 'medal',
                title: 'Medal'
            },
            {
                src: admissionTicketsSvg,
                alt: 'tickets',
                title: 'Admission Tickets'
            },
            {
                src: artistPaletteSvg,
                alt: 'palette',
                title: 'Artist Palette'
            },
            {
                src: presentSvg,
                alt: 'present',
                title: 'Present'
            },
            {
                src: shoppingcartSvg,
                alt: 'cart',
                title: 'Shopping Cart'
            }
        ];

        return (
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <LogoLoop
                    logos={logoItems}
                    speed={50}
                    direction={isRTL ? 'left' : 'right'}
                    logoHeight={200}
                    gap={56}
                    pauseOnHover={true}
                    scaleOnHover={true}
                    fadeOut={true}
                    className="opacity-80 hover:opacity-100 transition duration-500"
                    ariaLabel="Platform services"
                />
            </div>
        );
    };

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
                            <StaggeredText
                                text={isRTL ? 'مرحباً بك' : 'Welcome Back'}
                                delay={800}
                                stagger={80}
                            />
                        </h1>
                        <p className="text-muted-foreground">
                            <StaggeredText
                                text={isRTL ? 'سجل دخولك للوصول إلى لوحة التحكم' : 'Sign in to access your admin dashboard'}
                                delay={800}
                                stagger={80}
                            />
                        </p>
                    </div>

                    {/* Login Form */}
                    <Card className="border-border/50 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-center">
                                <TypewriterText
                                    text={isRTL ? 'تسجيل الدخول' : 'Sign In'}
                                    speed={100}
                                    delay={1500}
                                    showCursor={false}
                                />
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
                                                    <div className="relative">
                                                        <Input
                                                            ref={emailInputRef}
                                                            type="text"
                                                            autoComplete="off"
                                                            placeholder={isRTL ? 'مثال: admin@asala.com' : 'e.g., admin@asala.com'}
                                                            {...field}
                                                            className="h-11"
                                                            onFocus={handleEmailFocus}
                                                            onBlur={handleEmailBlur}
                                                            onKeyDown={handleEmailKeyDown}
                                                            role="combobox"
                                                            aria-expanded={showSuggestions}
                                                            aria-haspopup="listbox"
                                                            aria-autocomplete="list"
                                                            aria-describedby={showSuggestions ? "email-suggestions" : undefined}
                                                        />
                                                        {/* Suggestions Dropdown */}
                                                        {showSuggestions && filteredCredentials.length > 0 && (
                                                            <div
                                                                ref={suggestionsRef}
                                                                id="email-suggestions"
                                                                className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                                                                role="listbox"
                                                                aria-label={isRTL ? "اقتراحات البريد الإلكتروني المحفوظة" : "Saved email suggestions"}
                                                            >
                                                                {filteredCredentials.map((credential, index) => (
                                                                    <div
                                                                        key={`${credential.email}-${index}`}
                                                                        className={`px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${selectedSuggestionIndex === index
                                                                                ? 'bg-accent text-accent-foreground'
                                                                                : 'hover:bg-muted'
                                                                            }`}
                                                                        onClick={() => handleSuggestionClick(credential, index)}
                                                                        onMouseEnter={() => handleSuggestionMouseEnter(index)}
                                                                        onMouseLeave={handleSuggestionMouseLeave}
                                                                        role="option"
                                                                        aria-selected={selectedSuggestionIndex === index}
                                                                        tabIndex={-1}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                                    {credential.email}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {isRTL ? 'كلمة المرور محفوظة' : 'Saved password'}
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                ●●●●●●
                                                                            </div>
                                                                            {selectedSuggestionIndex === index && (
                                                                                <div className="ml-2 text-xs text-accent-foreground">
                                                                                    ⏎
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
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

                                    {/* Remember Password Checkbox */}
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <Checkbox
                                            id="remember-password"
                                            checked={rememberPassword}
                                            onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="remember-password"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {isRTL ? 'حفظ كلمة المرور' : 'Remember Password'}
                                        </label>
                                    </div>

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
                            <SlidingText
                                text={isRTL ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
                                direction="left"
                                delay={2500}
                                duration="0.6s"
                            />{' '}
                            <button className="text-primary hover:underline transition-all duration-200 hover:scale-105">
                                <SlidingText
                                    text={isRTL ? 'إعادة تعيين' : 'Reset here'}
                                    direction="right"
                                    delay={2800}
                                    duration="0.6s"
                                />
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
                                <WaveText
                                    text={isRTL ? 'أهلاً وسهلاً' : 'Welcome'}
                                    delay={0}
                                    stagger={150}
                                    className="animate-glow-pulse"
                                />
                            </h1>
                        </div>
                    ) : (
                        <>
                            {/* Note: Make sure the font you're using supports all the variable properties. 
                                React Bits does not take responsibility for the fonts used */}
                            <div>
                                <TextType
                                    text={isRTL ?
                                        ["أصالة", "منصة إدارية شاملة", "مرحباً بك!"] :
                                        ["Asala", "Admin Platform", "Welcome!"]}
                                    typingSpeed={75}
                                    pauseDuration={1500}
                                    showCursor={true}
                                    cursorCharacter="|"
                                />
                            </div>
                            <AnimatedSvgs />
                            {/* <div className="mt-8 space-y-4">
                                <h2 className="text-2xl font-bold text-primary-foreground">
                                    <SlidingText
                                        text={isRTL ? 'لوحة تحكم أصالة' : 'Asala Admin Dashboard'}
                                        direction="up"
                                        delay={300}
                                        duration="1.2s"
                                    />
                                </h2>
                                <p className="text-primary-foreground/80 max-w-md mx-auto leading-relaxed">
                                    <CharacterFade
                                        text={isRTL
                                            ? 'منصة إدارية شاملة لإدارة المتاجر والمنتجات والعملاء بكفاءة عالية ومرونة تامة'
                                            : 'A comprehensive admin platform for managing stores, products, and customers with high efficiency and complete flexibility'}
                                        delay={1000}
                                        stagger={25}
                                    />
                                </p>
                            </div> */}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
