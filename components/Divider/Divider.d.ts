import { HTMLAttributes } from '../../../node_modules/react';
export interface DividerProps extends HTMLAttributes<HTMLElement> {
    decorative?: boolean;
    orientation?: 'horizontal' | 'vertical';
    label?: string;
}
export declare function Divider({ decorative, orientation, label, className, ...props }: DividerProps): import("react").JSX.Element;
export declare namespace Divider {
    var displayName: string;
}
