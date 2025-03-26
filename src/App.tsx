import { useState, useEffect } from "react";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [range, setRange] = useState("week");
  const [diary, setDiary] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const storedLogs = localStorage.getItem("studyLogs");
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
    const storedDiary = localStorage.getItem("diaryEntries");
    if (storedDiary) {
      setEntries(JSON.parse(storedDiary));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studyLogs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
  }, [entries]);

  const date = format(selectedDate, "yyyy-MM-dd");

  const addLog = () => {
    if (date && (hours || minutes)) {
      const totalHours = Number(hours) + Number(minutes) / 60;
      const updatedLogs = logs.filter((log) => log.date !== date);
      updatedLogs.push({ date, hours: parseFloat(totalHours.toFixed(2)) });
      updatedLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
      setLogs(updatedLogs);
      setHours("");
      setMinutes("");
    }
  };

  const addDiary = () => {
    if (date && diary) {
      const updatedEntries = entries.filter((entry) => entry.date !== date);
      updatedEntries.push({ date, diary });
      updatedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(updatedEntries);
      setDiary("");
    }
  };

  const filterLogs = () => {
    const now = new Date();
    let filtered = [];
    if (range === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = logs.filter((log) => new Date(log.date) >= weekAgo);
    } else if (range === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      filtered = logs.filter((log) => new Date(log.date) >= monthAgo);
    } else {
      filtered = logs;
    }
    return filtered;
  };

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
  const selectedDiary =
    entries.find((e) => e.date === formattedSelectedDate)?.diary || "記録なし";
  const selectedLog =
    logs.find((l) => l.date === formattedSelectedDate)?.hours || "記録なし";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">大輝の毎日ブログ ✍️</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[30%]">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="rounded border p-2 text-sm"
            formatDay={(_, date) => date.getDate()}
          />
          <div className="mt-4 border p-4 rounded">
            <div className="font-bold text-sm">
              {formattedSelectedDate} の記録
            </div>
            <div className="mt-2 text-sm">
              <strong>日記：</strong> {selectedDiary}
            </div>
            <div className="text-sm">
              <strong>学習時間：</strong> {selectedLog} 時間
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[70%] flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">今日の日記</label>
            <textarea
              value={diary}
              onChange={(e) => setDiary(e.target.value)}
              className="border p-2 rounded h-32"
              placeholder="今日の出来事や感想など..."
            />

            <button
              onClick={addDiary}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded self-start"
            >
              日記を保存
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold">
              学習時間（時間と分）
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                placeholder="時間"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="border p-2 rounded w-1/2"
              />
              <input
                type="number"
                placeholder="分"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="border p-2 rounded w-1/2"
              />
            </div>
            <button
              onClick={addLog}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              学習時間を追加
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">学習時間グラフ 📊</h2>
            <div className="mb-2">
              <label className="mr-2">表示範囲：</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="week">1週間</option>
                <option value="month">1ヶ月</option>
                <option value="year">全期間</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <LineChart
                width={600}
                height={150}
                data={filterLogs()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
