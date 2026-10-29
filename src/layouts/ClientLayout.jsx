import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'

export default function ClientLayout() {
  const [search, setSearch] = useState('')
  return <div className="min-h-screen bg-[#F9FAFB]"><Navbar search={search} onSearch={setSearch} /><main className="mx-auto min-h-[55vh] max-w-7xl px-4 py-7"><Outlet context={{ search, setSearch }} /></main><Footer /></div>
}
