import { Chart, AxisOptions } from '@tanstack/react-charts'
import { useMemo } from 'react'

interface Point { date: Date; value: number }
interface Props { chartData: { day: string; value: number }[] }

export default function RoiTrend({ chartData }: Props) {
  const series = useMemo(() => [{
    label: 'Value',
    data: chartData.map(d => ({ date: new Date(d.day), value: d.value })),
  }], [chartData])

  const primaryAxis = useMemo<AxisOptions<Point>>(() => ({
    getValue: datum => datum.date,
  }), [])

  const secondaryAxes = useMemo<AxisOptions<Point>[]>(() => [{
    getValue: datum => datum.value,
  }], [])

  return <Chart options={{ data: series, primaryAxis, secondaryAxes }} />
}
