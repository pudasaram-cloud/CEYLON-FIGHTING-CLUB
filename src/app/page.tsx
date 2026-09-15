'use client';

import React, { useState, useEffect } from 'react';
import { useClub } from '@/context/ClubContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MatchArenaHome } from '@/components/arena/MatchArenaHome';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { MemberManagement } from '@/components/members/MemberManagement';
import { ActivitiesSection } from '@/components/events/ActivitiesSection';
import { ReportsSection } from '@/components/reports/ReportsSection';
import { LeaderboardSection } from '@/components/leaderboard/LeaderboardSection';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { MemberRegistrationModal } from '@/components/members/MemberRegistrationModal';
import { MemberProfileModal } from '@/components/members/MemberProfileModal';
import { MemberEditModal } from '@/components/members/MemberEditModal';
import { DeleteConfirmModal } from '@/components/members/DeleteConfirmModal';
import { Member } from '@/types';

export default function Home() {
  const { isAuthenticated } = useClub();

  // Navigation State - Defaults to Live Fight Arena Home
  const [currentTab, setCurrentTab] = useState<string>('arena');

  // Sidebar Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Load saved sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('cfc_sidebar_collapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cfc_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Modal States
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // If not logged in, show split-screen login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Handlers for Member Actions
  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setProfileModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex antialiased">
      {/* 1. Dedicated Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenRegister={() => setRegisterModalOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Workspace Layout Area (Offset by Sidebar width on desktop) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {/* Streamlined Top Header */}
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenRegister={() => setRegisterModalOpen(true)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {currentTab === 'arena' && (
            <MatchArenaHome
              onOpenRegister={() => setRegisterModalOpen(true)}
              onViewProfile={handleViewProfile}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardOverview
              onOpenRegister={() => setRegisterModalOpen(true)}
              onNavigateTab={setCurrentTab}
              onOpenReportModal={() => setCurrentTab('reports')}
            />
          )}

          {currentTab === 'members' && (
            <MemberManagement
              onOpenRegister={() => setRegisterModalOpen(true)}
              onViewProfile={handleViewProfile}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {currentTab === 'activities' && <ActivitiesSection />}

          {currentTab === 'leaderboard' && (
            <LeaderboardSection
              onViewProfile={handleViewProfile}
              onOpenRegister={() => setRegisterModalOpen(true)}
              onNavigateArena={() => setCurrentTab('arena')}
            />
          )}

          {currentTab === 'reports' && <ReportsSection />}

          {currentTab === 'settings' && <SettingsSection />}
        </main>

        {/* Footer */}
        <footer className="no-print py-6 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>
            CEYLON FIGHTING CLUB © {new Date().getFullYear()} · &ldquo;Manage Fighters. Build Champions.&rdquo;
          </p>
        </footer>
      </div>

      {/* Global Modals */}
      <MemberRegistrationModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccessNavigate={() => setCurrentTab('members')}
      />

      <MemberProfileModal
        member={selectedMember}
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      <MemberEditModal
        member={selectedMember}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      <DeleteConfirmModal
        member={selectedMember}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
