import { useCallback, useEffect, useState } from "react";
import {
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SecurityCharts from "../components/SecurityCharts";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const fetchDashboardData = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const [
      statsResponse,
      eventsResponse,
      blockedResponse,
      attemptsResponse,
    ] = await Promise.all([
      api.get("/api/dashboard/stats"),
      api.get("/api/dashboard/events"),
      api.get("/api/dashboard/blocked-ips"),
      api.get("/api/dashboard/attempts"),
    ]);

    setStats(statsResponse.data);
    setEvents(eventsResponse.data);
    setBlockedIPs(blockedResponse.data);
    setAttempts(attemptsResponse.data);
  } catch (err) {
    console.error(err);

    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      return;
    }

    if (err.response?.status === 403) {
      setError(
        "You do not have permission to access the security dashboard."
      );
      return;
    }

    setError("Unable to load dashboard data.");
  } finally {
    setLoading(false);
  }
}, [navigate]);

useEffect(() => {
  fetchDashboardData();

  const intervalId = setInterval(() => {
    fetchDashboardData();
  }, 10000);

  return () => {
    clearInterval(intervalId);
  };
}, [fetchDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "-";
    }

    return new Date(timestamp).toLocaleString();
  };

  const getStatusClass = (status) => {
    if (status === "SUCCESS") {
      return "text-emerald-400 bg-emerald-400/10";
    }

    if (status === "FAILED") {
      return "text-red-400 bg-red-400/10";
    }

    if (status === "BLOCKED") {
      return "text-orange-400 bg-orange-400/10";
    }

    return "text-slate-400 bg-slate-400/10";
  };

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") {
      return "text-red-400 bg-red-400/10";
    }

    if (severity === "MEDIUM") {
      return "text-yellow-400 bg-yellow-400/10";
    }

    return "text-blue-400 bg-blue-400/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />

          <p className="text-slate-400">
            Loading security dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="bg-slate-900 border border-red-900 rounded-xl p-8 text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />

          <h2 className="text-xl font-semibold mb-2">
            Dashboard Error
          </h2>

          <p className="text-slate-400 mb-6">
            {error}
          </p>

          <button
            onClick={fetchDashboardData}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Security Monitor
              </h1>

              <p className="text-xs text-slate-500">
                Brute-Force Detection System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm text-white">
                Administrator
              </p>

              <p className="text-xs text-emerald-400">
                ● System Online
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="max-w-[1600px] mx-auto px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-2xl font-bold">
              Security Overview
            </h2>

            <p className="text-slate-400 mt-1">
              Monitor authentication activity and security events.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

        </div>

        {/* ================= STAT CARDS ================= */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">

          {/* Total Attempts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Total Attempts
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.total_attempts ?? 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>

            </div>
          </div>

          {/* Successful Logins */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Successful Logins
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.successful_logins ?? 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>

            </div>
          </div>

          {/* Failed Logins */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Failed Logins
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.failed_logins ?? 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>

            </div>
          </div>

          {/* Blocked IPs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Blocked IPs
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.blocked_ips ?? 0}
                </p>
              </div>

              <div className="w-11 h-11 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-orange-400" />
              </div>

            </div>
          </div>

          {/* Detected Attacks */}

<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
  <div className="flex items-center justify-between">

    <div>
      <p className="text-sm text-slate-400">
        Detected Attacks
      </p>

      <p className="text-3xl font-bold mt-2">
        {stats?.detected_attacks ?? 0}
      </p>
    </div>

    <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center">
      <AlertTriangle className="w-5 h-5 text-red-400" />
    </div>

  </div>
</div>

        </div>

        {/* ================= SECOND ROW ================= */}

        <SecurityCharts attempts={attempts}/>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* Security Events */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl">

            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">

              <div>
                <h3 className="font-semibold text-lg">
                  Security Events
                </h3>

                <p className="text-sm text-slate-500">
                  Recent detected security incidents
                </p>
              </div>

              <AlertTriangle className="w-5 h-5 text-yellow-400" />

            </div>

            <div className="divide-y divide-slate-800">

              {events.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500">
                  No security events detected.
                </div>
              ) : (
                events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="px-6 py-4 flex items-start justify-between gap-4"
                  >

                    <div className="min-w-0">

                      <p className="font-medium text-sm">
                        {event.event_type}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        {event.description}
                      </p>

                      <p className="text-xs text-slate-600 mt-2">
                        {formatDate(event.timestamp)}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityClass(event.severity)}`}
                    >
                      {event.severity}
                    </span>

                  </div>
                ))
              )}

            </div>
          </section>

          {/* Blocked IPs */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl">

            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">

              <div>
                <h3 className="font-semibold text-lg">
                  Blocked IP Addresses
                </h3>

                <p className="text-sm text-slate-500">
                  Currently active blocks
                </p>
              </div>

              <Ban className="w-5 h-5 text-orange-400" />

            </div>

            <div className="overflow-x-auto">

              {blockedIPs.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500">
                  No IP addresses are currently blocked.
                </div>
              ) : (
                <table className="w-full text-sm">

                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-800">
                      <th className="px-6 py-3 font-medium">
                        IP Address
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Reason
                      </th>

                      <th className="px-6 py-3 font-medium">
                        Expires
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">

                    {blockedIPs.slice(0, 5).map((block) => (
                      <tr key={block.id}>

                        <td className="px-6 py-4 font-mono text-orange-300">
                          {block.ip_address}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {block.reason}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {formatDate(block.expires_at)}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              )}

            </div>
          </section>

        </div>

        {/* ================= LOGIN ATTEMPTS ================= */}

        <section className="bg-slate-900 border border-slate-800 rounded-xl">

          <div className="px-6 py-5 border-b border-slate-800">

            <h3 className="font-semibold text-lg">
              Recent Login Attempts
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Latest authentication activity
            </p>

          </div>

          <div className="overflow-x-auto">

            {attempts.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500">
                No login attempts recorded.
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-800">

                    <th className="px-6 py-3 font-medium">
                      Username
                    </th>

                    <th className="px-6 py-3 font-medium">
                      IP Address
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Reason
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Time
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {attempts.slice(0, 10).map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-800/40 transition"
                    >

                      <td className="px-6 py-4 font-medium">
                        {attempt.username}
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-400">
                        {attempt.ip_address}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(attempt.status)}`}
                        >
                          {attempt.status}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {attempt.failure_reason || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(attempt.timestamp)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            )}

          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;