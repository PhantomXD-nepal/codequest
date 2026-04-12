import { AuthForm } from "@/components/ui/auth-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <AuthForm isSignUp={false} />
    </div>
  );
}
