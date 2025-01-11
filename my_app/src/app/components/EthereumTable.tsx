'use client'

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";

type EthereumMetric = {
  id: string
  name: string
  value: string
  change24h: number
}

const dummyMetrics: EthereumMetric[] = [
  { id: '1', name: 'Price', value: '$1,800.25', change24h: 2.5 },
  { id: '2', name: 'Market Cap', value: '$216.5B', change24h: 1.8 },
  { id: '3', name: 'Trading Volume', value: '$10.2B', change24h: -3.2 },
  { id: '4', name: 'Gas Price (Gwei)', value: '25', change24h: 10.5 },
  { id: '5', name: 'Total Value Locked', value: '$22.8B', change24h: -0.7 },
  { id: '6', name: 'Active Addresses', value: '512,345', change24h: 5.2 },
  { id: '7', name: 'Network Hash Rate', value: '745.3 TH/s', change24h: 0.9 },
  { id: '8', name: 'Transactions per Day', value: '1.2M', change24h: -1.5 },
]

export function EthereumMetricsTable() {
  const [metrics] = useState<EthereumMetric[]>(dummyMetrics)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMetrics = metrics.filter(metric =>
    metric.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 bg-gray-900 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-100">Ethereum Metrics</h2>
      <Input
        placeholder="Search metrics..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 bg-gray-800 text-gray-100 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-300">Metric</TableHead>
            <TableHead className="text-gray-300">Value</TableHead>
            <TableHead className="text-gray-300">24h Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMetrics.map((metric) => (
            <TableRow key={metric.id} className="border-b border-gray-800">
              <TableCell className="font-medium text-gray-100">{metric.name}</TableCell>
              <TableCell className="text-gray-300">{metric.value}</TableCell>
              <TableCell className={metric.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                {metric.change24h > 0 ? '+' : ''}{metric.change24h}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}