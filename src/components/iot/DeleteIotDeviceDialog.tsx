// src/components/iot/DeleteIotDeviceDialog.tsx
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

interface DeleteIotDeviceDialogProps {
    deviceId: string | null;
    deviceMacAddress: string | null; // For display in confirmation
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const DeleteIotDeviceDialog: React.FC<DeleteIotDeviceDialogProps> = ({
    deviceId,
    deviceMacAddress,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<void, Error, string>({
        mutationFn: (id) => apiService.iotDevices.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["iotDevices"] });
            // Optionally invalidate specific device query if cached elsewhere
            // queryClient.invalidateQueries({ queryKey: ['iotDevice', deviceId] });
            toast.success("IoT Device Deleted", {
                description: `Device ${deviceMacAddress ?? ""} deleted successfully.`,
            });
            onOpenChange(false); // Close dialog
            onSuccess?.();
        },
        onError: (error) => {
            apiService.handleApiError(error, (title, opts) =>
                toast.error(title, opts)
            );
            // Consider keeping dialog open on error? Usually close is fine.
            // onOpenChange(false);
            console.error("Delete IoT device error:", error);
        },
    });

    const handleDelete = () => {
        if (deviceId) {
            mutation.mutate(deviceId);
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
                        IoT device with MAC address <span className="font-semibold">{deviceMacAddress ?? ""}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={mutation.isPending || !deviceId} // Also disable if no ID somehow
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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