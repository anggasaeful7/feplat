export function FormStyles() {
  return (
    <style>{`
      .input {
        display: block;
        width: 100%;
        height: 2.75rem;
        border-radius: 0.625rem;
        border: 1px solid var(--border);
        background: var(--surface);
        padding: 0 0.875rem;
        font-size: 0.925rem;
        color: var(--foreground);
        outline: none;
        transition: border-color .15s, box-shadow .15s;
      }
      .input::placeholder { color: #a8a89c; }
      .input:focus {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent);
      }
      .input:disabled { opacity: .65; cursor: not-allowed; }
      .input.error { border-color: var(--danger); }
      .input.error:focus {
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--danger) 18%, transparent);
      }
    `}</style>
  );
}
