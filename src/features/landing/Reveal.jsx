import { useEffect, useRef, useState } from 'react';

export default function Reveal({
  as: Element = 'div',
  className = '',
  delay = 0,
  children,
  ...props
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={elementRef}
      className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Element>
  );
}
