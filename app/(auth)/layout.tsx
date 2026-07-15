import AuthForm from "../components/AuthForm";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthForm>{children}</AuthForm>;
}