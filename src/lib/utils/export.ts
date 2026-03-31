/**
 * Utility to export an array of objects to a CSV file.
 */
export function exportToCsv<T extends object>(
  filename: string,
  data: T[],
  headers: Record<keyof T, string>
) {
  if (data.length === 0) return;

  const headerKeys = Object.keys(headers) as (keyof T)[];
  const csvContent = [
    headerKeys.map(k => headers[k]).join(","),
    ...data.map(row => 
      headerKeys
        .map(k => {
          const val = row[k];
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
