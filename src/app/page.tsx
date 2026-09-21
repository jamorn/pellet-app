"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import UserTableView from "@/components/UserTableView";
import { TISApiService } from "@/services/TISApiService";
import { TISGradeModel } from "@/models/TISGradeModel";

export default function HomePage() {
  const [data, setData] = useState<TISGradeModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // เพิ่ม State สำหรับ activeTab ตามที่ Navbar ต้องการ
  const [activeTab, setActiveTab] = useState<string>("data-view");

  const fetchFreshData = useCallback(async () => {
    setLoading(true);
    try {
      const freshData = await TISApiService.fetchFromApi();
      const updatedTime = TISApiService.setCachedData(freshData);
      setData(freshData);
      setLastUpdated(updatedTime);
    } catch (error) {
      console.error("Error fetching fresh data from GAS API:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: cachedData, lastUpdated: cachedTime } =
      TISApiService.getCachedData();

    if (cachedData && cachedData.length > 0) {
      setData(cachedData);
      setLastUpdated(cachedTime);
      setLoading(false);
    } else {
      fetchFreshData();
    }
  }, [fetchFreshData]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* ส่ง activeTab และ setActiveTab ให้กับ Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        <UserTableView
          data={data}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={fetchFreshData}
        />
      </div>
    </main>
  );
}
