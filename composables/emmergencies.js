import service from "../service";
import { ref } from "vue";

export const useEmergencies = () => {
  const query = ref({
    page: 1,
    limit: 100,
  });

  const emergencies = ref([]);
  const isLoading = ref(false);

  const fetchEmergencies = async () => {
    isLoading.value = true;
    try {
      const res = await service.emergency.fetchEmergencies(query.value);
      console.log("Full API Response Data:", res.data);
      const fetchedData = res.data.data;
      emergencies.value = fetchedData.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        officer_id: item.officer_id,
        type: item.type,
        status: item.status,
        title: item.title,
        description: item.description,
        location: item.location,
        map_link: item.map_link,
        action_note: item.action_note,
        created_at: item.created_at,
      }));
      console.log("emergencies :", emergencies.value);
    } catch (err) {
      console.error("Error fetching emergencies:", err);
      emergencies.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createEmergencies = async (payload, userId) => {
    try {
      await service.emergency.createEmergencies(payload, userId);
      console.log("create emergency successfully!");
      await fetchEmergencies();
      return true;
    } catch (err) {
      console.error("Error creating emergency:", err);
      return false;
    }
  };
  const updateEmergencies = async (payload, id) => {
    try {
      const updatePayload = {
        action_note: payload.action_note,
        status: payload.status,
        officer_id: payload.officer_id,
      };

      await service.emergency.updateEmergencies(updatePayload, id);

      console.log("update emergency successfully!", updatePayload);
      await fetchEmergencies();
      return true;
    } catch (err) {
      console.error("Error updating emergency:", err);
      return false;
    }
  };

  const deleteEmergencies = async (id) => {
    try {
      await service.emergency.deleteEmergencies(id);
      console.log("delete emergency successfully!");
      await fetchEmergencies();
      return true;
    } catch (err) {
      console.error("Error deleting emergency:", err);
      return false;
    }
  };

  const getEmergenciesByUserId = async (userId) => {
    isLoading.value = true;
    try {
      const res = await service.emergency.getEmergenciesByUserId(userId);
      console.log("emergencies by user_id:", res.data);
      const fetchedData = res.data.data;
      emergencies.value = fetchedData.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        officer_id: item.officer_id,
        type: item.type,
        status: item.status,
        title: item.title,
        description: item.description,
        location: item.location,
        map_link: item.map_link,
        action_note: item.action_note,
        created_at: item.created_at,
      }));
      console.log("emergencies by user_id:", emergencies.value);
    } catch (err) {
      console.error("Error fetching emergencies by user ID:", err);
      emergencies.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    emergencies,
    isLoading,
    query,
    fetchEmergencies,
    createEmergencies,
    updateEmergencies,
    deleteEmergencies,
    getEmergenciesByUserId,
  };
};
