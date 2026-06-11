import clsx from 'clsx';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }[variant];
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60',
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputCx =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCx, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputCx, 'min-h-[80px]', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputCx, 'bg-white', props.className)} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-lg border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {children}
    </div>
  );
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Hidden: 'bg-amber-100 text-amber-700',
  Draft: 'bg-slate-100 text-slate-600',
  Archived: 'bg-red-100 text-red-700',
  Available: 'bg-green-100 text-green-700',
  'On Request': 'bg-blue-100 text-blue-700',
};

export function Badge({ children }: { children: string }) {
  return (
    <span
      className={clsx(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        statusColors[children] ?? 'bg-slate-100 text-slate-600',
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div className="py-10 text-center text-sm text-slate-400">{label}</div>;
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {action}
    </div>
  );
}
