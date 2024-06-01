import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import {
  FaArrowDown91,
  FaArrowDownZA,
  FaArrowUp19,
  FaArrowUpAZ,
} from "react-icons/fa6";
import Modal from "../modal/Modal";
import { IoClose } from "react-icons/io5";

interface User {
  Id: number;
  Username: string;
  Role: string; // Add the Role field
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("Id");
  const [sortDirection, setSortDirection] = useState<string>("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8800/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: { users: User[] } = await response.json();
      setUsers(data.users);
      const roles = Array.from(new Set(data.users.map((user) => user.Role)));
      setRoles(roles);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8800/api/admin/users/${editingUser.Id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Username: username,
              Role: role,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update user");
        }
        await fetchUsers();
        closeModal();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
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
                  className="bg-green-600 p-2 text-white rounded-lg hover:bg-green-700"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen}>
        <div className="flex jusitfy-end items-center">
          <button onClick={closeModal}>
            <IoClose />
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-2 border text-gray-600 font-semibold border-gray-300 rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-2 py-1 w-full text-gray-700"
          >
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="flex justify-center">
            <button
              onClick={handleSaveUser}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
