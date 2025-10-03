import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiChartPie,
  HiUser,
  HiClipboardCheck,
  HiCalendar,
  HiFilm,
} from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';

const menuData = [
  {
    label: '통계 및 현황',
    icon: HiChartPie,
    children: [
      { label: '사용자 통계', to: '/admin/user-statics' },
      { label: '예약 통계', to: '/admin/reservation-statics' },
    ],
  },
  {
    label: '사용자 관리',
    icon: HiUser,
    children: [{ label: '사용자 상태 관리', to: '/admin/user-state' }],
  },
  {
    label: '예약 관리',
    icon: HiClipboardCheck,
    children: [{ label: '예약 상태 관리', to: '/admin/reservation-state' }],
  },
  {
    label: '운영 관리',
    icon: HiCalendar,
    children: [
      { label: '정책 관리', to: '/admin/policy' },
      {
        label: '운영 시간 관리',
        children: [
          { label: '스케줄 생성', to: '/admin/schedule/create' },
          { label: '스케줄 조회', to: '/admin/schedule/fetch' },
        ],
      },
      {
        label: '시설 관리',
        children: [
          { label: 'Room', to: '/admin/facility/room' },
          { label: 'Partition', to: '/admin/facility/partition' },
        ],
      },
    ],
  },
  {
    label: '배너 관리',
    icon: HiFilm,
    children: [
      { label: '배너 생성', to: '/admin/banner/create' },
      { label: '배너 관리', to: '/admin/banner/manage' },
    ],
  },
];

const SidebarItem = ({ item, depth = 1 }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === item.to;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const padding = `pl-${depth * 4}`;

  return (
    <li className={`${padding} py-2`}>
      {hasChildren ? (
        <button className="w-full text-left" onClick={() => setOpen(!open)}>
          {item.label}
        </button>
      ) : item.to ? (
        <Link
          to={item.to}
          className={`block px-2 py-1 rounded ${
            isActive ? 'bg-gray-100 font-semibold mr-6' : ''
          }`}>
          {item.label}
        </Link>
      ) : (
        <span className="block text-gray-400 cursor-not-allowed">
          {item.label}
        </span>
      )}

      {hasChildren && open && (
        <motion.ul
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-1">
          {item.children.map((child, index) => (
            <SidebarItem key={index} item={child} depth={depth + 1} />
          ))}
        </motion.ul>
      )}
    </li>
  );
};

const SidebarSection = ({ section }) => {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div>
      <button
        className="w-full flex items-center px-4 py-2 hover:bg-gray-200"
        onClick={() => setOpen(!open)}>
        <Icon className="mr-2" />
        <span>{section.label}</span>
      </button>
      {open && (
        <div className="ml-4">
          <ul>
            {section.children.map((child, index) => (
              <SidebarItem key={index} item={child} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CustomSidebar = ({ isVisible = true }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="sidebar"
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          className="w-64 h-full bg-white overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }} // 빠르게 같이 사라지게
            className="py-4">
            <div className="mt-4">
              {menuData.map((section, index) => (
                <SidebarSection key={index} section={section} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomSidebar;
