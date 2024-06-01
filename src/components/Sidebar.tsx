import React from "react";
import { BiSolidDashboard, BiSolidUser } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../features/loginAuth/authSlice";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { FaRegStickyNote } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  const roles = useSelector((state: RootState) => state.auth.roles);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-darkblue w-full"
      : "hover:bg-darkblue";
  };
  return (
    <div className="flex flex-col justify-between w-64 bg-dgray shadow-lg  shadow-dgray p-4 h-full">
      <nav>
        <ul>
          <li>
            <Link
              to={roles.includes("User") ? "/user-dashboard" : "/dashboard"}
              className="flex justify-center items-center py-2 px-4 text-white font-bold text-3xl mb-5"
            >
              System
            </Link>
          </li>
          <li>
            <Link
              to={roles.includes("User") ? "/user-dashboard" : "/dashboard"}
              className={`flex items-center py-2 px-4 text-white font-semibold text-lg ${isActive(
                roles.includes("User") ? "/user-dashboard" : "/dashboard"
              )}`}
            >
              <BiSolidDashboard className="mr-1" /> Dashboard
            </Link>
          </li>
          {roles.includes("Admin") && (
            <li>
              <Link
                to="/user"
                className={`flex items-center py-2 px-4 text-white font-semibold text-lg ${isActive(
                  "/user"
                )}`}
              >
                <BiSolidUser className="mr-1" /> User
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/memo"
              className={`flex items-center py-2 px-4 text-white font-semibold text-lg ${isActive(
                "/memo"
              )}`}
            >
              <FaRegStickyNote className="mr-1" />
              Memo
            </Link>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
