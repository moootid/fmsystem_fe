// src/components/apiAuth/DeleteApiAuthTokenDialog.tsx
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

interface DeleteApiAuthTokenDialogProps {
    tokenId: string | null;
    tokenTitle: string | null; // For display in confirmation
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const DeleteApiAuthTokenDialog: React.FC<DeleteApiAuthTokenDialogProps> = ({
    tokenId,
    tokenTitle,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<void, Error, string>({
        mutationFn: (id) => apiService.apiAuthTokens.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiAuthTokens"] });
            toast.success("API Key Deleted", {
                description: `Key "${tokenTitle ?? ""}" deleted successfully.`,
            });
            onOpenChange(false); // Close dialog
            onSuccess?.();
        },
        onError: (error) => {
            apiService.handleApiError(error, (title, opts) =>
                toast.error(title, opts)
            );
            console.error("Delete API key error:", error);
        },
    });

    const handleDelete = () => {
        if (tokenId) {
            mutation.mutate(tokenId);
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
                        API key titled <span className="font-semibold">{tokenTitle ?? ""}</span>.
                        Any applications using this key will stop working.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={mutation.isPending || !tokenId}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {mutation.isPending ? (
                            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting... </>
                        ) : (
                            <> <Trash2 className="h-4 w-4" /> Delete Key </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};