import service from "../service";
import { ref } from "vue";

export const useUsers = () => {
  const query = ref({
    page: 1,
    limit: 10,
  });

  const users = ref([]);
  const isLoading = ref(false);

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      const res = await service.users.fetchUsers(query.value);
      console.log("Full API Response Data:", res.data);
      const fetchedData = res.data.data;
      users.value = fetchedData.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
      }));
      console.log("users updated:", users.value);
    } catch (err) {
      console.error("Error fetching users:", err);
      users.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserById = async (id) => {
    isLoading.value = true;
    try {
      const res = await service.users.fetchUserById(id);
      console.log("user_id???????:", res.data);
      const fetchedData = res.data.data;
      users.value = [
        {
          id: fetchedData.id,
          name: fetchedData.first_name + " " + fetchedData.last_name, // รวมชื่อ-สกุล
        },
      ];
      console.log("users ฟหกฟหก:", users.value);
    } catch (err) {
      console.error("Error fetching user by id:", err);
      users.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (payload) => {
    try {
      await service.users.createUser(payload);
      console.log("create user successfully!");
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Error creating user:", err);
      return false;
    }
  };

  const updateUser = async (payload, id) => {
    try {
      await service.users.updateUser(payload, id);
      console.log("update user successfully!");
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Error updating user:", err);
      return false;
    }
  };

  const deleteUser = async (id) => {
    try {
      await service.users.deleteUser(id);
      console.log("delete user successfully!");
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Error deleting user:", err);
      return false;
    }
  };

  return {
    users,
    isLoading,
    query,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
