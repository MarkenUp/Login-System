import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

interface Memo {
  Id: number;
  UserId: number;
  Date: string;
  Memo: string;
}

const UserDashboard: React.FC = () => {
  const [todayMemos, setTodayMemos] = useState<Memo[]>([]);
  const roles = useSelector((state: RootState) => state.auth.roles);
  const username = useSelector((state: RootState) => state.auth.username);
  const userId = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    const fetchTodayMemo = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `http://localhost:8800/api/general/memo/${userId}/${today}`
        );
        if (response.ok) {
          const data = await response.json();
          setTodayMemos(data.memo || []);
        } else {
          setTodayMemos([]);
        }
      } catch (error) {
        console.error("Failed to fetch today's memo:", error);
        setTodayMemos([]);
      }
    };
    if (userId) {
      fetchTodayMemo();
    }
  }, [userId]);
  return (
    <div className="mt-10">
      <h1 className="text-4xl text-white font-bold">Dashboard</h1>
      <p>
        Welcome, {username}! You have the {roles} privilege
      </p>
      <div className="grid grid-cols-3 md:grid-cols-2 gap-4 h-96 mt-10">
        <div className="flex flex-col bg-[#c4a47c] rounded-lg h-full">
          <div className="bg-darkblue p-3 w-full rounded-t-lg flex justify-center items-center">
            <h2 className="text-2xl text-white font-semibold">Today's Memo</h2>
          </div>
          <div className="grid grid-cols-3 overflow-y-auto h-full text-black p-4">
            {todayMemos.length > 0 ? (
              todayMemos.map((memo) => (
                <div
                  key={memo.Id}
                  className="note-card bg-yellow-100 p-4 rounded-lg shadow-lg mb-4"
                >
                  <p className="text-lg">
                    <strong>Date:</strong> {memo.Date.split("T")[0]}
                  </p>
                  <p className="text-lg">
                    <strong>Memo:</strong>
                  </p>
                  <p>{memo.Memo}</p>
                </div>
              ))
            ) : (
              <p className="col-span-1">No memo for today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
