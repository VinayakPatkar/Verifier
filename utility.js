function sanitizeInput(FirstName,LastName,RollNo,Email,Mark1,Mark2,Mark3,Mark4,Mark5)
{
    if(FirstName==""||LastName==""||RollNo==""||Email==""||Mark1==""||Mark2==""||Mark3==""||Mark4==""||Mark5==""){
        return false
    }
    return true
}
module.exports = sanitizeInput