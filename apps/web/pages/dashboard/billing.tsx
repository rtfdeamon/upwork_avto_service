import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';

export default function Billing() {
  const { data: session } = useSession();
  const handleUpgrade = async () => {
    if (!session) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stripe/checkout-session`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    );
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
  return (
    <Layout>
      <h1>Billing</h1>
      <div className="card">
        <button className="upgrade-btn" onClick={handleUpgrade}>Upgrade $49/mo</button>
      </div>
    </Layout>
  );
}
