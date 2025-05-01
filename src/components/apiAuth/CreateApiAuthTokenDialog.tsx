// src/components/apiAuth/CreateApiAuthTokenDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { CreateApiAuthTokenForm } from "./CreateApiAuthTokenForm";
import { ApiAuthToken } from "@/types/apiAuthToken";

// Define the shape of the data returned on successful creation, including the token

interface CreateApiAuthTokenDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (createdTokenData: ApiAuthToken) => void; // Pass created token data up
}

export const CreateApiAuthTokenDialog: React.FC<CreateApiAuthTokenDialogProps> = ({
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const handleSuccess = (createdTokenData: ApiAuthToken) => {
        // Don't close the dialog here, let the parent handle it after showing the token
        onSuccess(createdTokenData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Generate API Key
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>
                        Provide a title and optional description. The key will be shown once upon creation.
                    </DialogDescription>
                </DialogHeader>
                {/* Render form only when dialog is open */}
                {isOpen && <CreateApiAuthTokenForm onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />}
            </DialogContent>
        </Dialog>
    );
};