import axios from "axios";
import { toast } from "react-toastify";

// Backend errors are always shaped as { error: { message, code } }
// (see backend/src/middlewares/error.middleware.ts).
export const handleError = (error: any) => {

  if (!axios.isAxiosError(error)) {
    toast.error("Unexpected error");
    return;
  }

  const message = error.response?.data?.error?.message;

  if (typeof message === "string" && message.length > 0) {
    toast.warning(message);
    return;
  }

  if (error.response?.status === 401) {
    toast.warning("Please login");
    return;
  }

  toast.error("Unexpected server error");
};
