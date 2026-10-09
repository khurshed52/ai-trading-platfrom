import { useMutation } from "@tanstack/react-query";

import { transferFunds } from "@/services/transfer.services";

export function useTransferFunds() {
  return useMutation({ mutationFn: transferFunds });
}
