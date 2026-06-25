import { TextareaHTMLAttributes } from '../../../node_modules/react';
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    autoResize?: boolean;
}
export declare const Textarea: import('../../../node_modules/react').ForwardRefExoticComponent<TextareaProps & import('../../../node_modules/react').RefAttributes<HTMLTextAreaElement>>;
