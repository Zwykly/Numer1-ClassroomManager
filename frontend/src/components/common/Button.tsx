import {clsx as cn} from "clsx"; 

type ButtonVariant = "primary" | "secondary" | "disabled" | "danger";

interface ButtonProps extends React.ComponentProps<"button"> {
    variant?: ButtonVariant;
}


const ButtonStyles : Record<ButtonVariant, string> = {
    primary: "bg-orange text-white font-bold hover:bg-orange/80",
    secondary: "bg-light-grey text-orange font-bold hover:bg-grey/80",
    disabled: "bg-light-black text-darker-grey font-semilight ",
    danger: "bg-red-600 text-white font-bold hover:bg-red-700",
}

export function Button (
    {
        variant = "primary",
        children,
        className,
        ...props
    } : ButtonProps) {
        return (
            <button
                {...props}
                className={cn
                    ('py-2 px-6 rounded-lg inline-flex leading-tight text-center justify-center items-center shadow-lg duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                    ButtonStyles[variant],
                    className)}>
                    {children}
            </button>
        );
}