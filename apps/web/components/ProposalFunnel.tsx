import { Chart, AxisOptions } from '@tanstack/react-charts'
import { useMemo } from 'react'

interface Bar { date: Date; sent: number; replies: number }
interface Props { data: { day: string; sent: number; replies: number }[] }

export default function ProposalFunnel({ data }: Props) {
  const series = useMemo(() => [
    {
      label: 'Sent',
      data: data.map(d => ({ date: new Date(d.day), value: d.sent })),
    },
    {
      label: 'Replies',
      data: data.map(d => ({ date: new Date(d.day), value: d.replies })),
    },
  ], [data])

  const primaryAxis = useMemo<AxisOptions<Bar>>(() => ({ getValue: d => d.date }), [])
  const secondaryAxes = useMemo<AxisOptions<Bar>[]>(() => [{ getValue: d => (d as any).value, elementType: 'bar' }], [])

  return <Chart options={{ data: series, primaryAxis, secondaryAxes }} />
}
