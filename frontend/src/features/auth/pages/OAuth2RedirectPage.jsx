import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OAuth2RedirectPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        const payload = JSON.parse(atob(token.split('.')[1]))
        const user = { role: payload.role }

        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        login(user)

        if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') {
            navigate('/dashboard', { replace: true })
        } else {
            navigate('/', { replace: true })
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="text-white/60">Đang xử lý đăng nhập...</div>
        </div>
    )
}
