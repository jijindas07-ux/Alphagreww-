import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Plus,
  AlertCircle,
  FileText,
  Paperclip,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  SlideOverDrawer,
  Skeleton,
  EmptyState,
} from '@/design-system';
import { useToast } from '@/design-system/components/feedback/Toast';
import { useAuth } from '@/hooks/useAuth';
import { mockStaffService } from '@/services/mock/mockStaffService';
import type { AnnouncementItem } from '@/types/staff.types';

export const StaffAnnouncementsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, isHod } = useAuth();
  const { addToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Academic' | 'Administrative' | 'Examination' | 'Event'>('Academic');
  const [newTarget, setNewTarget] = useState<'All Campus' | 'Department' | 'Faculty Only' | 'Students Only'>('Faculty Only');
  const [newPriority, setNewPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['staff-announcements', categoryFilter],
    queryFn: () => mockStaffService.getAnnouncements(categoryFilter),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => mockStaffService.markAnnouncementAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['staff-announcements-recent'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => {
      return mockStaffService.createAnnouncement({
        title: newTitle,
        content: newContent,
        category: newCategory,
        targetAudience: newTarget,
        departmentCode: user.departmentCode,
        authorName: user.name,
        authorRole: user.designationName || 'Faculty',
        priority: newPriority,
      });
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['staff-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['staff-announcements-recent'] });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewContent('');
      addToast({
        title: 'Announcement Published',
        description: `Broadcasted to ${created.targetAudience} across the institution portal.`,
        type: 'success',
      });
    },
  });

  const handleInspect = (ann: AnnouncementItem) => {
    setSelectedAnnouncement(ann);
    if (!ann.isRead) {
      markReadMutation.mutate(ann.id);
    }
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Department Notices & Institutional Broadcasts"
        subtitle="Official circulars, exam notifications, and faculty development circulars."
        badge={
          unreadCount > 0 ? (
            <Badge variant="indigo" size="md">
              {unreadCount} Unread Broadcasts
            </Badge>
          ) : (
            <Badge variant="neutral" size="md">
              All Caught Up
            </Badge>
          )
        }
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Post Announcement
          </Button>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Circulars"
          value={`${announcements.length} Published`}
          secondaryText="Current semester archive"
          icon={<Bell className="w-5 h-5" />}
          iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          label="Unread Notices"
          value={`${unreadCount} New`}
          secondaryText={unreadCount > 0 ? 'Requires acknowledgment' : 'Zero unread items'}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        <StatCard
          label="Your Department"
          value={user.departmentCode || 'CSE'}
          secondaryText={isHod ? 'HOD Broadcast Permission' : 'Faculty Member'}
          icon={<FileText className="w-5 h-5" />}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
        {['ALL', 'Academic', 'Examination', 'Event', 'Administrative'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {cat === 'ALL' ? 'All Broadcasts' : cat}
          </button>
        ))}
      </div>

      {/* 4. Announcements Feed List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices found"
          description="There are currently no active circulars in this category."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card
              key={ann.id}
              onClick={() => handleInspect(ann)}
              className={`p-4 sm:p-5 hover:border-indigo-500/50 cursor-pointer transition-all ${
                !ann.isRead ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/10' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : ann.priority === 'high'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {ann.title}
                      </h4>
                      {!ann.isRead && (
                        <Badge size="sm" variant="indigo">
                          NEW
                        </Badge>
                      )}
                      <Badge
                        size="sm"
                        variant={
                          ann.priority === 'urgent'
                            ? 'rose'
                            : ann.priority === 'high'
                            ? 'amber'
                            : 'neutral'
                        }
                      >
                        {ann.priority.toUpperCase()}
                      </Badge>
                      <Badge size="sm" variant="neutral">
                        {ann.category}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-zinc-500">
                      <span>Posted by: {ann.authorName} ({ann.authorRole})</span>
                      <span>•</span>
                      <span>Target: {ann.targetAudience}</span>
                      <span>•</span>
                      <span>Date: {ann.postedDate}</span>
                      {ann.attachmentName && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                            <Paperclip className="w-3 h-3" /> {ann.attachmentName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="text-xs shrink-0 self-end sm:self-center">
                  Read Circular
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 5. Detail SlideOver Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || 'Notice Details'}
        description={`Published ${selectedAnnouncement?.postedDate} · ${selectedAnnouncement?.category}`}
        width="md"
      >
        {selectedAnnouncement && (
          <div className="space-y-5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Author:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedAnnouncement.authorName} ({selectedAnnouncement.authorRole})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Audience:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {selectedAnnouncement.targetAudience}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority:</span>
                <Badge
                  size="sm"
                  variant={selectedAnnouncement.priority === 'urgent' ? 'rose' : 'neutral'}
                >
                  {selectedAnnouncement.priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 mb-2">
                Announcement Body
              </h4>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                {selectedAnnouncement.content}
              </p>
            </div>

            {selectedAnnouncement.attachmentName && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedAnnouncement.attachmentName}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Download
                </Button>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>

      {/* 6. Create Announcement Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Broadcast New Announcement"
        description="Create an official circular to be published on the institutional notification feed."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!newTitle.trim() || !newContent.trim()}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Publish Broadcast
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Announcement Title"
            placeholder="e.g. Schedule for Mid-Term Lab Practicals"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-medium outline-none"
              >
                <option value="Academic">Academic</option>
                <option value="Examination">Examination</option>
                <option value="Event">Event</option>
                <option value="Administrative">Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Target Audience
              </label>
              <select
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 font-medium outline-none"
              >
                <option value="Faculty Only">Faculty Only</option>
                <option value="Department">Department Scholars & Staff</option>
                <option value="Students Only">Students Only</option>
                <option value="All Campus">All Campus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Priority Urgency
            </label>
            <div className="flex items-center gap-3">
              {(['normal', 'high', 'urgent'] as const).map((p) => (
                <label key={p} className="flex items-center gap-1.5 text-xs capitalize cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={newPriority === p}
                    onChange={() => setNewPriority(p)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Full Notice Description
            </label>
            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide instructions, timelines, venue details or deliverables..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
