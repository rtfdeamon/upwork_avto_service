import { signOut } from 'next-auth/react';
import Sidebar from './Sidebar';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>
        <button onClick={() => signOut()} style={{ float: 'right' }}>
          Sign out
        </button>
        <h2>Dashboard</h2>
      </header>
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
