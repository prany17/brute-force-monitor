import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function SecurityCharts({ attempts }) {
  /*
   * Convert the login attempts returned by the backend
   * into data that Recharts can understand.
   */
  const activityData = [...attempts]
    .reverse()
    .map((attempt, index) => ({
      name: `#${index + 1}`,
      successful: attempt.status === "SUCCESS" ? 1 : 0,
      failed: attempt.status === "FAILED" ? 1 : 0,
      blocked: attempt.status === "BLOCKED" ? 1 : 0,
    }));

  /*
   * Count login results for the pie chart.
   */
  const successfulCount = attempts.filter(
    (attempt) => attempt.status === "SUCCESS"
  ).length;

  const failedCount = attempts.filter(
    (attempt) => attempt.status === "FAILED"
  ).length;

  const blockedCount = attempts.filter(
    (attempt) => attempt.status === "BLOCKED"
  ).length;

  const outcomeData = [
    {
      name: "Successful",
      value: successfulCount,
    },
    {
      name: "Failed",
      value: failedCount,
    },
    {
      name: "Blocked",
      value: blockedCount,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

      {/* ================= LOGIN ACTIVITY ================= */}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="mb-6">
          <h3 className="font-semibold text-lg">
            Login Activity
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Recent authentication outcomes
          </p>
        </div>

        {activityData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No login activity available.
          </div>
        ) : (
          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={activityData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                />

                <YAxis
                  allowDecimals={false}
                  stroke="#64748b"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{
                    color: "#cbd5e1",
                  }}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="successful"
                  name="Successful"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="failed"
                  name="Failed"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="blocked"
                  name="Blocked"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>
        )}

      </section>

      {/* ================= LOGIN OUTCOME ================= */}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

        <div className="mb-6">
          <h3 className="font-semibold text-lg">
            Login Outcome
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Distribution of authentication results
          </p>
        </div>

        {outcomeData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No authentication data available.
          </div>
        ) : (
          <div className="h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {outcomeData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Successful"
                          ? "#34d399"
                          : entry.name === "Failed"
                            ? "#f87171"
                            : "#fb923c"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>
        )}

      </section>

    </div>
  );
}

export default SecurityCharts;