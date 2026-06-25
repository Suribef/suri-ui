import { HTMLAttributes } from '../../../node_modules/react';
export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    'aria-live'?: 'polite' | 'assertive';
}
export declare function Spinner({ size, label, 'aria-live': ariaLive, className, ...props }: SpinnerProps): import("react").JSX.Element;
export declare namespace Spinner {
    var displayName: string;
}
