import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const names = ["Dawid","Kacper","Aga","Konrad","Patryk","Cezary","Kamil","Adi","Anita"];

const equipmentList = [
"Kamera Minrray IP","Kamera Minrray IP","Kamera Minrray NDI","Kamera Minrray Czarna",
"AP","Router Mikrotik","Switch Dahua","Mixer Tascam","Mixer Rodeo","Mixer Behringer Nowy","Mixer Behringer Stary",
"VIDEO mixer Chiński","VIDEO mixer Roland","VIDEO mixer Mini Pro",
"Vissonic pulpitowy bezprzewodowy","Vissonic pulpitowy przewodowy",
"Mikrofon SHURY x2","Mikrofon Sennheiser","Mikrofon doręczny Vissonic",
"JTS pulpitowy","JTS pulpitowy",
"Głośnik Boose 2x","Głośnik JBL x2","Głośnik JBL x2",
"Telewizory","Rolka XLR","Rolka Patchord","Rolka zasilanie",
"Statywy głośnik x2","Statywy głośnik x2","Statywy kamera","Statywy kamera",
"Statyw mikrofon duży","Statyw mały","Statyw mały",
"Piloty","Smartfony"
];

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(2);
  const [year] = useState(2026);
  const [dayAssignments, setDayAssignments] = useState({});
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("calendarData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setDayAssignments(parsed.dayAssignments || {});
      setTasks(parsed.tasks || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarData", JSON.stringify({ dayAssignments, tasks }));
  }, [dayAssignments, tasks]);

  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDay = new Date(year, currentMonth, 1).getDay();

  const onDragStart = (e, payload) => {
    e.dataTransfer.setData("data", JSON.stringify(payload));
  };

  const onDropDay = (e, day) => {
    const data = JSON.parse(e.dataTransfer.getData("data"));
    const key = `${currentMonth}-${day}`;

    if (data.type === "person") {
      setDayAssignments(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), { name: data.name, equipment: [] }]
      }));
    }

    if (data.type === "equipment") {
      const updated = { ...dayAssignments };
      const list = updated[key] || [];
      if (list.length > 0) {
        list[list.length - 1].equipment.push(data.name);
      }
      updated[key] = list;
      setDayAssignments(updated);
    }
  };

  const removeEquipment = (dayKey, personIdx, eqIdx) => {
    const updated = { ...dayAssignments };
    updated[dayKey][personIdx].equipment.splice(eqIdx, 1);
    setDayAssignments(updated);
  };

  const editEquipment = (dayKey, personIdx, eqIdx, value) => {
    const updated = { ...dayAssignments };
    updated[dayKey][personIdx].equipment[eqIdx] = value;
    setDayAssignments(updated);
  };

  const addTask = () => {
    if (!taskInput) return;
    setTasks([...tasks, { text: taskInput, done: false }]);
    setTaskInput("");
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);
  };

  const removeTask = (i) => {
    const updated = tasks.filter((_, idx) => idx !== i);
    setTasks(updated);
  };

  const exportPDF = () => window.print();

  return (
    <div className="p-6 grid gap-6">

      <Button onClick={exportPDF}>Eksport do PDF</Button>

      {/* Names */}
      <div>
        <h2 className="text-xl font-bold mb-2">Imiona (przeciągnij na dzień)</h2>
        <div className="flex flex-wrap gap-2">
          {names.map((n, i) => (
            <div key={i}
              draggable
              onDragStart={(e) => onDragStart(e, { type: "person", name: n })}
              className="p-3 bg-gray-200 rounded cursor-grab">
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <h2 className="text-xl font-bold mb-2">Sprzęt</h2>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
          {equipmentList.map((e, i) => (
            <div key={i}
              draggable
              onDragStart={(ev) => onDragStart(ev, { type: "equipment", name: e })}
              className="p-2 bg-blue-100 rounded text-sm cursor-grab">
              {e}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div>
        <h2 className="text-xl font-bold text-center mb-2">
          {new Date(year, currentMonth).toLocaleString("pl", { month: "long" })} {year}
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(firstDay)].map((_, i) => <div key={i}></div>)}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const key = `${currentMonth}-${day}`;

            return (
              <div key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDropDay(e, day)}
                className="border p-1 min-h-[100px] text-xs">

                <div className="font-bold">{day}</div>

                {(dayAssignments[key] || []).map((entry, idx) => (
                  <div key={idx} className="mt-1 p-1 bg-gray-100 rounded">
                    <div className="font-semibold">{entry.name}</div>
                    <div className="pl-2">
                      {entry.equipment.map((eq, i2) => (
                        <div key={i2} className="flex gap-1 items-center">
                          <input
                            value={eq}
                            onChange={(e) => editEquipment(key, idx, i2, e.target.value)}
                            className="text-[10px] border px-1 w-full"
                          />
                          <button
                            onClick={() => removeEquipment(key, idx, i2)}
                            className="text-red-500 text-[10px]">x</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))}>←</Button>
          <Button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))}>→</Button>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-xl font-bold mb-2">Zadania</h2>
        <div className="flex gap-2 mb-2">
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className="border p-2 flex-1"
          />
          <Button onClick={addTask}><Plus /></Button>
        </div>

        <ol className="space-y-2">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <Checkbox checked={t.done} onCheckedChange={() => toggleTask(i)} />
              <span className={t.done ? "line-through" : ""}>{i+1}. {t.text}</span>
              <button onClick={() => removeTask(i)} className="text-red-500 text-xs">usuń</button>
            </li>
          ))}
        </ol>
      </div>

    </div>
  );
}
