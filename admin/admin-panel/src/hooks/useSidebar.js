import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  collapseSidebar: () => set({ isCollapsed: true }),
  expandSidebar: () => set({ isCollapsed: false }),
}));

export const useSidebar = () => {
  const { isCollapsed, toggleSidebar, collapseSidebar, expandSidebar } = useSidebarStore();
  
  return {
    isCollapsed,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
  };
};