import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EvidenceDrawer } from '../common/EvidenceDrawer';
import { ContextDrawer } from '../common/ContextDrawer';

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header />
        <Outlet />
      </div>
      <EvidenceDrawer />
      <ContextDrawer />
    </div>
  );
}
