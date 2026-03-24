import type { FC } from "react";
import { useState } from "react";

const SchedulePage: FC = () => {
  const [tab, setTab] = useState<"today" | "tomorrow" | "week">("today");
  const [selected, setSelected] = useState<string | null>(null);

  const mockData = {
    today: ["알고리즘 공부", "프로젝트 작업"],
    tomorrow: ["운동", "독서"],
    week: ["사이드 프로젝트", "정리", "복습"],
  };

  return (
    <div
      style={{
        padding: "16px",
        paddingBottom: "80px",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "#e2e8f0",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "20px", fontWeight: 600 }}>
          📅 Schedule
        </div>
        <div style={{ fontSize: "12px", opacity: 0.6 }}>
          계획된 수행을 관리합니다
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {[
          { key: "today", label: "Today" },
          { key: "tomorrow", label: "Tomorrow" },
          { key: "week", label: "Week" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key as any);
              setSelected(null);
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background:
                tab === item.key ? "#22c55e" : "#1e293b",
              color: tab === item.key ? "#0f172a" : "#e2e8f0",
              fontWeight: 600,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "14px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          {tab.toUpperCase()}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {mockData[tab].map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(item)}
              style={{
                background: "#1e293b",
                padding: "12px",
                borderRadius: "12px",
                cursor: "pointer",
                border:
                  selected === item
                    ? "1px solid #22c55e"
                    : "1px solid transparent",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      {selected && (
        <div
          style={{
            background: "#1e293b",
            padding: "16px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            {selected}
          </div>

          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
            반복: 주 3회
          </div>

          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "12px" }}>
            카테고리: Study · EXP +10
          </div>

          <button
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "#22c55e",
              color: "#0f172a",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            완료
          </button>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;