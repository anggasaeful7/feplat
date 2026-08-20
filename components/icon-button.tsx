export default function IconButton({
    children,
    badge,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { badge?: boolean }) {
    return (
        <button
            type="button"
            {...props}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/70 transition hover:bg-surface-muted hover:text-foreground"
        >
            {children}
            {badge && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
            )}
        </button>
    );
}