import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const userInfoStr = localStorage.getItem('userInfo');

    if (!userInfoStr) {
        return <Navigate to="/?login=true" replace />;
    }

    try {
        JSON.parse(userInfoStr);
    } catch (e) {
        return <Navigate to="/?login=true" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
