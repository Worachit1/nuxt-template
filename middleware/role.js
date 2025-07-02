// middleware/role.js
export default function (to, from) {
  if (process.client) {
    const userCookie = useCookie('user')
    
    // ตรวจสอบว่ามีข้อมูล user หรือไม่
    if (!userCookie.value) {
      return navigateTo('/login')
    }
    
    let userData
    try {
      // Parse ข้อมูล user จาก cookie
      userData = typeof userCookie.value === 'string' 
        ? JSON.parse(userCookie.value) 
        : userCookie.value
    } catch (err) {
      console.error('Error parsing user data:', err)
      return navigateTo('/login')
    }
    
    // ตรวจสอบว่ามี ID และ role หรือไม่
    if (!userData.id || !userData.role) {
      return navigateTo('/login')
    }
    
    // ตรวจสอบ role สำหรับหน้า admin
    if (to.path.startsWith('/admin') && userData.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Admin role required.'
      })
    }
    
    // ตรวจสอบ role สำหรับหน้า user
    if (to.path.startsWith('/user') && userData.role !== 'user') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. User role required.'
      })
    }
  }
}
