import useSWR, { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';

interface Proposal {
  id: string;
  jobTitle?: string;
  draft: string;
}

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function Drafts() {
  const { data: session } = useSession();
  const { data } = useSWR<Proposal[]>(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/proposals?status=DRAFT`, session.accessToken] : null,
    ([url, token]) => fetcher(url, token)
  );

  const send = async (id: string) => {
    await fetch(`/api/proposals/${id}/send`, { method: 'POST' });
    mutate([`${process.env.NEXT_PUBLIC_API_URL}/proposals?status=DRAFT`, session!.accessToken]);
  };

  return (
    <Layout>
      <div className="card">
      <table className="drafts-table">
        <tbody>
          {data?.map((p) => (
            <tr key={p.id}>
              <td>{p.jobTitle}</td>
              <td>
                <pre>{p.draft.slice(0, 120)}…</pre>
              </td>
              <td>
                <button onClick={() => send(p.id)}>Send</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Layout>
  );
}
