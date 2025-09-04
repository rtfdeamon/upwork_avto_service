import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useState } from 'react';
import Layout from '../../components/Layout';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function UpworkSearch() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [alias, setAlias] = useState('');
  const [url, setUrl] = useState<string | null>(null);

  const { data, isLoading } = useSWR(
    session && url ? [url, (session as any).accessToken] : null,
    ([u, token]) => fetcher(u, token)
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (alias) params.set('alias', alias);
    setUrl(`${process.env.NEXT_PUBLIC_API_URL}/upwork/jobs?${params.toString()}`);
  };

  const draftNow = async (job: any) => {
    await fetch(`/api/proposals/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, alias }),
    });
    alert('Draft created');
  };

  return (
    <Layout>
      <h1>Upwork Search</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={onSearch}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label>
              Query
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="react, nextjs" />
            </label>
            <label>
              Alias (optional)
              <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Personal" />
            </label>
            <button type="submit">Search</button>
          </div>
        </form>
      </div>
      <div className="card">
        {isLoading && url ? <div>Loading…</div> : null}
        {data ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((j: any) => (
                <tr key={j.id}>
                  <td>{j.id}</td>
                  <td>{j.title}</td>
                  <td>
                    <button onClick={() => draftNow(j)}>Draft</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>Enter a query and press Search</div>
        )}
      </div>
    </Layout>
  );
}
