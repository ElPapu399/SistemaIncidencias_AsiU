import type { ReactNode } from 'react';

interface ButtonProps {
  text?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  iconOnly?: boolean;
  ariaLabel?: string;
}

const Button = ({ text, onClick, variant = 'primary', type = 'button', icon, disabled = false, iconOnly = false, ariaLabel }: ButtonProps) => {
  const baseClasses = iconOnly
  ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-0! sm:h-auto sm:w-auto sm:px-5! sm:py-2.5!'
  : 'px-6 py-3 rounded-full font-semibold';

  const variants = {
    primary:
      'w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-orange-500/10 text-sm cursor-pointer',
    secondary:
      'inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer'
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variants[variant]}`} aria-label={ariaLabel} title={ariaLabel}>
      {icon && (
        <span className={iconOnly ? 'inline-flex' : 'mr-2'}>
          {icon}
        </span>
      )}

      {text && (
        <span className={iconOnly ? 'hidden sm:inline' : undefined}>
          {text}
        </span>
      )}
    </button>
  );
};

export default Button;
