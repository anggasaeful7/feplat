import { LoginForm } from "./login-form";
import { BrandMark } from "@/app/_components/brand-mark";

export default function LoginPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <BrandMark size="md" />
        <div>
          <div className="text-base font-semibold leading-tight">
            Superadmin Portal
          </div>
          <div className="text-xs text-muted leading-tight">Global Control</div>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Sign in to your console
        </h1>
        <p className="text-sm text-muted">
          Use your platform administrator credentials to continue.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
