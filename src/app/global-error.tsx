"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>A critical error occurred</h2>
          <button onClick={() => reset()} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
