import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import RoiTrend from '../../components/RoiTrend';
import ProposalFunnel from '../../components/ProposalFunnel';
import WinRateByMonth from '../../components/WinRateByMonth';
import Layout from '../../components/Layout';

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export default function Overview() {
  const { data: session } = useSession();
  const { data } = useSWR(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/metrics/summary?range=30d`, session.accessToken] : null,
    ([url, token]) => fetcher(url, token)
  );
  const { data: series } = useSWR(
    session ? [`${process.env.NEXT_PUBLIC_API_URL}/metrics/series?kind=sent&range=30d`, session.accessToken] : null,
    ([url, token]) => fetcher(url, token)
  );
  return (
    <Layout>
      <h1>Overview</h1>
      {series ? <div className="card"><RoiTrend chartData={series} /></div> : null}
      {data ? (
        <div className="card">
          <ProposalFunnel data={data.daily} />
          <WinRateByMonth data={data.daily} />
        </div>
      ) : null}
    </Layout>
  );
}
