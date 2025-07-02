// useAuth composable
import service from "../service";

export const useAuth = () => {
  const isLoading = ref(false);

  // ✅ เพิ่มตรงนี้เพื่ออ่าน user_id จาก cookie
  const user_id = useCookie("user_id");

  const sendAuth = async (payload) => {
    try {
      const response = await service.auth.sendLogin(payload);
      console.log("Login successfully!", response.data);

      const actualRole = response.data.user?.role || response.data.role;

      // ✅ เก็บ user_id ลง cookie
      const userIdCookie = useCookie("user_id");
      userIdCookie.value = response.data.user?.id || response.data.id;

      const tokenCookie = useCookie("token");
      const roleCookie = useCookie("userRole");

      tokenCookie.value = response.data.token;
      roleCookie.value = actualRole;

      return {
        success: true,
        token: response.data.token,
        role: actualRole,
        userData: response.data.user || response.data,
        selectedRole: payload.role,
      };
    } catch (err) {
      console.error("Login failed:", err);
      return {
        success: false,
        token: null,
        role: null,
        error: err.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const sendLogout = async () => {
    try {
      await service.auth.sendLogout();
      console.log("Logout successfully!");

      // ลบ cookies เมื่อ logout
      const tokenCookie = useCookie("token");
      const roleCookie = useCookie("userRole");
      const userIdCookie = useCookie("user_id");

      tokenCookie.value = null;
      roleCookie.value = null;
      userIdCookie.value = null;
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const sendRegister = async (payload) => {
    try {
      const response = await service.auth.sendRegister(payload);
      console.log("Register successfully", response);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      console.error("Register failed", err);
      return {
        success: false,
        error: err.response?.data?.message || "Registration failed",
      };
    }
  };

  return {
    sendAuth,
    sendLogout,
    sendRegister,
    isLoading,
    user_id, // ✅ ตอนนี้ประกาศไว้แล้ว
  };
};
