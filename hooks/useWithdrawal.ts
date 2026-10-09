import { useMutation } from "@tanstack/react-query";

import { withdrawFunds } from "@/services/withdrawal.services";

export function useWithdrawFunds() {
  return useMutation({
    mutationFn: withdrawFunds,
  });
}
