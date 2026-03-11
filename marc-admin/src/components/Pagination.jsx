export default function Pagination({ page, totalPages, total, pageSize, onChange }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Build page numbers with ellipsis
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div style={s.wrap}>
      <span style={s.info}>
        Showing {from}–{to} of {total}
      </span>
      <div style={s.controls}>
        <button
          style={{ ...s.btn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          ‹ Prev
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} style={s.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              style={{
                ...s.btn,
                ...(p === page ? s.active : {}),
              }}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          style={{ ...s.btn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    padding: "14px 20px",
    borderTop: "1px solid #f3f4f6",
    background: "#fff",
    borderRadius: "0 0 12px 12px",
  },
  info: { fontSize: 13, color: "#6b7280" },
  controls: { display: "flex", gap: 4, alignItems: "center" },
  btn: {
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    border: "1.5px solid #e5e7eb",
    borderRadius: 6,
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    lineHeight: 1,
  },
  active: {
    background: "#111827",
    color: "#C9A465",
    borderColor: "#111827",
    fontWeight: 700,
  },
  ellipsis: { padding: "0 4px", color: "#9ca3af", fontSize: 14 },
};
