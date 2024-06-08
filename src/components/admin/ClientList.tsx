import React, { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../features/hooks";
import { RootState } from "../../app/store";
import {
  deleteClient,
  fetchClients,
  updateClient,
} from "../../features/loginAuth/clientSlice";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import Modal from "../modal/Modal";
import { IoClose } from "react-icons/io5";
import { BiTrash } from "react-icons/bi";

interface Client {
  Id: number;
  CompanyName: string;
  CompanyAddress: string;
  ContactPerson: string;
  ContactNumber: string;
  Email: string;
}

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

const ClientList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clients, loading, error } = useAppSelector(
    (state: RootState) => state.clients
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyAddress, setCompanyAddress] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleSearchChange = debounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const filteredClients = clients.filter((client) =>
    client.CompanyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setCompanyName(client.CompanyName);
    setCompanyAddress(client.CompanyAddress);
    setContactPerson(client.ContactPerson);
    setContactNumber(client.ContactNumber);
    setEmail(client.Email);
    setIsEditable(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveClient = async () => {
    if (editingClient) {
      await dispatch(
        updateClient({
          id: editingClient.Id,
          companyName,
          companyAddress,
          contactPerson,
          contactNumber,
          email,
        })
      );
      closeModal();
    }
  };

  const handleDelete = (id: number) => {
    dispatch(deleteClient(id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ml-3 mt-5">
      <h1 className="text-4xl text-white font-bold mb-8">Clients</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="w-5/12 flex items-center justify-start">
          <label htmlFor="search" className="mr-2 font-semibold">
            Search:{" "}
          </label>
          <input
            type="text"
            id="search"
            onChange={handleSearchChange}
            placeholder="Search company name..."
            className="border px-2 py-1 w-9/12 text-gray-600 font-semibold border-gray-400 hover:bg-gray-50 rounded"
          />
          <button
            onClick={() => navigate("/clients/new-client")}
            className="ml-3 p-2 bg-darkblue text-white font-semibold rounded w-3/12"
          >
            New Client
          </button>
        </div>
      </div>
      <table className="min-w-full bg-white rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Company Name
            </th>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Company Address
            </th>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Contact Person
            </th>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Contact Number
            </th>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Email
            </th>
            <th className="py-2 px-4 border-darkblue border hover:cursor-pointer hover:bg-darkblueh text-white bg-darkblue rounded-l-sm">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="text-white bg-dgray">
          {filteredClients.map((client) => (
            <tr key={client.Id}>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {client.CompanyName}
              </td>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {client.CompanyAddress}
              </td>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {client.ContactPerson}
              </td>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {client.ContactNumber}
              </td>
              <td className="py-2 border border-darkblue px-4 border-b text-center font-semibold">
                {client.Email}
              </td>
              <td
                className="py-2 px-4 border text-center border-darkblue
               font-semibold"
              >
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => openEditModal(client)}
                    className="bg-darkblue p-2 text-white rounded-lg hover:bg-darkblueh"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(client.Id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <BiTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modalOpen}>
        <div className="flex justify-end items-center">
          <button
            onClick={closeModal}
            className="text-black bg-white text-lg p-1 hover:bg-gray-200 rounded-full"
          >
            <IoClose />
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h2 className="text-xl font-semibold mb-5">Client Detail</h2>
        </div>
        <div className="mb-5">
          <label htmlFor="CompanayName" className="font-semibold text-lg mb-2">
            Company Name:
          </label>
          <input
            type="text"
            id="CompanyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={!isEditable}
            className={`w-full p-2 mb-4 border font-semibold border-gray-300 rounded ${
              isEditable ? "text-black" : "text-gray-500 bg-gray-100"
            }`}
          />
          <label
            htmlFor="CompanyAddress"
            className="font-semibold text-lg mb-2"
          >
            Company Address:
          </label>
          <input
            type="text"
            id="CompanyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            disabled={!isEditable}
            className={`w-full p-2 mb-4 border font-semibold border-gray-300 rounded ${
              isEditable ? "text-black" : "text-gray-500 bg-gray-100"
            }`}
          />
          <label htmlFor="ContactPerson" className="font-semibold text-lg mb-2">
            Contact Person:
          </label>
          <input
            type="text"
            id="ContactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            disabled={!isEditable}
            className={`w-full p-2 mb-4 border font-semibold border-gray-300 rounded ${
              isEditable ? "text-black" : "text-gray-500 bg-gray-100"
            }`}
          />
          <label htmlFor="ContactNumber" className="font-semibold text-lg mb-2">
            Contact Number:
          </label>
          <input
            type="text"
            id="ContactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            disabled={!isEditable}
            className={`w-full p-2 mb-4 border font-semibold border-gray-300 rounded ${
              isEditable ? "text-black" : "text-gray-500 bg-gray-100"
            }`}
          />
          <label htmlFor="Email" className="font-semibold text-lg mb-2">
            Email:
          </label>
          <input
            type="text"
            id="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditable}
            className={`w-full p-2 mb-4 border font-semibold border-gray-300 rounded ${
              isEditable ? "text-black" : "text-gray-500 bg-gray-100"
            }`}
          />
          <div className="flex justify-center mt-5">
            {isEditable ? (
              <button
                onClick={handleSaveClient}
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

export default ClientList;
