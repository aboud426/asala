import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Typewriter Effect
interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  cursorClassName?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  showCursor = true,
  cursorClassName = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorState, setShowCursorState] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, speed, text]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursorState(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      {showCursor && (
        <span
          className={cn(
            'inline-block w-0.5 bg-current ml-0.5',
            showCursorState ? 'opacity-100' : 'opacity-0',
            'transition-opacity duration-100',
            cursorClassName
          )}
          style={{ height: '1.2em' }}
        />
      )}
    </span>
  );
};

// Staggered Fade In Text
interface StaggeredTextProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
}

export const StaggeredText: React.FC<StaggeredTextProps> = ({
  text,
  delay = 0,
  stagger = 100,
  className = '',
  wordClassName = ''
}) => {
  const words = text.split(' ');
  
  return (
    <span className={cn('inline-block', className)}>
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            'inline-block opacity-0 translate-y-4',
            'animate-[fadeInUp_0.6s_ease-out_forwards]',
            wordClassName
          )}
          style={{
            animationDelay: `${delay + index * stagger}ms`
          }}
        >
          {word}
          {index < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
};

// Character by Character Fade In
interface CharacterFadeProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  charClassName?: string;
}

export const CharacterFade: React.FC<CharacterFadeProps> = ({
  text,
  delay = 0,
  stagger = 50,
  className = '',
  charClassName = ''
}) => {
  return (
    <span className={cn('inline-block', className)}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={cn(
            'inline-block opacity-0',
            'animate-[fadeIn_0.8s_ease-out_forwards]',
            charClassName
          )}
          style={{
            animationDelay: `${delay + index * stagger}ms`
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

// Gradient Animated Text
interface GradientTextProps {
  text: string;
  className?: string;
  gradient?: string;
  animationDuration?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  className = '',
  gradient = 'from-blue-400 via-purple-500 to-purple-600',
  animationDuration = '3s'
}) => {
  return (
    <span
      className={cn(
        `bg-gradient-to-r ${gradient} bg-clip-text text-transparent`,
        'animate-gradient-shift bg-[length:400%_400%]',
        className
      )}
      style={{ animationDuration }}
    >
      {text}
    </span>
  );
};

// Sliding Text (Left to Right or Right to Left)
interface SlidingTextProps {
  text: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: string;
  className?: string;
}

export const SlidingText: React.FC<SlidingTextProps> = ({
  text,
  direction = 'left',
  delay = 0,
  duration = '0.8s',
  className = ''
}) => {
  const getTransformClass = () => {
    switch (direction) {
      case 'left':
        return 'translate-x-[-100px]';
      case 'right':
        return 'translate-x-[100px]';
      case 'up':
        return 'translate-y-[-50px]';
      case 'down':
        return 'translate-y-[50px]';
      default:
        return 'translate-x-[-100px]';
    }
  };

  return (
    <span
      className={cn(
        'inline-block opacity-0',
        getTransformClass(),
        'animate-[slideInFade_forwards]',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: duration,
        animationFillMode: 'forwards'
      }}
    >
      {text}
    </span>
  );
};

// Bounce Text
interface BounceTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const BounceText: React.FC<BounceTextProps> = ({
  text,
  delay = 0,
  className = ''
}) => {
  return (
    <span
      className={cn(
        'inline-block animate-bounce',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '1s'
      }}
    >
      {text}
    </span>
  );
};

// Wave Text Animation
interface WaveTextProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
}

export const WaveText: React.FC<WaveTextProps> = ({
  text,
  delay = 0,
  stagger = 100,
  className = ''
}) => {
  return (
    <span className={cn('inline-block', className)}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block animate-bounce"
          style={{
            animationDelay: `${delay + index * stagger}ms`,
            animationDuration: '0.6s',
            animationIterationCount: '1'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};
