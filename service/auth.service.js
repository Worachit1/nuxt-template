import { client } from "./httpCilent";

export const sendLogin = (payload) => {
  return client({
    method: "post",
    url: "/login",
    data: payload,
  });
};

export const sendLogout = () => {
  return client({
    method: "post",
    url: "/logout",
  });
};

export const sendRegister = (payload) => {
  return client({
    method: "post",
    url: "/users/register",
    data: payload,
  });
};
