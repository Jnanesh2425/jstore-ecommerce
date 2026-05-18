import React, { useState, useEffect } from 'react'
import summaryAPI from '../common'
import { toast } from 'react-toastify'
import moment from 'moment'
import { MdModeEdit } from 'react-icons/md'
import ChangeUserRole from '../components/ChangeUserRole'

const AllUsers = () => {
  const [allUser, setAllUser] = useState([])
  const [openUpdateRole, setopenUpdateRole] = useState(false)// for edit role
  const [updateUserDetails, setUpdateUserDetails] = useState({
    email: "",
    name: "",
    role: "",
    _id:""
  })
  const fetchAllUsers = async () => {
    const fetchData = await fetch(summaryAPI.allUser.url, {
      method: summaryAPI.allUser.method,
      credentials: 'include'
    })
    const dataResponse = await fetchData.json()

    if (dataResponse.success) {
      setAllUser(dataResponse.data)
    }
    if (dataResponse.error) {
      toast.error(dataResponse.message)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  return (
    <div className='bg-white'>
      <table className="userTable table-auto border-collapse w-full text-sm">
        <thead>
          <tr className='text-center'>
            <th>Sr.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            allUser.map((el, index) => {
              return (
                <tr key={el._id || index}>
                  <td>{index + 1}</td>
                  <td>{el?.name}</td>
                  <td>{el?.email}</td>
                  <td>{el?.role}</td>
                  <td>{moment(el?.createdAt).format('LL')}</td>
                  <td>
                    <button className='bg-green-200 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white'
                      onClick={() => {
                        setUpdateUserDetails(el)
                        setopenUpdateRole(true)
                      }}
                    >
                      <MdModeEdit />
                    </button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      {
        openUpdateRole && (
          <ChangeUserRole 
            onClose={() => setopenUpdateRole(false)}
            onUpdate={fetchAllUsers}  // Add this to refresh the table
            name={updateUserDetails.name}
            email={updateUserDetails.email}
            role={updateUserDetails.role}
            userId={updateUserDetails._id}
          />
        )
      }
    </div>
  )
}

export default AllUsers