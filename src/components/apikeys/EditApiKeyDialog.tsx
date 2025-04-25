// src/components/apikeys/EditApiKeyDialog.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import apiService from "@/services/apiService";
import { ApiAuthToken } from "@/types/apiAuthToken";
import { EditApiKeyForm } from "./EditApiKeyForm"; // Import the Edit form

interface EditApiKeyDialogProps {
    apiKeyId: string | null; // ID of the key to edit
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const EditApiKeyDialog: React.FC<EditApiKeyDialogProps> = ({
    apiKeyId,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    // Fetch the specific API Key data when the dialog is open and ID is provided
    const {
        data: apiKeyData,
        isLoading,
        isError,
        error,
        isFetching, // Use isFetching for subsequent loads within the dialog
    } = useQuery<ApiAuthToken, Error>({
        queryKey: ["apiKey", apiKeyId], // Unique query key per key ID
        queryFn: () => apiService.apiAuthTokens.getById(apiKeyId!),
        enabled: !!apiKeyId && isOpen, // Only fetch when dialog is open and ID exists
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const handleSuccess = () => {
        onOpenChange(false); // Close dialog on successful update
        onSuccess?.(); // Call optional success handler (e.g., refetch list)
    };

    // Use a stable handleCancel function
    const handleCancel = React.useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit API Key</DialogTitle>
                    <DialogDescription>
                        Update the title or description for this API key.
                    </DialogDescription>
                </DialogHeader>
                {(isLoading || isFetching) && !apiKeyData && ( // Show spinner on initial load or refetch before data arrives
                    <div className="flex justify-center items-center h-40">
                        <LoadingSpinner />
                    </div>
                )}
                {isError && !isLoading && ( // Show error only if not loading
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error Loading API Key Data</AlertTitle>
                        <AlertDescription>
                            Could not load data for editing. {(error as Error)?.message}
                        </AlertDescription>
                    </Alert>
                )}
                {/* Render form only when data is successfully loaded */}
                {!isLoading && !isError && apiKeyData && (
                    <EditApiKeyForm
                        apiKey={apiKeyData}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel} // Pass the cancel handler
                    />
                )}
                 {/* If loading/fetching but data exists (likely a background refetch), show form grayed out? Optional */}
                 {/* { (isLoading || isFetching) && apiKeyData && (...) } */}
            </DialogContent>
        </Dialog>
    );
};