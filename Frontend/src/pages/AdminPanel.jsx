import React, { useEffect } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import ROLE from '../common/role'
import AdminSidebar from '../components/AdminSidebar'


const AdminPanel = () => {
    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()

    useEffect( ()=>{
        if(user?.role !== ROLE.ADMIN){
            navigate('/')
        }
    },[user])
    return (
        <div className='min-h-[calc(100vh-120px)] flex flex-col md:flex-row'>
            <AdminSidebar />
            <main className='flex-1 p-4 md:p-6 bg-gray-50 min-h-screen'>
                <Outlet />
            </main>
        </div>
    )
}

export default AdminPanel

