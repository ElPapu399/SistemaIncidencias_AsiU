import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: IconDefinition;
}

const Button = ({ text, onClick, variant = 'primary', type = 'button', icon }: ButtonProps) => {
  const baseClasses = 'px-6 py-3 rounded-full font-semibold';

  const variants = {
    primary:
      'w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-950 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-orange-500/10 text-sm cursor-pointer',
  };

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {icon && <FontAwesomeIcon icon={icon} className="w-5 h-5" />}
      {text}
    </button>
  );
};

export default Button;
