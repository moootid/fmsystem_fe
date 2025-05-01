// src/pages/ApiAuthPage.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AlertCircle } from "lucide-react";

// Import your new API Auth components
import { ApiAuthTokenList } from "@/components/apiAuth/ApiAuthTokenList";
import { CreateApiAuthTokenDialog } from "@/components/apiAuth/CreateApiAuthTokenDialog";
import { ViewApiAuthTokenDialog } from "@/components/apiAuth/ViewApiAuthTokenDialog";
import { DeleteApiAuthTokenDialog } from "@/components/apiAuth/DeleteApiAuthTokenDialog";
import { ShowCreatedTokenDialog } from "@/components/apiAuth/ShowCreatedTokenDialog";

// Import types and services
import apiService from "@/services/apiService";
import { ApiAuthToken } from "@/types/apiAuthToken";

export default function ApiAuthPage() {
    // State for controlling dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewingTokenId, setViewingTokenId] = useState<string | null>(null);
    const [deletingToken, setDeletingToken] = useState<{ id: string; title: string } | null>(null);
    const [newlyCreatedTokenData, setNewlyCreatedTokenData] = useState<ApiAuthToken | null>(null);

    const isViewOpen = !!viewingTokenId;
    const isDeleteOpen = !!deletingToken;
    const isShowTokenOpen = !!newlyCreatedTokenData;

    // Fetch API Auth Token list data
    const {
        data: apiAuthTokens,
        isLoading,
        error,
        isError,
        refetch,
    } = useQuery<ApiAuthToken[], Error>({
        queryKey: ["apiAuthTokens"], // Query key for API tokens
        queryFn: () => apiService.apiAuthTokens.list(), // Assuming list returns the array directly or adjust if needed
        refetchOnWindowFocus: false,
    });

    // --- Action Handlers ---
    const handleView = (tokenId: string) => setViewingTokenId(tokenId);
    const handleDelete = (tokenId: string, tokenTitle: string) => setDeletingToken({ id: tokenId, title: tokenTitle });

    // Special handler for successful creation
    const handleCreateSuccess = (createdTokenData: ApiAuthToken) => {
        setIsCreateOpen(false); // Close the creation form dialog
        setNewlyCreatedTokenData(createdTokenData); // Set data to show the token dialog
    };

    // Handler to close the "Show Token" dialog
    const handleShowTokenClose = () => {
        setNewlyCreatedTokenData(null);
    };
    // --- End Action Handlers ---

    if (isError) {
        console.error("Error fetching API keys:", error);
        return (
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching API Keys</AlertTitle>
                    <AlertDescription>
                        Could not load API key data. Please try again later.
                        <div className="mt-4">
                            <Button onClick={() => refetch()} variant="secondary"> Try Again </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Manage API Keys</h1>
                <div className="flex gap-2 items-center">
                    {/* Create Dialog Trigger */}
                    <CreateApiAuthTokenDialog
                        isOpen={isCreateOpen}
                        onOpenChange={setIsCreateOpen}
                        onSuccess={handleCreateSuccess}
                    />
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            )}

            {!isLoading && (
                <ApiAuthTokenList
                    apiAuthTokens={apiAuthTokens || []}
                    isLoading={isLoading}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            )}

            {/* Render Modals/Dialogs */}
            <ViewApiAuthTokenDialog
                tokenId={viewingTokenId}
                isOpen={isViewOpen}
                onOpenChange={(open) => !open && setViewingTokenId(null)}
            />
            <DeleteApiAuthTokenDialog
                tokenId={deletingToken?.id ?? null}
                tokenTitle={deletingToken?.title ?? null}
                isOpen={isDeleteOpen}
                onOpenChange={(open) => !open && setDeletingToken(null)}
            />
            {/* Special Dialog to show the newly created token */}
            <ShowCreatedTokenDialog
                 tokenData={newlyCreatedTokenData}
                 isOpen={isShowTokenOpen}
                 onOpenChange={(open) => !open && handleShowTokenClose()}
            />
        </div>
    );
}