'use client'

import { useState } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function WordPage() {
  const [documentContent, setDocumentContent] = useState('Start typing your document here...')
  const [title, setTitle] = useState('Untitled Document')

  const formatText = (command: string) => {
    if (typeof window !== 'undefined') {
      document.execCommand(command, false)
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
              <h1 className="text-xl font-semibold text-gray-900">Elias Word</h1>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium text-gray-700 bg-transparent border-none outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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

      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => formatText('bold')}
                className="p-2 rounded hover:bg-gray-100"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('italic')}
                className="p-2 rounded hover:bg-gray-100"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('underline')}
                className="p-2 rounded hover:bg-gray-100"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={() => formatText('justifyLeft')}
                className="p-2 rounded hover:bg-gray-100"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('justifyCenter')}
                className="p-2 rounded hover:bg-gray-100"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText('justifyRight')}
                className="p-2 rounded hover:bg-gray-100"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div
              contentEditable
              suppressContentEditableWarning
              className="min-h-[600px] outline-none text-gray-900 leading-relaxed"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: documentContent }}
              onInput={(e) => setDocumentContent(e.currentTarget.innerHTML)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}