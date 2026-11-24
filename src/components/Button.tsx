import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type ButtonVariant = 'create' | 'assignment' | 'success' | 'info' | 'neutral' | 'cancel' | 'danger' | 'logout';
type ButtonAppearance = 'solid' | 'soft' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'custom';

// El propósito define el color; el tamaño y la presentación se eligen por separado.
const colors: Record<ButtonVariant, Record<ButtonAppearance, string>> = {
  create: {
    solid: 'bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 border-orange-400 focus-visible:outline-orange-700',
    soft: 'bg-(--tone-amber-bg-50) text-(--tone-amber-text-800) border-(--tone-amber-border-300) hover:bg-(--tone-amber-bg-100) focus-visible:outline-amber-700',
    text: 'text-(--tone-amber-text-800) hover:text-(--tone-amber-text-950) focus-visible:outline-amber-700',
  },
  assignment: {
    solid: 'bg-violet-700 text-white border-violet-700 hover:bg-violet-800 focus-visible:outline-violet-700',
    soft: 'bg-(--tone-violet-bg-50) text-(--tone-violet-text-800) border-(--tone-violet-border-300) hover:bg-(--tone-violet-bg-100) focus-visible:outline-violet-700',
    text: 'text-(--tone-violet-text-800) hover:text-(--tone-violet-text-950) focus-visible:outline-violet-700',
  },
  success: {
    solid: 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800 focus-visible:outline-emerald-700',
    soft: 'bg-(--tone-emerald-bg-50) text-(--tone-emerald-text-800) border-(--tone-emerald-border-300) hover:bg-(--tone-emerald-bg-100) focus-visible:outline-emerald-700',
    text: 'text-(--tone-emerald-text-800) hover:text-(--tone-emerald-text-950) focus-visible:outline-emerald-700',
  },
  info: {
    solid: 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800 focus-visible:outline-blue-700',
    soft: 'bg-(--tone-blue-bg-50) text-(--tone-blue-text-800) border-(--tone-blue-border-200) hover:bg-(--tone-blue-bg-100) focus-visible:outline-blue-700',
    text: 'text-(--tone-blue-text-700) hover:text-(--tone-blue-text-900) focus-visible:outline-blue-700',
  },
  neutral: {
    solid: 'bg-slate-700 text-white border-(--border-color) hover:bg-slate-800 focus-visible:outline-slate-600',
    soft: 'bg-(--surface-muted) text-(--text-primary) border-(--border-color) hover:bg-(--surface-hover) focus-visible:outline-slate-600',
    text: 'text-(--text-secondary) hover:text-(--text-primary) focus-visible:outline-slate-600',
  },
  cancel: {
    solid: 'bg-(--tone-red-bg-50) text-(--tone-red-text-800) border-(--tone-red-border-200) ring-1 ring-inset ring-(--tone-red-ring-200) hover:bg-(--tone-red-bg-100) focus-visible:outline-red-700',
    soft: 'bg-(--tone-red-bg-50) text-(--tone-red-text-800) border-(--tone-red-border-200) ring-1 ring-inset ring-(--tone-red-ring-200) hover:bg-(--tone-red-bg-100) focus-visible:outline-red-700',
    text: 'text-(--tone-red-text-700) hover:text-(--tone-red-text-900) focus-visible:outline-red-700',
  },
  danger: {
    solid: 'bg-red-700 text-white border-red-700 hover:bg-red-800 focus-visible:outline-red-700',
    soft: 'bg-(--tone-red-bg-50) text-(--tone-red-text-800) border-(--tone-red-border-300) hover:bg-(--tone-red-bg-100) focus-visible:outline-red-700',
    text: 'text-(--tone-red-text-700) hover:text-(--tone-red-text-900) focus-visible:outline-red-700',
  },
  // Cerrar sesión se integra con el fondo azul del Sidebar sin un bloque claro.
  logout: {
    solid: 'bg-red-700 text-white border-red-700 hover:bg-red-800 focus-visible:outline-red-300',
    soft: 'bg-red-500/10 text-(--tone-red-text-300) border-red-400/30 hover:bg-red-500/20 focus-visible:outline-red-300',
    text: 'bg-transparent text-(--tone-red-text-300) hover:bg-red-500/10 hover:text-(--tone-red-text-200) focus-visible:outline-red-300',
  },
};

const sizes: Record<ButtonSize, string> = {
  sm: 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold',
  md: 'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold',
  lg: 'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold',
  icon: 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
  // Los botones existentes conservan sus medidas y clases adaptables.
  custom: '',
};

interface VisualProps {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

function buttonClasses({ variant = 'info', appearance = 'solid', size = 'md', fullWidth, className = '' }: VisualProps) {
  return `cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 ${colors[variant][appearance]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VisualProps {
  text?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  ariaLabel?: string;
}

export default function Button({ text, icon, iconOnly = false, ariaLabel, children, type = 'button', title, size, className = '', ...props }: ButtonProps) {
  const resolvedSize = size ?? (children !== undefined ? 'custom' : iconOnly ? 'icon' : 'md');
  const responsiveIcon = iconOnly && text
    ? 'h-10 w-10 shrink-0 p-0 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5'
    : '';
  const { variant, appearance, fullWidth, ...nativeProps } = props;
  return (
    <button
      {...nativeProps}
      type={type}
      title={title ?? ariaLabel}
      aria-label={ariaLabel ?? nativeProps['aria-label']}
      className={buttonClasses({ variant, appearance, size: resolvedSize, fullWidth, className: `${responsiveIcon} ${className}` })}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {text && <span className={iconOnly ? 'hidden sm:inline' : undefined}>{text}</span>}
      {children}
    </button>
  );
}

// Los enlaces con aspecto de botón conservan la navegación de React Router.
export function ButtonLink({ variant, appearance, size = 'custom', fullWidth, className, ...props }: LinkProps & VisualProps) {
  return <Link {...props} className={buttonClasses({ variant, appearance, size, fullWidth, className })} />;
}
