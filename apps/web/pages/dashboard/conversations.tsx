import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Sidebar from '../../components/Sidebar';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function Conversations() {
  const { data: session } = useSession();
  const { data } = useSWR(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/conversations?since=7d`, session.accessToken] : null,
    ([url, token]) => fetcher(url, token),
  );

  return (
    <div>
      <Sidebar />
      <h1>Conversations</h1>
      <table>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Snippet</th>
            <th>When</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((c: any) => (
            <tr key={c.id}>
              <td>{c.jobTitle}</td>
              <td>{c.snippet}</td>
              <td>{new Date(c.ts).toLocaleString()}</td>
              <td>
                <a href={`https://www.upwork.com/jobs/~${c.jobId}`} target="_blank" rel="noreferrer">
                  Open in Upwork
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
