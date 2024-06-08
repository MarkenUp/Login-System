import React, { useCallback, useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import Modal from "../modal/Modal";
import { IoClose } from "react-icons/io5";

interface Memo {
  Id: number;
  UserId: number;
  Date: string;
  Memo: string;
}

const Memo: React.FC<{ userId: number }> = ({ userId }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState<string>("");
  const [memoDate, setMemoDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);

  // Memoize fetchMemos with useCallback to ensure it has stable identity
  const fetchMemos = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8800/api/general/memos/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch memos");
      }
      const data: { memos: Memo[] } = await response.json();
      setMemos(data.memos);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  const handleSaveMemo = async () => {
    setLoading(true);
    try {
      if (editingMemo) {
        // Update memo
        const response = await fetch(
          `http://localhost:8800/api/general/memos/${editingMemo.Id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Memo: newMemo,
              Date: memoDate,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update memo");
        }
        setEditingMemo(null);
        setIsModalOpen(false);
      } else {
        // Create new memo
        const response = await fetch(
          "http://localhost:8800/api/general/memos",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              UserId: userId,
              Date: memoDate,
              Memo: newMemo,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to save memo");
        }
      }
      setNewMemo("");
      setMemoDate(new Date().toISOString().split("T")[0]);
      await fetchMemos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemo = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8800/api/general/memos/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete memo");
      }
      await fetchMemos();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setNewMemo(memo.Memo);
    setMemoDate(memo.Date.split("T")[0]);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="ml-3 mt-5">
      <h1 className="text-4xl text-white font-bold mb-10">Memo</h1>
      <div className="mb-4">
        <div className="flex items-end justify-end w-2/12">
          <input
            type="date"
            value={memoDate}
            onChange={(e) => setMemoDate(e.target.value)}
            className="w-full p-2 mb-2 border text-gray-600 font-semibold border-gray-300 rounded"
          />
        </div>
      </div>
      <textarea
        rows={4}
        value={newMemo}
        onChange={(e) => setNewMemo(e.target.value)}
        placeholder="Write your memo here..."
        className="w-full p-2 border text-gray-600 font-semibold border-gray-300 rounded"
      />
      <div className="flex items-center justify-center">
        <button
          onClick={handleSaveMemo}
          className="mt-2 px-4 py-2 bg-darkblue font-bold text-white rounded"
        >
          Save Memo
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">All Memos</h2>
      {memos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memos.map((memo) => (
            <div
              key={memo.Id}
              className="p-4 border border-dgray rounded bg-dgray cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <p>
                  <strong>Date: </strong> {memo.Date.split("T")[0]}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditMemo(memo)}
                    className="bg-darkblue p-2 text-white rounded-lg hover:bg-darkblueh"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteMemo(memo.Id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <BiTrash />
                  </button>
                </div>
              </div>
              <p>{memo.Memo}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No memos available.</p>
      )}

      <Modal isOpen={isModalOpen}>
        <div className="flex justify-end items-center">
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-black bg-white text-lg p-1 hover:bg-gray-200 rounded-full"
          >
            <IoClose />
          </button>
        </div>
        <div className="flex justify-center item-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Edit Memo</h2>
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={memoDate}
            onChange={(e) => setMemoDate(e.target.value)}
            className="w-full p-2 mb-2 border text-gray-600 font-semibold border-gray-300 rounded"
          />
        </div>
        <textarea
          rows={4}
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          placeholder="Edit you memo here..."
          className="w-full p-2 border text-gray-600 font-semibold border-gray-300 rounded"
        />
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleSaveMemo}
            className="px-4 py-2 bg-darkblue text-white rounded font-semibold hover:bg-darkblueh"
          >
            Update Memo
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Memo;
