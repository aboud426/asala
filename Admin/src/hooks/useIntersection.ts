import { useEffect, useRef, useState } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  threshold?: number | number[];
}

interface UseIntersectionResult {
  ref: (element: Element | null) => void;
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
}

export const useIntersection = (options: UseIntersectionOptions = {}): UseIntersectionResult => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const ref = (element: Element | null) => {
    if (elementRef.current) {
      observerRef.current?.unobserve(elementRef.current);
    }

    elementRef.current = element;

    if (element) {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0,
        ...options,
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return { ref, entry, isIntersecting };
};

export default useIntersection;
