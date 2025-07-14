import { Chart, AxisOptions } from '@tanstack/react-charts'
import { useMemo } from 'react'

interface Point { date: Date; value: number }
interface Props { data: { day: string; sent: number; replies: number }[] }

export default function RoiTrend({ data }: Props) {
  const series = useMemo(() => [{
    label: 'ROI',
    data: data.map(d => ({ date: new Date(d.day), value: d.sent ? d.replies / d.sent * 100 : 0 })),
  }], [data])

  const primaryAxis = useMemo<AxisOptions<Point>>(() => ({
    getValue: datum => datum.date,
  }), [])

  const secondaryAxes = useMemo<AxisOptions<Point>[]>(() => [{
    getValue: datum => datum.value,
  }], [])

  return <Chart options={{ data: series, primaryAxis, secondaryAxes }} />
}
