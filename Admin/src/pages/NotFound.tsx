import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDirection } from '@/contexts/DirectionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  TypewriterText,
  StaggeredText,
  CharacterFade,
  GradientText,
  SlidingText,
  WaveText
} from '@/components/ui/animated-text';
import {
  Home,
  ArrowLeft,
  ArrowRight,
  Search,
  RefreshCw,
  AlertTriangle,
  Compass,
  Mail
} from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();
  const { isRTL } = useDirection();
  const { theme, colorTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-8"></div>
          <div className="w-48 h-8 bg-muted rounded mx-auto mb-4"></div>
          <div className="w-64 h-6 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-10">
          <div className="w-32 h-32 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <div className="w-24 h-24 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-5">
          <div className="w-40 h-40 rounded-full bg-primary animate-ping"
            style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-1/3 left-1/4 opacity-10">
          <div className="w-28 h-28 rounded-full bg-primary/30 animate-pulse"
            style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      <Card className={cn(
        "relative z-10 max-w-2xl w-full shadow-elegant border-0",
        "bg-card/80 backdrop-blur-sm"
      )}>
        <CardContent className="p-12 text-center space-y-8">
          {/* 404 Number with animations */}
          <div className="relative">
            <h1 className={cn(
              "text-8xl md:text-9xl font-extrabold text-primary/20 select-none",
              isRTL ? "font-cairo" : "font-inter"
            )}>
              <TypewriterText
                text="404"
                speed={300}
                delay={500}
                className="text-primary/20"
                showCursor={false}
              />
            </h1>

            {/* Floating error icon */}
            <div className="absolute top-4 right-4 opacity-60 animate-bounce">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h2 className={cn(
              "text-3xl md:text-4xl font-bold text-foreground",
              isRTL ? "font-cairo" : "font-inter"
            )}>
              <GradientText
                text={isRTL ? "الصفحة غير موجودة" : "Page Not Found"}
                gradient="from-primary via-primary-light to-primary-dark"
                className="bg-clip-text text-transparent bg-gradient-to-r"
              />
            </h2>
{/* 
            <p className={cn(
              "text-lg text-muted-foreground max-w-md mx-auto leading-relaxed",
              isRTL ? "font-cairo" : "font-inter"
            )}>
              <CharacterFade
                text={isRTL
                  ? "عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها. قد تكون محذوفة أو تم نقلها إلى موقع آخر."
                  : "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect."
                }
                delay={1200}
                stagger={15}
              />
            </p> */}
          </div>

          {/* Attempted path display
          {location.pathname && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <p className={cn(
                "text-sm text-muted-foreground mb-2",
                isRTL ? "font-cairo" : "font-inter"
              )}>
                <StaggeredText
                  text={isRTL ? "الصفحة المطلوبة:" : "Attempted to access:"}
                  delay={1800}
                />
              </p>
              <code className={cn(
                "text-sm font-mono px-3 py-1 bg-background/50 rounded border text-destructive",
                isRTL ? "font-courier" : ""
              )}>
                <TypewriterText
                  text={location.pathname}
                  speed={50}
                  delay={2200}
                  showCursor={false}
                />
              </code>
            </div>
          )} */}

          {/* Action buttons */}
          <div className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center items-center pt-6",
            isRTL ? "sm:flex-row-reverse" : ""
          )}>
            <Button
              asChild
              size="lg"
              className={cn(
                "px-8 py-3 rounded-lg font-semibold transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden",
                "bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary",
                isRTL ? "flex-row-reverse" : ""
              )}
            >
              <Link to="/">
                <div className={cn(
                  "flex items-center gap-2",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  <Home className="w-5 h-5" />
                  <SlidingText
                    text={isRTL ? "العودة للرئيسية" : "Back to Home"}
                    direction={isRTL ? "right" : "left"}
                    delay={2800}
                  />
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className={cn(
                "px-8 py-3 rounded-lg font-semibold transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 border-primary/30 hover:border-primary",
                "hover:bg-primary/5",
                isRTL ? "flex-row-reverse" : ""
              )}
              onClick={() => window.history.back()}
            >
              <div className={cn(
                "flex items-center gap-2",
                isRTL ? "flex-row-reverse" : ""
              )}>
                <BackIcon className="w-5 h-5" />
                <SlidingText
                  text={isRTL ? "العودة للخلف" : "Go Back"}
                  direction={isRTL ? "left" : "right"}
                  delay={3000}
                />
              </div>
            </Button>
          </div>

          {/* Additional help links */}
          {/* <div className="pt-8 border-t border-border/30">
            <p className={cn(
              "text-sm text-muted-foreground mb-4",
              isRTL ? "font-cairo" : "font-inter"
            )}>
              <StaggeredText
                text={isRTL ? "هل تحتاج مساعدة إضافية؟" : "Need additional help?"}
                delay={3500}
              />
            </p>

            <div className={cn(
              "flex flex-wrap gap-4 justify-center text-sm",
              isRTL ? "flex-row-reverse" : ""
            )}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  isRTL ? "flex-row-reverse" : ""
                )}
                asChild
              >
                <Link to="/dashboard">
                  <div className={cn(
                    "flex items-center gap-2",
                    isRTL ? "flex-row-reverse" : ""
                  )}>
                    <Compass className="w-4 h-4" />
                    <WaveText
                      text={isRTL ? "لوحة التحكم" : "Dashboard"}
                      delay={4000}
                      stagger={80}
                    />
                  </div>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors",
                  isRTL ? "flex-row-reverse" : ""
                )}
                onClick={() => window.location.reload()}
              >
                <div className={cn(
                  "flex items-center gap-2",
                  isRTL ? "flex-row-reverse" : ""
                )}>
                  <RefreshCw className="w-4 h-4" />
                  <WaveText
                    text={isRTL ? "إعادة التحميل" : "Refresh"}
                    delay={4200}
                    stagger={80}
                  />
                </div>
              </Button>
            </div> */}
          {/* </div> */}

          {/* Theme and direction indicators (subtle) */}
          <div className="absolute top-4 left-4 flex gap-2 opacity-30">
            <div className={cn(
              "w-3 h-3 rounded-full",
              theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
            )} title={`Theme: ${theme}`} />
            <div className={cn(
              "w-3 h-3 rounded-full",
              isRTL ? 'bg-amber-400' : 'bg-blue-400'
            )} title={`Direction: ${isRTL ? 'RTL' : 'LTR'}`} />
            <div className="w-3 h-3 rounded-full bg-primary" title={`Color: ${colorTheme}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
