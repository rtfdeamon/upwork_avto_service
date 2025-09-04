import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { useState } from 'react';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function ApiKeys() {
  const { data: session } = useSession();
  const { data } = useSWR(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/api-keys`, (session as any).accessToken] : null,
    ([url, token]) => fetcher(url, token)
  );

  const [alias, setAlias] = useState('');
  const [upworkKey, setUpworkKey] = useState('');
  const [upworkSecret, setUpworkSecret] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(session as any).accessToken}`,
      },
      body: JSON.stringify({ alias, upworkKey, upworkSecret }),
    });
    setAlias('');
    setUpworkKey('');
    setUpworkSecret('');
    mutate([`${process.env.NEXT_PUBLIC_API_URL}/api-keys`, (session as any).accessToken]);
  };
  return (
    <Layout>
      <h1>API Keys</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label>
              Alias
              <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Personal" />
            </label>
            <label>
              Upwork Key
              <input value={upworkKey} onChange={(e) => setUpworkKey(e.target.value)} placeholder="token" />
            </label>
            <label>
              Upwork Secret
              <input value={upworkSecret} onChange={(e) => setUpworkSecret(e.target.value)} placeholder="secret" />
            </label>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
      <div className="card"><pre>{JSON.stringify(data, null, 2)}</pre></div>
    </Layout>
  );
}
