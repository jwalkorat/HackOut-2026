import React, { useState } from 'react';

/**
 * Modern Sleek Squircle Navigation Bar
 * - Matches the site's rounded-2xl / rounded-xl squircle design language
 * - Harmonizes with the light frosted glass & sky blue aesthetic
 * - Expands across the middle section so the top bar looks full and balanced
 * - Smoothly animates the text label on both ACTIVE and HOVER states
 */
export default function CapsuleNavBar({ tabs, activeTab, onSelectTab, flagCount = 0 }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <nav
      aria-label="Main Navigation"
      className="squircle-nav-dock w-full flex items-center justify-between gap-1.5 sm:gap-2 p-1.5 rounded-2xl backdrop-blur-md select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;
        const isExpanded = isActive || isHovered;
        const badge = tab.id === 'actions' && flagCount > 0 ? flagCount : null;

        return (
          <button
            key={tab.id}
            type="button"
            title={tab.label}
            onClick={() => onSelectTab(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={`nav-tab-btn group relative flex items-center justify-center min-h-10 py-2 px-3 rounded-xl cursor-pointer ${
              isExpanded ? 'flex-[1.6]' : 'flex-1'
            } ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
          >
            {/* Icon */}
            <span className="relative flex items-center justify-center shrink-0">
              <Icon className="nav-tab-icon w-4 h-4 shrink-0" />

              {/* Inactive unhovered badge pip */}
              {!isExpanded && badge && (
                <span className="nav-tab-badge-pip absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 flex items-center justify-center text-[9px] font-bold rounded-full bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                  {badge}
                </span>
              )}
            </span>

            {/* Smooth Expanding Label (expanded on Active OR Hover) */}
            <span className={`nav-tab-label ${isExpanded ? 'is-expanded' : ''}`}>
              {tab.label}
            </span>

            {/* Badge Count when expanded (active or hovered) */}
            {badge && (
              <span className={`nav-tab-badge-expand ${isExpanded ? 'is-expanded' : ''}`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

