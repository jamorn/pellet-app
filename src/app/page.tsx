"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import UserTableView from "@/components/UserTableView";
import AdminCrudView from "@/components/AdminCrudView";
import { TISApiService } from "@/services/TISApiService";
import { TISGradeModel } from "@/models/TISGradeModel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("view");
  const [items, setItems] = useState<TISGradeModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const service = TISApiService.getInstance();
      const { items } = await service.fetchAllData();
      setItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-500">
            Loading data...
          </div>
        ) : activeTab === "view" ? (
          <UserTableView items={items} />
        ) : (
          <AdminCrudView items={items} onRefresh={loadData} />
        )}
      </main>
    </div>
  );
}
