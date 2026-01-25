const rows = [
  ['Part-time', '3 - 5', '$400 - $700'],
  ['Half-day', '5 - 8', '$700 - $1000'],
  ['Full-time', '10+', '$1200 - $1600'],
];

export default function DriverIncomeTable() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">
          Estimated driver income per month
        </h2>

        <div className="overflow-x-auto">
          <table className="mx-auto border rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border">Work type</th>
                <th className="px-6 py-3 border">Trips / day</th>
                <th className="px-6 py-3 border">Monthly income</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-6 py-3 border text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
