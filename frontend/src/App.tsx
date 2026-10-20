import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import EquipmentPage from './EquipmentPage'
import LoginPage from './login/LoginPage'
import ProfilePage from './profile/ProfilePage'
import AdminUsersPage from './admin/AdminUsersPage'
import { useAuth } from './auth/auth'

function RequireUser() {
  const { usuario, loading } = useAuth()
  if (loading) return <div className="auth-screen"><LoaderCircle className="spin" size={25} /><span>Verificando sesión…</span></div>
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireUser />}>
        <Route path="/" element={<EquipmentPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
