"use client";

import React, { useState } from "react";
import {
  Plus,
  RotateCw,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface GradeItem {
  id: string;
  grade_name: string;
  plant: string;
  description: string;
  status: "Active" | "Inactive";
}

interface FormErrors {
  grade_name?: string;
  plant?: string;
}

export default function GradeAdminCRUD() {
  // Sample Data State
  const [grades, setGrades] = useState<GradeItem[]>([
    {
      id: "1",
      grade_name: "PP-5011",
      plant: "Plant A",
      description: "High flow polypropylene",
      status: "Active",
    },
    {
      id: "2",
      grade_name: "HD-2000",
      plant: "Plant B",
      description: "Blow molding grade",
      status: "Active",
    },
    {
      id: "3",
      grade_name: "LL-1018",
      plant: "Plant A",
      description: "Film grade resin",
      status: "Inactive",
    },
  ]);

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<GradeItem>({
    id: "",
    grade_name: "",
    plant: "Plant A",
    description: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 1. Handlers for Modal Open
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      id: "",
      grade_name: "",
      plant: "Plant A",
      description: "",
      status: "Active",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // กันไม่ให้ Trigger Row Click ซ้ำ
    setIsEditMode(true);
    setFormData(grade);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  // 2. Row Selection
  const handleRowClick = (id: string) => {
    setSelectedRowId((prev) => (prev === id ? null : id));
  };

  // 3. Validation Logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.grade_name.trim()) {
      newErrors.grade_name = "กรุณากรอกชื่อ Grade";
    }
    if (!formData.plant.trim()) {
      newErrors.plant = "กรุณาเลือก Plant";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isEditMode) {
        // TODO: Call GAS API -> UPDATE_GRADE
        setGrades((prev) =>
          prev.map((item) => (item.id === formData.id ? formData : item)),
        );
      } else {
        // TODO: Call GAS API -> CREATE_GRADE
        const newRecord: GradeItem = {
          ...formData,
          id: Date.now().toString(),
        };
        setGrades((prev) => [newRecord, ...prev]);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save grade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("คุณต้องการลบรายการ Grade นี้ใช่หรือไม่?")) {
      // TODO: Call GAS API -> DELETE_GRADE
      setGrades((prev) => prev.filter((item) => item.id !== id));
      if (selectedRowId === id) setSelectedRowId(null);
    }
  };

  return (
    <div className="w-full space-y-4 p-4 text-slate-800 dark:text-slate-100">
      {/* Top Bar: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Grade Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            จัดการข้อมูล Grade สำหรับผู้ดูแลระบบ
          </p>
        </div>

        {/* Right Action Group: Refresh & + Add New Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => console.log("Refreshing...")}
            className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            title="Refresh"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grade</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
            <tr>
              <th className="p-3.5 w-12 text-center">#</th>
              <th className="p-3.5">Grade Name</th>
              <th className="p-3.5">Plant</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  ไม่พบข้อมูล Grade
                </td>
              </tr>
            ) : (
              grades.map((item) => {
                const isSelected = selectedRowId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 font-medium"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by tr onClick
                        className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {item.grade_name}
                    </td>
                    <td className="p-3.5">{item.plant}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {item.description || "-"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          item.status === "Active"
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-600 dark:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {/* Badge Indicator for Add vs Edit */}
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                    isEditMode
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  }`}
                >
                  {isEditMode ? "Edit Mode" : "Add Mode"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isEditMode ? "Edit Grade Record" : "Create New Grade"}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Field 1: Grade Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Grade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.grade_name}
                  onChange={(e) =>
                    setFormData({ ...formData, grade_name: e.target.value })
                  }
                  placeholder="e.g. PP-5011"
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                    errors.grade_name
                      ? "border-rose-500 focus:ring-rose-200"
                      : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500"
                  }`}
                />
                {errors.grade_name && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.grade_name}
                  </p>
                )}
              </div>

              {/* Field 2: Plant Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Plant Access <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.plant}
                  onChange={(e) =>
                    setFormData({ ...formData, plant: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Plant A">Plant A</option>
                  <option value="Plant B">Plant B</option>
                  <option value="Plant C">Plant C</option>
                </select>
              </div>

              {/* Field 3: Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="รายละเอียดสเปกของ Grade..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Field 4: Status */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === "Active"}
                      onChange={() =>
                        setFormData({ ...formData, status: "Active" })
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === "Inactive"}
                      onChange={() =>
                        setFormData({ ...formData, status: "Inactive" })
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
                    isEditMode
                      ? "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                      : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? "Update Grade" : "Save Grade"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
