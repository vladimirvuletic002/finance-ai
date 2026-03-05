import axios from "axios";
import { toast } from "react-toastify";

export const handleError = (error: any) => {

  if (!axios.isAxiosError(error)) {
    toast.error("Unexpected error");
    return;
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // ARRAY: ["msg1", "msg2"]
  if (Array.isArray(data?.error)) {
    data.error.forEach((msg: any) => {
      toast.warning(msg.description || msg);
    });
    return;
  }

  if (status === 500) {
    toast.error("Internal Server Error");
    return;
  }

  // OBJECT: { email: ["Invalid"], pass: ["Too short"] }
  if (typeof data?.error === "object" && data?.error !== null) {
    Object.values(data.error).forEach((arr: any) => {
      toast.warning(arr[0]);
    });
    return;
  }

  // STRING: "Invalid credentials"
  if (typeof data?.error === "string") {
    toast.warning(data.error);
    return;
  }

  // FALLBACK za data.message
  if (typeof data?.message === "string") {
    toast.warning(data.message);
    return;
  }

  if (status === 401) {
    toast.warning("Please login");
    return;
  }

  

  toast.error("Unexpected server error");
};