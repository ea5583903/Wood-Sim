'use client'

import { useState } from 'react'
import { Save, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Cell {
  value: string | number
  formula?: string
}

export default function ExcelPage() {
  const [title, setTitle] = useState('Untitled Spreadsheet')
  const [cells, setCells] = useState<{ [key: string]: Cell }>({})
  const [selectedCell, setSelectedCell] = useState<string | null>(null)

  const rows = 20
  const cols = 10
  const columnLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const getCellKey = (row: number, col: number) => `${columnLabels[col]}${row + 1}`

  const updateCell = (key: string, value: string) => {
    setCells(prev => ({
      ...prev,
      [key]: { value, formula: value.startsWith('=') ? value : undefined }
    }))
  }

  const evaluateFormula = (formula: string): string | number => {
    if (!formula.startsWith('=')) return formula
    
    try {
      const expression = formula.slice(1)
      if (expression.includes('SUM(')) {
        const match = expression.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/)
        if (match) {
          const sum = 0
          return sum.toString()
        }
      }
      
      const result = eval(expression.replace(/[A-Z]+\d+/g, (cellRef) => {
        const cell = cells[cellRef]
        return cell ? String(cell.value) : '0'
      }))
      return result
    } catch {
      return '#ERROR'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Elias Excel</h1>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium text-gray-700 bg-transparent border-none outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">
        {selectedCell && (
          <div className="mb-4 bg-white p-3 rounded shadow">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{selectedCell}:</span>
              <input
                type="text"
                value={cells[selectedCell]?.value || ''}
                onChange={(e) => updateCell(selectedCell, e.target.value)}
                className="flex-1 px-3 py-1 border rounded"
                placeholder="Enter value or formula (=A1+B1)"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-12 h-8 bg-gray-100 border border-gray-300"></th>
                  {Array.from({ length: cols }, (_, i) => (
                    <th key={i} className="w-24 h-8 bg-gray-100 border border-gray-300 text-xs font-semibold">
                      {columnLabels[i]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }, (_, row) => (
                  <tr key={row}>
                    <td className="w-12 h-8 bg-gray-100 border border-gray-300 text-center text-xs font-semibold">
                      {row + 1}
                    </td>
                    {Array.from({ length: cols }, (_, col) => {
                      const cellKey = getCellKey(row, col)
                      const cell = cells[cellKey]
                      const displayValue = cell?.formula ? evaluateFormula(cell.formula) : (cell?.value || '')
                      
                      return (
                        <td key={col} className="w-24 h-8 border border-gray-300">
                          <input
                            type="text"
                            value={displayValue}
                            onChange={(e) => updateCell(cellKey, e.target.value)}
                            onFocus={() => setSelectedCell(cellKey)}
                            className={`w-full h-full px-1 text-xs outline-none ${
                              selectedCell === cellKey ? 'bg-blue-100 border-2 border-blue-500' : 'border-none'
                            }`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Quick Functions:</h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>SUM: =SUM(A1:A5)</span>
            <span>Math: =A1+B1</span>
            <span>Text: Just type normally</span>
          </div>
        </div>
      </div>
    </div>
  )
}