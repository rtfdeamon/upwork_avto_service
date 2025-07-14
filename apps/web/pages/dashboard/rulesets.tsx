import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function Rulesets() {
  const { data: session } = useSession();
  const { data } = useSWR(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/rulesets`, session.accessToken] : null,
    ([url, token]) => fetcher(url, token)
  );
  return (
    <Layout>
      <h1>Rulesets</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Layout>
  );
}
