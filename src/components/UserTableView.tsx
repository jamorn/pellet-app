"use client";

import { TISGradeModel } from "@/models/TISGradeModel";

export default function UserTableView({ items }: { items: TISGradeModel[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Grade List (Public View)
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          Total: {items.length} records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-medium border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Grade Type</th>
              <th className="px-4 py-3">Plant</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">TIS Status</th>
              <th className="px-4 py-3">Active Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
              >
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {item.Grade}
                </td>
                <td className="px-4 py-3">{item.Grade_type}</td>
                <td className="px-4 py-3">{item.plant}</td>
                <td className="px-4 py-3">{item.level}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.isApproved()
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {item["Status Approved TIS"]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      item.isActiveStatus()
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {item.is_active}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
