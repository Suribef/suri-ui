import { InputHTMLAttributes } from '../../../node_modules/react';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
}
export declare const Input: import('../../../node_modules/react').ForwardRefExoticComponent<InputProps & import('../../../node_modules/react').RefAttributes<HTMLInputElement>>;
