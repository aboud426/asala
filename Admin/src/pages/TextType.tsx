import React, { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
}

const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed = 100,
  pauseDuration = 2000,
  showCursor = true,
  cursorCharacter = '|'
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursorState, setShowCursorState] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentText = text[currentTextIndex];

    if (isTyping) {
      if (displayedText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, typingSpeed / 2);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % text.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentTextIndex, text, typingSpeed, pauseDuration]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursorState(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return (
    <div className="font-bold text-4xl md:text-6xl text-primary-foreground">
      {displayedText}
      {showCursor && (
        <span className={`${showCursorState ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          {cursorCharacter}
        </span>
      )}
    </div>
  );
};

export default TextType;
