import { Chart, AxisOptions } from '@tanstack/react-charts'
import { useMemo } from 'react'

interface Point { month: Date; value: number }
interface Props { data: { day: string; sent: number; replies: number }[] }

export default function WinRateByMonth({ data }: Props) {
  const monthly = useMemo(() => {
    const m: Record<string, { sent: number; replies: number }> = {}
    data.forEach(d => {
      const key = d.day.slice(0,7)
      if(!m[key]) m[key] = { sent:0, replies:0 }
      m[key].sent += d.sent
      m[key].replies += d.replies
    })
    return Object.entries(m).map(([k,v]) => ({ month: new Date(k+'-01'), value: v.sent ? v.replies/v.sent*100 : 0 }))
  }, [data])

  const series = useMemo(() => [{ label: 'Win rate', data: monthly }], [monthly])

  const primaryAxis = useMemo<AxisOptions<Point>>(() => ({ getValue: d => d.month }), [])
  const secondaryAxes = useMemo<AxisOptions<Point>[]>(() => [{ getValue: d => d.value, elementType: 'area' }], [])

  return <Chart options={{ data: series, primaryAxis, secondaryAxes }} />
}
