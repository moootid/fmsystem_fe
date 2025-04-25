// src/components/apikeys/DeleteApiKeyDialog.tsx
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import apiService from "@/services/apiService";

interface DeleteApiKeyDialogProps {
  apiKeyId: string | null;
  apiKeyTitle: string | null; // For display in the confirmation
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteApiKeyDialog: React.FC<DeleteApiKeyDialogProps> = ({
  apiKeyId,
  apiKeyTitle,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => apiService.apiAuthTokens.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      // Optionally invalidate specific key query if cached elsewhere
      // queryClient.invalidateQueries({ queryKey: ['apiKey', apiKeyId] });
      toast.success("API Key Deleted", {
        description: `API Key "${apiKeyTitle ?? ""}" deleted successfully.`,
      });
      onOpenChange(false); // Close dialog
      onSuccess?.();
    },
    onError: (error) => {
       // Let handleApiError show the toast
      apiService.handleApiError(error, (title, opts) => toast.error(title, opts));
      // Keep dialog open on error to allow retry or cancel
      console.error("Delete API key error details:", error);
    },
  });

  const handleDelete = () => {
    if (apiKeyId) {
      mutation.mutate(apiKeyId);
    }
  };

  // Prevent closing via overlay click if mutation is pending
  const handleOpenChange = (open: boolean) => {
      if (mutation.isPending) return;
      onOpenChange(open);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            API key titled <span className="font-semibold">"{apiKeyTitle ?? ""}"</span>.
            Any applications using this key will no longer be able to authenticate.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!apiKeyId || mutation.isPending} // Also disable if no ID
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? (
              <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting... </>
            ) : (
              <> <Trash2 className="mr-2 h-4 w-4" /> Delete Key </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};