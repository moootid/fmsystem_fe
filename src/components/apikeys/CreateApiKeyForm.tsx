// src/components/apikeys/CreateApiKeyForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { ApiValidationError } from "@/types/api";
import {
    CreateApiAuthTokenPayload,
    ApiAuthToken // Use the standard type for the response
} from "@/types/apiAuthToken";

interface CreateApiKeyFormProps {
  onSuccess: (data: ApiAuthToken) => void; // Expect the standard token type
}

// getFieldError remains the same

export const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [validationErrors, setValidationErrors] = useState<ApiValidationError | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mutation expects ApiAuthToken as the result
  const mutation = useMutation<ApiAuthToken, Error, CreateApiAuthTokenPayload>({
    mutationFn: (payload) => apiService.apiAuthTokens.create(payload),
    onSuccess: (data) => { // data is now ApiAuthToken
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast.success("API Key Created", {
        description: `Key "${data.title}" generated. Save it securely.`,
      });
      setValidationErrors(null);
      setSubmitError(null);
      onSuccess(data); // Pass the created data (ApiAuthToken) back
    },
    onError: (error) => {
        // Error handling remains the same
      const errors = apiService.handleApiError(error, (title, opts) =>
        toast.error(title, opts)
      );
      if (errors && typeof errors === "object") {
        setValidationErrors(errors as ApiValidationError);
        setSubmitError(null);
      } else {
        setSubmitError("An unexpected error occurred during creation.");
        setValidationErrors(null);
      }
      console.error("Create API key error details:", error);
    },
  });

  // handleSubmit remains the same

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Form content remains the same */}
        {submitError && (
            <Alert variant="destructive" className="mb-4 col-span-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
            </Alert>
        )}

        {/* Title */}
        <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="apiKeyTitle" className="text-right pt-2">Title*</Label>
            <div className="col-span-3">
            <Input
                id="apiKeyTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={mutation.isPending}
                required
                aria-required="true"
                placeholder="e.g., My Production Key"
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
            <Label htmlFor="apiKeyDescription" className="text-right pt-2">Description</Label>
            <div className="col-span-3">
            <Textarea
                id="apiKeyDescription"
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
            <DialogClose asChild>
            <Button variant="outline" type="button" disabled={mutation.isPending}>
                Cancel
            </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating... </>
            ) : (
                "Create API Key"
            )}
            </Button>
        </DialogFooter>
    </form>
  );
};