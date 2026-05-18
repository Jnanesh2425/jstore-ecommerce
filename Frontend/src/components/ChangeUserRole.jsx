import React from 'react'
import ROLE from '../common/role'
import { IoMdClose } from 'react-icons/io'
import { useState } from 'react'
import summaryAPI from '../common'
import { toast } from 'react-toastify'

const ChangeUserRole = ({
    name,
    email,
    userId,
    role,
    onClose,
    onUpdate, // Add this prop for refreshing the table
}) => {
    const [userRole, setUserRole] = useState(role)
    const handleOnChangeSelect = (e) => {
        setUserRole(e.target.value)
    }
    const updateUserRole = async () => {
        const fetchResponse = await fetch(summaryAPI.updateUser.url, {
            method: summaryAPI.updateUser.method,
            credentials: 'include',
            headers: {
                "Content-Type": "application/json" //Tells the server the request body will be in JSON format.
            },
            body: JSON.stringify({  // converts the JS object into a JSON string.
                userId: userId,
                role: userRole
            })
        })

        const responseData = await fetchResponse.json()
        if (responseData.success) {
            toast.success(responseData.message)
            onUpdate && onUpdate() // Call onUpdate if provided
            onClose()
        }
        console.log("role updated", responseData)
    }
    return (
        <div className='fixed top-0 bottom-0 left-0 w-full h-full z-10 flex justify-between items-center bg-slate-200/50'>
            <div className='mx-auto bg-white shadow-md p-4 w-full max-w-sm'>
                <button className='block ml-auto cursor-pointer' onClick={onClose}>
                    <IoMdClose />
                </button>
                <h1 className=' pb-4 text-lg font-medium'>Change User Role</h1>
                <p>Name : {name}</p>
                <p>Email : {email}</p>
                <div className='flex items-center justify-between'>
                    <p>Role :</p>
                    <select className='border px-3 my-3 cursor-pointer' value={userRole} onChange={handleOnChangeSelect}>
                        {
                            //It converts the values of ROLE objects into an array and sends to the map function
                            Object.values(ROLE).map(el => {
                                return (
                                    <option value={el} key={el}>
                                        {el}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>
                <button className='w-fit mx-auto block py-1 px-3 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer' onClick={updateUserRole} >
                    Change Role
                </button>
            </div>
        </div>
    )

}

export default ChangeUserRole