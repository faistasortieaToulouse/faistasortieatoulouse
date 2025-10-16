'use client';

import React, { useState, createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, X } from 'lucide-react'; 

// Schéma de validation
const formSchema = z.object({
  userPreferences: z.string().min(10, 'Veuillez décrire vos préférences avec plus de détails.'),
});

// -----------------------------------------------------
// MOCK DES UTILS ET DÉPENDANCES POUR LA COMPILATION EN UN SEUL FICHIER
// -----------------------------------------------------

// MOCK: Fonction utilitaire cn (classnames)
const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

// MOCK: class-variance-authority cva (très simplifié pour le Toast)
const cva = (base: string, { variants, defaultVariants }: { variants: any, defaultVariants: any }) => {
    return ({ variant }: { variant: string }) => {
        if (variant === 'destructive') {
            return cn(base, 'group border-red-500 bg-red-500 text-white');
        }
        return cn(base, 'border bg-white text-gray-900');
    };
};

// Type pour les props génériques de style
type ComponentProps = { children: React.ReactNode, className?: string };

// -----------------------------------------------------
// 1. COMPOSANTS UI DE BASE (Card, Button, Textarea, Skeleton, Form Mocks)
// -----------------------------------------------------

// 1.1. Button (avec gestion du style de chargement/désactivé)
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }>(({ className, children, disabled, ...props }, ref) => (
    <button
        ref={ref}
        disabled={disabled}
        className={cn(
            'flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            disabled ? 'bg-indigo-400 cursor-not-allowed text-white/80' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md',
            className
        )}
        {...props}
    >
        {children}
    </button>
));

// 1.2. Card Structure
const Card = ({ children, className }: ComponentProps) => (
    <div className={cn('rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50', className)}>
        {children}
    </div>
);
const CardHeader = ({ children, className }: ComponentProps) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
);
const CardTitle = ({ children, className }: ComponentProps) => (
    <h3 className={cn('font-bold tracking-tight text-xl', className)}>{children}</h3>
);
const CardDescription = ({ children, className }: ComponentProps) => (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>{children}</p>
);
const CardContent = ({ children, className }: ComponentProps) => (
    <div className={cn('p-6 pt-0', className)}>{children}</div>
);

// 1.3. Textarea
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn('flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] transition duration-150', className)}
        {...props}
    />
));

// 1.4. Form Components (Simplifié pour l'utilisation directe de register)
const Form = ({ children }: ComponentProps) => <>{children}</>;
const FormItem = ({ children, className }: ComponentProps) => <div className={cn('space-y-1', className)}>{children}</div>;
const FormLabel = ({ children, className }: ComponentProps) => <label className={cn('text-sm font-medium leading-none mb-1 block', className)}>{children}</label>;
const FormControl = ({ children }: ComponentProps) => <>{children}</>;
const FormMessage = ({ children, className }: ComponentProps) => <p className={cn('text-sm font-medium text-red-500 mt-1', className)}>{children}</p>;

// 1.5. Skeleton
const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)} />
);


// -----------------------------------------------------
// 2. SYSTÈME DE TOAST COMPLET
// -----------------------------------------------------

const ToastPrimitives = {
    Provider: ({ children }: ComponentProps) => <>{children}</>,
    Viewport: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props}>
            {children}
        </div>
    )),
    Root: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => {
        const rootRef = useRef<HTMLDivElement>(null);
        return (
            <div ref={rootRef} className={cn("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg", className)} {...props}>
                {children}
            </div>
        );
    }),
    Title: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm font-semibold", className)} {...props}>{children}</div>
    )),
    Description: React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm opacity-90", className)} {...props}>{children}</div>
    )),
    Close: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ className, children, onClick, ...props }, ref) => (
        <button ref={ref} className={cn("absolute right-2 top-2 rounded-md p-1 text-gray-500 transition-opacity hover:text-gray-900 focus:opacity-100", className)} onClick={onClick} {...props}>
            {children || <X className="h-4 w-4" />}
        </button>
    )),
    Action: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(({ className, children, ...props }, ref) => (
        <button ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium", className)} {...props}>
            {children}
        </button>
    )),
};

type ToastVariant = 'default' | 'destructive';
let TOAST_COUNT = 0;
function generateId() {
    return `toast-${TOAST_COUNT++}`;
}

type Toast = {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
    action?: React.ReactElement<typeof ToastPrimitives.Action>;
};

type ActionType =
    | { type: 'ADD_TOAST'; toast: Toast }
    | { type: 'DISMISS_TOAST'; toastId?: string };

const defaultToastOptions: Partial<Toast> = {
    duration: 5000,
};

const toastReducer = (state: Toast[], action: ActionType): Toast[] => {
    switch (action.type) {
        case 'ADD_TOAST':
            return [action.toast, ...state];
        case 'DISMISS_TOAST':
            const { toastId } = action;
            if (toastId) {
                return state.filter(t => t.id !== toastId);
            }
            return state;
        default:
            return state;
    }
};

const ToastContext = createContext<{ toasts: Toast[]; toast: (props: Partial<Toast>) => { id: string }; dismiss: (toastId?: string) => void } | undefined>(undefined);

function ToastProvider({ children }: ComponentProps) {
    const [state, dispatch] = useReducer(toastReducer, []);
    const ref = useRef<number[]>([]);

    const dismiss = (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId });

    const toast = (props: Partial<Toast>) => {
        const id = generateId();
        const toast = { ...defaultToastOptions, ...props, id };
        dispatch({ type: 'ADD_TOAST', toast });

        if (toast.duration) {
            const timeout = setTimeout(() => dismiss(id), toast.duration);
            ref.current.push(timeout as unknown as number);
        }

        return { id };
    };
