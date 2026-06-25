import { HTMLAttributes } from '../../../node_modules/react';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    dot?: boolean;
}
export declare function Badge({ variant, size, dot, children, className, ...props }: BadgeProps): import("react").JSX.Element;
export declare namespace Badge {
    var displayName: string;
}
