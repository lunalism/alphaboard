'use client';

import { useState } from 'react';
import { Sidebar, BottomNav } from '@/components/layout';

export default function CalendarPage() {
  const [activeMenu, setActiveMenu] = useState('calendar');

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Sidebar - hidden on mobile */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Bottom Navigation - visible only on mobile */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main Content */}
      <main className="md:pl-[72px] lg:pl-60 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">경제 캘린더</h1>
            <p className="text-gray-500 text-sm">주요 경제 이벤트 일정을 확인하세요</p>
          </div>

          {/* Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">곧 업데이트 예정입니다</h2>
            <p className="text-gray-500 text-sm">
              FOMC 회의, 고용지표 발표, 실적 발표 등<br />
              주요 경제 이벤트 일정을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
