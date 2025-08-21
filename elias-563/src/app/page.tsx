import { FileText, Table, Presentation, Mail, Users, FolderOpen } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const apps = [
    {
      name: 'Word',
      icon: FileText,
      description: 'Document editor',
      href: '/word',
      color: 'bg-blue-500'
    },
    {
      name: 'Excel',
      icon: Table,
      description: 'Spreadsheet application',
      href: '/excel',
      color: 'bg-green-500'
    },
    {
      name: 'PowerPoint',
      icon: Presentation,
      description: 'Presentation maker',
      href: '/powerpoint',
      color: 'bg-orange-500'
    },
    {
      name: 'Mail',
      icon: Mail,
      description: 'Email client',
      href: '/mail',
      color: 'bg-purple-500'
    },
    {
      name: 'Teams',
      icon: Users,
      description: 'Collaboration hub',
      href: '/teams',
      color: 'bg-indigo-500'
    },
    {
      name: 'Files',
      icon: FolderOpen,
      description: 'File manager',
      href: '/files',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Elias 563</h1>
              <span className="ml-2 text-sm text-gray-500">Office Suite</span>
            </div>
            <nav className="flex space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Sign In</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your Complete Office Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, collaborate, and communicate. 
            Built for modern teams and individuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app) => (
            <Link key={app.name} href={app.href}>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 text-center group cursor-pointer">
                <div className={`${app.color} w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <app.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.name}</h3>
                <p className="text-gray-600">{app.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Elias 563?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Fast & Modern</h4>
                <p className="text-gray-600">Built with the latest web technologies for speed and reliability.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cloud-First</h4>
                <p className="text-gray-600">Access your work from anywhere with automatic cloud sync.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Team Collaboration</h4>
                <p className="text-gray-600">Real-time collaboration features to work better together.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
