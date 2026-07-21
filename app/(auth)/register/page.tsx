import AuthForm from "@/app/components/AuthForm"
import { RegisterForm } from "@/app/components/RegisterForm"
import AuthGuard from "@/components/auth-guard/AuthGuard"



function Register() {
    return (
        <AuthGuard>
            <RegisterForm />
        </AuthGuard>
    )
}

export default Register