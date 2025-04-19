// src/components/vehicles/DeleteVehicleDialog.tsx
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

interface DeleteVehicleDialogProps {
  vehicleId: string | null;
  vehicleCode: string | null; // For display in the confirmation
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteVehicleDialog: React.FC<DeleteVehicleDialogProps> = ({
  vehicleId,
  vehicleCode,
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({ // Expects ID, returns void on success
    // Assume apiService.deleteVehicle(id) exists
    mutationFn: (id) => apiService.vehicles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      // Optionally invalidate specific vehicle query if needed elsewhere
      // queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      toast.success("Vehicle Deleted", {
        description: `Vehicle ${vehicleCode ?? ""} deleted successfully.`,
      });
      onOpenChange(false); // Close dialog
      onSuccess?.();
    },
    onError: (error) => {
      apiService.handleApiError(error, (opts) =>
        toast.error(opts),
      );
      // Optionally keep dialog open on error? Or close?
      // onOpenChange(false);
      console.error("Delete vehicle error details:", error);
    },
  });

  const handleDelete = () => {
    if (vehicleId) {
      mutation.mutate(vehicleId);
    }
  };

  // Prevent closing via overlay click if mutation is pending
  const handleOpenChange = (open: boolean) => {
      if (mutation.isPending) return;
      onOpenChange(open);
  }

  return (
    // Use AlertDialog for confirmation semantics
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            vehicle <span className="font-semibold">{vehicleCode ?? ""}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Destructive style
          >
            {mutation.isPending ? (
              <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting... </>
            ) : (
              <> <Trash2 className="mr-2 h-4 w-4" /> Delete </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
