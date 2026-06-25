import { ButtonHTMLAttributes, ReactNode } from '../../../node_modules/react';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}
export declare const Button: import('../../../node_modules/react').ForwardRefExoticComponent<ButtonProps & import('../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
