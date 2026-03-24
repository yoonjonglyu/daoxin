import type { FC } from "react";
import { useState } from "react";

const CategoryPage: FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const mockCategory = [
    {
      name: "Health",
      exp: 120,
      items: ["운동", "명상", "스트레칭"],
    },
    {
      name: "Study",
      exp: 80,
      items: ["알고리즘", "영어", "프로젝트"],
    },
    {
      name: "Life",
      exp: 40,
      items: ["청소", "정리"],
    },
  ];

  const current = mockCategory.find((c) => c.name === selected);

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
          📂 Category
        </div>
        <div style={{ fontSize: "12px", opacity: 0.6 }}>
          수행을 분류하고 관리합니다
        </div>
      </div>

      {/* CATEGORY LIST */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "14px",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Category List
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {mockCategory.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(cat.name)}
              style={{
                background: "#1e293b",
                padding: "12px",
                borderRadius: "12px",
                cursor: "pointer",
                border:
                  selected === cat.name
                    ? "1px solid #22c55e"
                    : "1px solid transparent",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{cat.name}</span>
              <span style={{ fontSize: "12px", opacity: 0.7 }}>
                {cat.exp} EXP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL */}
      {current && (
        <div
          style={{
            background: "#1e293b",
            padding: "16px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "8px" }}>
            {current.name}
          </div>

          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "12px" }}>
            총 EXP: {current.exp}
          </div>

          <div
            style={{
              fontSize: "14px",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            Daoxin List
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {current.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  background: "#0f172a",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: "12px",
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
            + Daoxin 추가
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;