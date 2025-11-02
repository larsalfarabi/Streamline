import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/src/services/auth.service";

/**
 * Hook untuk fetch current user
 * Biasanya jarang digunakan karena data user ada di session Next-Auth
 * Tapi bisa digunakan untuk fetch additional user data dari backend
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: Infinity, // User data jarang berubah
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
