"use client";

import { useState } from "react";
import { TISGradeModel } from "@/models/TISGradeModel";
import { TISApiService } from "@/services/TISApiService";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminCrudView({
  items,
  onRefresh,
}: {
  items: TISGradeModel[];
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Grade: "",
    Grade_type: "PP HOMO",
    plant: 1324,
    level: "",
    "Status Approved TIS": "OK",
    is_active: "Active",
    created_by: "Admin",
    updated_by: "Admin",
  });

  const apiService = TISApiService.getInstance();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiService.createGrade(formData);
    setLoading(false);
    onRefresh();
  };

  const handleDelete = async (gradeKey: string) => {
    if (confirm(`Are you sure you want to delete Grade: ${gradeKey}?`)) {
      setLoading(true);
      await apiService.deleteGrade(gradeKey);
      setLoading(false);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Plus size={20} /> Add New Grade Record
        </h3>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Grade Name"
            value={formData.Grade}
            onChange={(e) =>
              setFormData({ ...formData, Grade: e.target.value })
            }
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 text-sm"
            required
          />
          <input
            type="text"
            placeholder="Grade Type"
            value={formData.Grade_type}
            onChange={(e) =>
              setFormData({ ...formData, Grade_type: e.target.value })
            }
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 text-sm"
          />
          <input
            type="number"
            placeholder="Plant"
            value={formData.plant}
            onChange={(e) =>
              setFormData({ ...formData, plant: Number(e.target.value) })
            }
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 text-sm"
          />
          <input
            type="text"
            placeholder="Level"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 text-sm"
          />
          <select
            value={formData["Status Approved TIS"]}
            onChange={(e) =>
              setFormData({
                ...formData,
                "Status Approved TIS": e.target.value,
              })
            }
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 text-sm"
          >
            <option value="OK">OK</option>
            <option value="W/A">W/A</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 text-sm font-medium transition"
          >
            {loading ? "Processing..." : "Submit Record"}
          </button>
        </form>
      </div>

      {/* Admin Table View with Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Admin Management View
          </h3>
        </div>
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Plant</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-semibold">{item.Grade}</td>
                <td className="px-4 py-3">{item.plant}</td>
                <td className="px-4 py-3">{item.created_by}</td>
                <td className="px-4 py-3 flex space-x-2">
                  <button
                    onClick={() => handleDelete(item.Grade)}
                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
