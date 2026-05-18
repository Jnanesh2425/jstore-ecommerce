const userModel = require("../../models/userModel")

async function updateUser(req,res){
    try{
        const sessionUser = req.userId
        const {name, email, role, profilePic, phone, gender} = req.body

        const payload = {
            ...(email && {email : email}),
            ...(name && {name : name}),
            ...(role && {role : role}),
            ...(profilePic && {profilePic : profilePic}),
            ...(phone && {phone : phone}),
            ...(gender && {gender : gender})
        }

        const updateUser = await userModel.findByIdAndUpdate(sessionUser, payload, { new: true })
        res.json({
            data: updateUser,
            message: 'User Updated',
            success: true,
            error: false
        })
    }catch(err){
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}
module.exports = updateUser