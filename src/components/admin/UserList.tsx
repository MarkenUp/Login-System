import React, { ChangeEvent, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import {
  FaArrowDown91,
  FaArrowDownZA,
  FaArrowUp19,
  FaArrowUpAZ,
  FaCheck,
} from "react-icons/fa6";
import Modal from "../modal/Modal";
import { IoClose } from "react-icons/io5";
import { RootState } from "../../app/store";
import { fetchUsers, updateUser } from "../../features/loginAuth/userSlice";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import "../css/UserList.css";

interface User {
  Id: number;
  Username: string;
  Role: string; // Add the Role field
}

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, roles, loading, error } = useAppSelector(
    (state: RootState) => state.users
  );
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("Id");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const handleSort = (column: string) => {
    const direction =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Debounce function to limit the rate at which the search function executes
  const debounce = (
    func: (event: React.ChangeEvent<HTMLInputElement>) => void,
    delay: number
  ) => {
    let debounceTimer: NodeJS.Timeout;
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func(event), delay);
    };
  };

  // Search handler with debounce
  const handleSearchChange = debounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  // Filter users by search query and selected role
  const filteredUsers = users
    .filter((user) =>
      user.Username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((user) => (selectedRole ? user.Role === selectedRole : true));

  const sortedUsers = filteredUsers.sort((a, b) => {
    if (sortColumn === "Id") {
      return sortDirection === "asc" ? a.Id - b.Id : b.Id - a.Id;
    } else {
      const nameA = a.Username.toUpperCase();
      const nameB = b.Username.toUpperCase();
      if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
      if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.Username);
    setRole(user.Role);
    setIsEditable(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      await dispatch(updateUser({ id: editingUser.Id, username, role }));
      setIsSuccess(true);
      setShowSuccess(true);
      closeModal();
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => setIsSuccess(false), 500);
      }, 3000);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ml-3 mt-5">
      {isSuccess && (
        <div
          className={`success-message w-full bg-darkblue p-2 rounded flex text-lg justify-start items-center ${
            showSuccess ? "slide-down" : "slide-up"
          }`}
        >
          <FaCheck className="ml-3" />
          <p className="ml-1 text-white font-semibold">
            User updated succesfully!
          </p>
        </div>
      )}
      <h1 className="text-4xl text-white font-bold mb-8">Users</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="w-5/12 flex items-center justify-start">
          <label htmlFor="search" className="mr-2 font-semibold">
            Search:{" "}
          </label>
          <input
            type="text"
            id="search"
            onChange={handleSearchChange}
            placeholder="Search username"
            className="border px-2 py-1 w-9/12 text-gray-600 font-semibold border-gray-400 hover:bg-gray-50 rounded"
          />
        </div>
        <div className="flex items-center justify-end w-4/12">
          <label htmlFor="role-filter" className="mr-2 font-semibold">
            Filter by Role:{" "}
          </label>
          <select
            id="role-filter"
            value={selectedRole}
            onChange={handleRoleChange}
            className="border border-darkblue px-2 py-1 w-5/12 bg-darkblue text-white font-semibold hover:bg-darkblueh rounded"
          >
            <option className="text-white" value="">
              All
            </option>
            {roles.map((role) => (
              <option
                value={role}
                key={role}
                className="text-white font-semibolde"
              >
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white rounded-lg">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("Id")}
              className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm"
            >
              <div className="flex items-center justify-center">
                ID
                {sortColumn === "Id" &&
                  (sortDirection === "asc" ? (
                    <FaArrowDown91 />
                  ) : (
                    <FaArrowUp19 />
                  ))}
              </div>
            </th>
            <th
              onClick={() => handleSort("Username")}
              className="py-2 text-center px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue"
            >
              <div className="flex items-center justify-center">
                Username
                {sortColumn === "Username" &&
                  (sortDirection === "asc" ? (
                    <FaArrowDownZA />
                  ) : (
                    <FaArrowUpAZ />
                  ))}
              </div>
            </th>
            <th className="py-2 px-4 border-darkblue border text-white bg-darkblue ">
              Role
            </th>
            <th className="py-2 px-4 border-darkblue border text-white bg-darkblue rounded-r-sm">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="text-white bg-dgray">
          {sortedUsers.map((user) => (
            <tr key={user.Id}>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {user.Id}
              </td>
              <td className="py-2 px-4 border border-darkblue text-center font-semibold">
                {user.Username}
              </td>
              <td className="py-2 px-4 border border-darkblue text-center font-semibold">
                {user.Role}
              </td>
              <td
                className="py-2 px-4 border text-center border-darkblue
               font-semibold"
              >
                <button
                  onClick={() => openEditModal(user)}
                  className="bg-darkblue p-2 text-white rounded-lg hover:bg-darkblueh"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen}>
        <div className="flex justify-end items-center">
          <button
            onClick={closeModal}
            className="text-black bg-white text-lg p-1 hover:bg-gray-200 rounded-full"
          >
            <IoClose />
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h2 className="text-xl font-semibold mb-5">Edit User</h2>
        </div>
        <div className="mb-5">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isEditable}
            className="w-full p-2 mb-4 border text-gray-600 font-semibold border-gray-300 rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={!isEditable}
            className="border font-semibold px-2 py-1 w-full text-gray-700 rounded"
          >
            {roles.map((role) => (
              <option
                value={role}
                key={role}
                className="font-semibold text-gray-600"
              >
                {role}
              </option>
            ))}
          </select>
          <div className="flex justify-center mt-5">
            {isEditable ? (
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-darkblue hover:bg-darkblueh font-semibold text-white rounded"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEditable(true)}
                className="px-4 py-2 bg-darkblue hover:bg-darkblueh font-semibold text-white rounded"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
