import "./App.css";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/admin/Dashboard";
import AuthPage from "./components/AuthPage";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./app/store";
import { useEffect } from "react";
import { logout, setAuth } from "./features/loginAuth/authSlice";
import Sidebar from "./components/Sidebar";
import RoleBasedRoute from "./components/RoleBasedRoute";
import UserList from "./components/admin/UserList";
import PrivateRoute from "./components/PrivateRoute";
import UserDashboard from "./components/users/UserDashboard";
import Memo from "./components/general/Memo";
import ClientList from "./components/admin/ClientList";
import AddClient from "./components/admin/AddClient";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const roles = useSelector((state: RootState) => state.auth.roles);

  if (isAuthenticated) {
    if (roles.includes("Admin")) {
      return <Navigate to="/dashboard" />;
    }
    if (roles.includes("User")) {
      return <Navigate to="/user-dashboard" />;
    }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;

      if (Date.now() >= exp) {
        dispatch(logout());
        window.location.href = "/auth";
      } else {
        dispatch(setAuth(true));
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="bg-indigo text-white">
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthPage />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <RoleBasedRoute roles={["Admin"]}>
                  <div className="flex w-full h-lvh">
                    <Sidebar />
                    <div className="flex-1 p-4">
                      <Dashboard />
                    </div>
                  </div>
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <RoleBasedRoute roles={["User"]}>
                  <div className="flex w-full h-lvh">
                    <Sidebar />
                    <div className="flex-1 p-4">
                      <UserDashboard />
                    </div>
                  </div>
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/user"
            element={
              <PrivateRoute>
                <RoleBasedRoute roles={["Admin"]}>
                  <div className="flex w-full h-lvh">
                    <Sidebar />
                    <div className="flex-1 p-4">
                      <UserList />
                    </div>
                  </div>
                </RoleBasedRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/memo"
            element={
              <PrivateRoute>
                <div className="flex w-full h-lvh">
                  <Sidebar />
                  <div className="flex-1 p-4">
                    {userId !== null ? (
                      <Memo userId={userId} />
                    ) : (
                      <div>Loading...</div>
                    )}
                  </div>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <div className="flex w-full h-lvh">
                  <Sidebar />
                  <div className="flex-1 p-4">
                    <ClientList />
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/clients/new-client"
            element={
              <PrivateRoute>
                <div className="flex w-full h-lvh">
                  <Sidebar />
                  <div className="flex-1 p-4">
                    <AddClient />
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div className="flex w-full h-lvh">
                <Sidebar />
                <div className="flex-1 p-4">Unauthorized</div>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
