async function userLogout(req,res){
    try{
        res.clearCookie('token')  //to clear token stored in cookies

        res.json({
            message: 'Logged out successfully',
            error: false,
            success: true,
            data: [] //if no data available send empty array
        })
    }catch(err){
        res.json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = userLogout;