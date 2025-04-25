// src/components/apikeys/EditApiKeyForm.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { ApiValidationError } from "@/types/api";
import {
  ApiAuthToken,
  UpdateApiAuthTokenPayload,
} from "@/types/apiAuthToken";

interface EditApiKeyFormProps {
  apiKey: ApiAuthToken; // The current API Key data
  onSuccess: () => void;
  onCancel: () => void;
}

const getFieldError = (
  errors: ApiValidationError | null,
  field: keyof UpdateApiAuthTokenPayload | string
): string | null => {
  return errors?.[field as keyof ApiValidationError]?.[0] ?? null;
};

export const EditApiKeyForm: React.FC<EditApiKeyFormProps> = ({
  apiKey,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(apiKey.title);
  const [description, setDescription] = useState(apiKey.description ?? ""); // Handle null description

  const [validationErrors, setValidationErrors] = useState<ApiValidationError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form state if the apiKey prop changes (e.g., dialog reused for different keys)
  useEffect(() => {
    setTitle(apiKey.title);
    setDescription(apiKey.description ?? "");
    setValidationErrors(null);
    setSubmitError(null);
  }, [apiKey]);

  const mutation = useMutation<ApiAuthToken, Error, UpdateApiAuthTokenPayload>({
    mutationFn: (payload) => apiService.apiAuthTokens.update(apiKey.id, payload),
    onSuccess: (data) => {
      // Invalidate list query and the specific key query
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      queryClient.invalidateQueries({ queryKey: ["apiKey", apiKey.id] });

      toast.success("API Key Updated", {
        description: `API Key "${data.title}" updated successfully.`,
      });
      setValidationErrors(null);
      setSubmitError(null);
      onSuccess(); // Close dialog via callback
    },
    onError: (error) => {
      const errors = apiService.handleApiError(error, (title, opts) =>
        toast.error(title, opts)
      );
      if (errors) {
        setValidationErrors(errors);
        setSubmitError(null);
      } else {
        setSubmitError("An unexpected error occurred during update.");
        setValidationErrors(null);
      }
      console.error("Update API key error details:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);
    setSubmitError(null);

    if (!title) {
        setValidationErrors({ title: ["Title is required."] });
        return;
    }

    // Construct payload - only include fields if they changed?
    // Simpler approach (matching VehicleEditForm): send all editable fields.
    // API should handle unchanged values correctly for PATCH.
    const payload: UpdateApiAuthTokenPayload = {
      title,
      // Send null if description is empty and API expects null to clear it.
      // Send undefined if API ignores missing fields. Assume null is for clearing.
      description: description || null,
    };

    // Optional: Only mutate if changes were actually made
    // if (payload.title === apiKey.title && payload.description === (apiKey.description ?? null)) {
    //     toast.info("No changes detected.");
    //     onCancel(); // Or onSuccess() depending on desired behavior
    //     return;
    // }

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {submitError && !validationErrors && (
        <Alert variant="destructive" className="mb-4 col-span-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-apiKeyTitle" className="text-right pt-2">Title*</Label>
        <div className="col-span-3">
          <Input
            id="edit-apiKeyTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mutation.isPending}
            required
            aria-required="true"
            className={getFieldError(validationErrors, "title") ? "border-destructive" : ""}
          />
          {getFieldError(validationErrors, "title") && (
            <p className="text-sm text-destructive mt-1">
              {getFieldError(validationErrors, "title")}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="edit-apiKeyDescription" className="text-right pt-2">Description</Label>
        <div className="col-span-3">
          <Textarea
            id="edit-apiKeyDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={mutation.isPending}
            placeholder="Optional: Describe the purpose of this key"
            rows={3}
            className={getFieldError(validationErrors, "description") ? "border-destructive" : ""}
          />
          {getFieldError(validationErrors, "description") && (
            <p className="text-sm text-destructive mt-1">
              {getFieldError(validationErrors, "description")}
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel} // Use the passed cancel handler
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};