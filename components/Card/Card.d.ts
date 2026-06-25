import { forwardRef, HTMLAttributes } from '../../../node_modules/react';
type CardElement = 'div' | 'article' | 'section' | 'main';
export interface CardProps extends HTMLAttributes<HTMLElement> {
    as?: CardElement;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    bordered?: boolean;
    fullWidth?: boolean;
}
type CardType = ReturnType<typeof forwardRef<HTMLElement, CardProps>> & {
    Header: typeof CardHeader;
    Body: typeof CardBody;
    Footer: typeof CardFooter;
};
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    divided?: boolean;
}
export declare function CardHeader({ divided, className, children, ...props }: CardHeaderProps): import("react").JSX.Element;
export declare namespace CardHeader {
    var displayName: string;
}
export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export declare function CardBody({ className, children, ...props }: CardBodyProps): import("react").JSX.Element;
export declare namespace CardBody {
    var displayName: string;
}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    divided?: boolean;
}
export declare function CardFooter({ divided, className, children, ...props }: CardFooterProps): import("react").JSX.Element;
export declare namespace CardFooter {
    var displayName: string;
}
export declare const Card: CardType;
export {};
