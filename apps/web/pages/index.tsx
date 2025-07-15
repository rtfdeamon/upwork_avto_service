import Link from 'next/link';

export default function Home() {
  return (
    <div className="card">
      <h1>Welcome</h1>
      <Link href="/login">Login</Link>
    </div>
  );
}
