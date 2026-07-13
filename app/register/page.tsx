import AuthForm from "../components/AuthForm"
import { RegisterForm } from "../components/RegisterForm"


function Register() {
    return (
        <AuthForm>
            <RegisterForm />
        </AuthForm>
    )
}

export default Register