import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    CompanyName: "",
    CompanyAddress: "",
    ContactPerson: "",
    ContactNumber: "",
    Email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/api/admin/addClient", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      navigate("/clients");
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  return (
    <div className="ml-3 mt-5">
      <h1 className="text-4xl text-white font-bold mb-8">Add New Client</h1>
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-dgray p-4 rounded-lg flex w-7/12 justify-center mt-7 items-center"
        >
          <div className="flex flex-col justify-center w-11/12 my-10">
            <label
              htmlFor="CompanyName"
              className="font-semibold ml-4 text-lg mb-2"
            >
              Company Name:{" "}
            </label>
            <input
              type="text"
              id="CompanyName"
              placeholder="Company Name"
              value={formData.CompanyName}
              onChange={handleChange}
              className="ml-4 p-1 w-11/12 text-gray-600 font-semibold rounded mb-5"
            />
            <label
              htmlFor="CompanyAddress"
              className="font-semibold ml-4 text-lg mb-2"
            >
              Company Address:{" "}
            </label>
            <input
              type="text"
              id="CompanyAddress"
              value={formData.CompanyAddress}
              onChange={handleChange}
              placeholder="Company Address"
              className="ml-4 p-1 w-11/12 text-gray-600 font-semibold rounded mb-5"
            />
            <div className="flex justify-between">
              <div className="flex flex-col w-11/12">
                <label
                  htmlFor="ContactPerson"
                  className="font-semibold ml-4 text-lg mb-2"
                >
                  Contact Person:
                </label>
                <input
                  type="text"
                  id="ContactPerson"
                  value={formData.ContactPerson}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  className="ml-4 p-1 w-11/12 text-gray-600 font-semibold rounded mb-5"
                />
              </div>
              <div className="flex flex-col w-11/12 mr-9">
                <label
                  htmlFor="ContactNumber"
                  className="font-semibold ml-4 text-lg mb-2"
                >
                  Contact Number:
                </label>
                <input
                  type="text"
                  id="ContactNumber"
                  value={formData.ContactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="ml-4 p-1 w-11/12 text-gray-600 font-semibold rounded mb-5"
                />
              </div>
            </div>
            <label htmlFor="Email" className="font-semibold ml-4 text-lg mb-2">
              Email:
            </label>
            <input
              type="text"
              id="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Email"
              className="ml-4 p-1 w-11/12 text-gray-600 font-semibold rounded mb-5"
            />
            <div className="flex justify-center items-center mt-2">
              <button
                type="submit"
                className="bg-darkblue p-2 w-2/6 rounded font-semibold hover:bg-darkblueh"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient;
