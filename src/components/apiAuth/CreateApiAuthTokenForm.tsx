// src/components/apiAuth/CreateApiAuthTokenForm.tsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog"; // Keep Footer/Close
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { ApiAuthToken, CreateApiAuthTokenPayload } from "@/types/apiAuthToken";
import { ApiValidationError } from "@/types/api";
// import { CreatedTokenData } from "./CreateApiAuthTokenDialog"; // Import the extended type

interface CreateApiAuthTokenFormProps {
    onSuccess: (createdTokenData: ApiAuthToken) => void;
    onCancel: () => void;
}

// Reusable helper (consider moving to lib/utils.ts)
const getFieldError = (
    errors: ApiValidationError | null,
    field: keyof ApiValidationError
): string | null => {
    return errors?.[field]?.[0] ?? null;
};


export const CreateApiAuthTokenForm: React.FC<CreateApiAuthTokenFormProps> = ({
    onSuccess,
    onCancel
}) => {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [validationErrors, setValidationErrors] = useState<ApiValidationError | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const mutation = useMutation<ApiAuthToken, Error, CreateApiAuthTokenPayload>({
        // Assuming apiService.apiAuthTokens.create returns the full object including the token string
        mutationFn: (payload) => apiService.apiAuthTokens.create(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["apiAuthTokens"] });
            toast.success("API Key Generated", {
                description: `Key "${data.title}" generated. Save the token now!`,
            });
            setValidationErrors(null);
            setSubmitError(null);
            onSuccess(data); // Pass the full data (including token) to the parent
        },
        onError: (error) => {
            const errors = apiService.handleApiError(error, (title, opts) =>
                toast.error(title, opts)
            );
            if (errors) {
                setValidationErrors(errors);
                setSubmitError(null);
            } else {
                setSubmitError("An unexpected error occurred during generation.");
                setValidationErrors(null);
            }
            console.error("Create API key error:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors(null);
        setSubmitError(null);

        if (!title) {
            // Use validationErrors for better UX
            setValidationErrors({ title: ["Title is required."] });
            return;
        }

        const payload: CreateApiAuthTokenPayload = {
            title,
            description: description || undefined,
        };

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
                <Label htmlFor="title" className="text-right pt-2"> Title* </Label>
                <div className="col-span-3">
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., My Mobile App Key" disabled={mutation.isPending} required className={getFieldError(validationErrors, "title") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "title") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "title")} </p>)}
                </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2"> Description </Label>
                <div className="col-span-3">
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="(Optional) Describe the purpose of this key" disabled={mutation.isPending} className={getFieldError(validationErrors, "description") ? "border-destructive" : ""} />
                    {getFieldError(validationErrors, "description") && (<p className="text-sm text-destructive mt-1"> {getFieldError(validationErrors, "description")} </p>)}
                </div>
            </div>

            <DialogFooter className="mt-4">
                 <Button variant="outline" type="button" onClick={onCancel} disabled={mutation.isPending}>
                     Cancel
                 </Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating... </>
                    ) : (
                        "Generate Key"
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
};