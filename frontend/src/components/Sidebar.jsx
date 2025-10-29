// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, isAdmin, isManager } = useAuth();

  const isRdStaff = user?.role === 'staff' && user?.management_group === 'rd';
  const isIprStaff = user?.role === 'staff' && user?.management_group === 'ipr';

  const isRdManager = isManager && user?.management_group === 'rd';
  const isIprManager = isManager && user?.management_group === 'ipr';

  const showRdMenu = isAdmin() || isRdStaff || isRdManager;
  const showIprMenu = isAdmin() || isIprStaff || isIprManager;

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>

          {showRdMenu && (
            <>
              <li className="sidebar-heading">R&D</li>
              <li>
                <NavLink to="/staff-details">Faculty Details</NavLink>
              </li>
              <li>
                <NavLink to="/students">Student Details</NavLink>
              </li>
            </>
          )}

          {showIprMenu && (
            <>
              <li className="sidebar-heading">IPR</li>
              <li><NavLink to="/ipr">IPR Details</NavLink></li>
            </>
          )}

          {(isAdmin() || isRdManager || isIprManager) && (
            <>
              <li className="sidebar-heading">Management</li>
              {(isAdmin() || isRdManager) && (
                <li><NavLink to="/staff-management/rd">R&D Faculty Management</NavLink></li>
              )}
              {(isAdmin() || isIprManager) && (
                <li><NavLink to="/staff-management/ipr">IPR Faculty Management</NavLink></li>
              )}
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;