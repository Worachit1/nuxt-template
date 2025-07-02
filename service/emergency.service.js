import { client } from "./httpCilent";
import axios from 'axios';

export const fetchEmergencies = (Query) => {
  return client({
    method: "get",
    url: "/emergencies/list",
    params: {
      ...Query,
    },
  });
};

export const fetchEmergenciesByUserId = (userId) => {
  return client({
    method: "get",
    url: `/emergencies/user/${userId}`,
  });
};

// ใน service/emergency.js
export const createEmergencies = (payload) => {
  return client({
    method: "post",
    url: "/emergencies/create",
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateEmergencies = (payload, id) => {
  return client({
    method: "patch",
    url: `/emergencies/officer/${id}`,
    data: payload,
    headers: {
      "Content-Type": "application/json"
    }
  });
};


export const deleteEmergencies = (id) => {
  return client({
    method: "delete",
    url: `/emergencies/${id}`,
  });
};

export const getEmergenciesByUserId = (userId) => {
  return client({
    method: "get",
    url: `/emergencies/users/${userId}`,
  });
};
