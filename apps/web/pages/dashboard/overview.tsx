import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import RoiTrend from '../../components/RoiTrend';
import ProposalFunnel from '../../components/ProposalFunnel';
import WinRateByMonth from '../../components/WinRateByMonth';
import Sidebar from '../../components/Sidebar';

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
    <div>
      <Sidebar />
      <h1>Overview</h1>
      {series ? <RoiTrend chartData={series} /> : null}
      {data ? (
        <div>
          <ProposalFunnel data={data.daily} />
          <WinRateByMonth data={data.daily} />
        </div>
      ) : null}
    </div>
  );
}
