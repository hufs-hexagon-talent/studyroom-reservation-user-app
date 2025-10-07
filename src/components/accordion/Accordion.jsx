'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { ChevronDown } from 'lucide-react';

const AccordionCtx = createContext(null);

function useAccordionCtx() {
  const ctx = useContext(AccordionCtx);
  if (!ctx)
    throw new Error('Accordion components must be used within <Accordion>');
  return ctx;
}

export function Accordion({
  type = 'single', // "single" | "multiple"
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
  children,
}) {
  const isControlled = value !== undefined;

  const toSet = v =>
    new Set(v === undefined ? [] : Array.isArray(v) ? v : v ? [v] : []);
  const [internal, setInternal] = useState(toSet(defaultValue));
  const openValues = isControlled ? toSet(value) : internal;

  const triggersRef = useRef([]);

  const registerTrigger = useCallback(ref => {
    triggersRef.current.push(ref);
    return triggersRef.current.length - 1;
  }, []);

  const focusByIndex = useCallback(index => {
    const list = triggersRef.current;
    if (!list.length) return;
    const clamped = (index + list.length) % list.length;
    list[clamped].current?.focus();
  }, []);

  const setNext = useCallback(
    next => {
      if (isControlled) {
        const out = type === 'single' ? [...next][0] ?? '' : [...next];
        onValueChange?.(out);
      } else {
        setInternal(next);
        if (onValueChange) {
          const out = type === 'single' ? [...next][0] ?? '' : [...next];
          onValueChange(out);
        }
      }
    },
    [isControlled, onValueChange, type],
  );

  const toggle = useCallback(
    v => {
      const next = new Set(openValues);
      if (type === 'single') {
        if (next.has(v)) {
          if (collapsible) next.clear();
        } else {
          next.clear();
          next.add(v);
        }
      } else {
        if (next.has(v)) next.delete(v);
        else next.add(v);
      }
      setNext(next);
    },
    [openValues, setNext, type, collapsible],
  );

  const isOpen = useCallback(v => openValues.has(v), [openValues]);

  const ctx = useMemo(
    () => ({
      type,
      collapsible,
      openValues,
      toggle,
      isOpen,
      registerTrigger,
      focusByIndex,
    }),
    [
      type,
      collapsible,
      openValues,
      toggle,
      isOpen,
      registerTrigger,
      focusByIndex,
    ],
  );

  // 리렌더마다 트리거 목록 재구성(중복 방지)
  useEffect(() => {
    triggersRef.current = [];
  });

  return (
    <div data-slot="accordion" className={className}>
      <AccordionCtx.Provider value={ctx}>{children}</AccordionCtx.Provider>
    </div>
  );
}

export function AccordionItem({ value, className, children }) {
  const { isOpen } = useAccordionCtx();
  const state = isOpen(value) ? 'open' : 'closed';

  return (
    <div
      data-slot="accordion-item"
      data-state={state}
      className={['border-b last:border-b-0', className]
        .filter(Boolean)
        .join(' ')}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          __itemValue: value,
          'data-state': state,
        });
      })}
    </div>
  );
}

export function AccordionTrigger({
  className,
  children,
  __itemValue,
  ...props
}) {
  const { toggle, isOpen, registerTrigger, focusByIndex } = useAccordionCtx();
  if (!__itemValue)
    throw new Error('<AccordionTrigger> must be inside <AccordionItem>');

  const open = isOpen(__itemValue);
  const btnRef = useRef(null);
  const indexRef = useRef(-1);

  useEffect(() => {
    indexRef.current = registerTrigger(btnRef);
  }, [registerTrigger]);

  const panelId = useId();
  const buttonId = useId();

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusByIndex(indexRef.current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusByIndex(indexRef.current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusByIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusByIndex(9999);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(__itemValue);
    }
  };

  return (
    <div className="flex">
      <button
        ref={btnRef}
        id={buttonId}
        data-slot="accordion-trigger"
        data-state={open ? 'open' : 'closed'}
        className={[
          'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium',
          'transition-all outline-none hover:underline',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        ].join(' ')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => toggle(__itemValue)}
        onKeyDown={onKeyDown}
        {...props}>
        {children}
        <ChevronDown
          aria-hidden
          className={[
            'pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
            'text-muted-foreground',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

export function AccordionContent({
  className,
  children,
  __itemValue,
  ...divProps
}) {
  const { isOpen } = useAccordionCtx();
  if (!__itemValue)
    throw new Error('<AccordionContent> must be inside <AccordionItem>');
  const open = isOpen(__itemValue);

  return (
    <div
      role="region"
      data-slot="accordion-content"
      data-state={open ? 'open' : 'closed'}
      className={[
        'overflow-hidden text-sm transition-[grid-template-rows] duration-300 ease-in-out',
        open ? 'grid grid-rows-[1fr]' : 'grid grid-rows-[0fr]',
        className,
      ].join(' ')}
      {...divProps}>
      <div className="min-h-0 pt-0 pb-4 overflow-hidden">{children}</div>
    </div>
  );
}
