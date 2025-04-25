// src/pages/ApiAuthPage.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { AlertCircle } from "lucide-react";

// Import your components for API Keys
import { ApiKeyList } from "@/components/apikeys/ApiKeyList";
import { CreateApiKeyDialog } from "@/components/apikeys/CreateApiKeyDialog";
import { EditApiKeyDialog } from "@/components/apikeys/EditApiKeyDialog";
import { DeleteApiKeyDialog } from "@/components/apikeys/DeleteApiKeyDialog";

// Import types and services
import apiService from "@/services/apiService";
import { ApiAuthToken } from "@/types/apiAuthToken";

export default function ApiAuthPage() {
  // State for controlling dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApiKeyId, setEditingApiKeyId] = useState<string | null>(null);
  const [deletingApiKey, setDeletingApiKey] = useState<{ id: string; title: string } | null>(null);

  // Derived state for dialog visibility
  const isEditOpen = !!editingApiKeyId;
  const isDeleteOpen = !!deletingApiKey;

  // Fetch API Key list data
  const {
    data: apiKeys = [], // Default to empty array
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<ApiAuthToken[], Error>({
    queryKey: ["apiKeys"], // Use plural for the list
    queryFn: () => apiService.apiAuthTokens.list(), // Use the correct service function
    refetchOnWindowFocus: false,
    // Add placeholderData or initialData if desired
    // placeholderData: [],
  });

  // --- Action Handlers (Dialogs) ---
  const handleEdit = (apiKeyId: string) => setEditingApiKeyId(apiKeyId);
  const handleDelete = (apiKeyId: string, apiKeyTitle: string) => setDeletingApiKey({ id: apiKeyId, title: apiKeyTitle });

  // --- Render Logic ---
  if (isError) {
    // Error toast is likely already shown by apiService.handleApiError via React Query's default onError
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
          {/* Create Dialog Trigger is inside the CreateApiKeyDialog component */}
          <CreateApiKeyDialog
            isOpen={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            // onSuccess={() => refetch()} // Refresh handled by invalidateQueries in form
          />
        </div>
      </div>

      {/* Show loading spinner overlaying the content area */}
      {isLoading && !apiKeys.length ? ( // Show loader only on initial load
         <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
         </div>
      ) : (
        // Render the list (pass isLoading for internal caption handling)
        <ApiKeyList
          apiKeys={apiKeys}
          isLoading={isLoading} // Pass loading state for table caption/overlay
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Render Modals/Dialogs */}
      <EditApiKeyDialog
        apiKeyId={editingApiKeyId}
        isOpen={isEditOpen}
        onOpenChange={(open) => !open && setEditingApiKeyId(null)}
        // onSuccess={() => refetch()} // Refresh handled by invalidateQueries in form
      />
      <DeleteApiKeyDialog
        apiKeyId={deletingApiKey?.id ?? null}
        apiKeyTitle={deletingApiKey?.title ?? null}
        isOpen={isDeleteOpen}
        onOpenChange={(open) => !open && setDeletingApiKey(null)}
        // onSuccess={() => refetch()} // Refresh handled by invalidateQueries in mutation
      />
    </div>
  );
}