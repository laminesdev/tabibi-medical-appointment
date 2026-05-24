import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.accessToken && !store.user) {
      store.loadFromStorage();
    }
  }, []);

  return store;
}
