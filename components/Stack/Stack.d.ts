import { HTMLAttributes } from '../../../node_modules/react';
type StackElement = 'div' | 'ul' | 'ol' | 'nav' | 'section' | 'main';
type GapScale = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
export interface StackProps extends HTMLAttributes<HTMLElement> {
    as?: StackElement;
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap?: GapScale;
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    wrap?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
}
export declare const Stack: import('../../../node_modules/react').ForwardRefExoticComponent<StackProps & import('../../../node_modules/react').RefAttributes<HTMLElement>>;
export {};
