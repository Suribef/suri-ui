import { SelectHTMLAttributes } from '../../../node_modules/react';
export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};
export type SelectOptionGroup = {
    group: string;
    options: SelectOption[];
};
export type SelectItem = SelectOption | SelectOptionGroup;
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    options: SelectItem[];
    label?: string;
    placeholder?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
}
export declare const Select: import('../../../node_modules/react').ForwardRefExoticComponent<SelectProps & import('../../../node_modules/react').RefAttributes<HTMLSelectElement>>;
