import { signOut } from 'next-auth/react';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <aside className="layout-sidebar">
        <Sidebar />
      </aside>
      <div className="layout-main">
        <header className="layout-header">
          <button onClick={() => signOut()} style={{ float: 'right' }}>
            Sign out
          </button>
          <h2>Dashboard</h2>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
