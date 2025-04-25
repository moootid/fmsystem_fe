// src/components/apikeys/CreateApiKeyDialog.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, KeyRound, Copy, Check } from "lucide-react";
import { CreateApiKeyForm } from "./CreateApiKeyForm";
import { ApiAuthToken } from "@/types/apiAuthToken"; // Use the standard type

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Function to get a prefix (e.g., first 8 chars)
const getTokenPrefix = (token: string | undefined): string => {
    if (!token) return '';
    return token.substring(0, 8); // Adjust length as needed
}

export const CreateApiKeyDialog: React.FC<CreateApiKeyDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  // Use the standard ApiAuthToken type here
  const [createdTokenData, setCreatedTokenData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Type for the data passed to handleSuccess is now ApiAuthToken
  const handleSuccess = (data: ApiAuthToken) => {
    setCreatedTokenData(data);
    onSuccess?.();
  };

  const handleClose = () => {
    setCreatedTokenData(null);
    setCopied(false);
    onOpenChange(false);
  };

  const copyToClipboard = () => {
    if (!createdTokenData?.token) return;
    navigator.clipboard.writeText(createdTokenData.token).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy token: ', err);
    });
  };

  React.useEffect(() => {
      if (isOpen) {
          setCreatedTokenData(null);
          setCopied(false);
      }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {createdTokenData ? "API Key Created" : "Create New API Key"}
          </DialogTitle>
          <DialogDescription>
            {createdTokenData
              ? "Your new API key has been generated. Copy it now, you won't be able to see it again."
              : "Provide a title and optional description. The key will be generated automatically."}
          </DialogDescription>
        </DialogHeader>

        {!createdTokenData ? (
          <CreateApiKeyForm onSuccess={handleSuccess} />
        ) : (
          // Display the created token using fields from ApiAuthToken
          <div className="space-y-4 py-4">
             <Alert>
               <KeyRound className="h-4 w-4" />
               <AlertTitle>Save Your Token Securely!</AlertTitle>
               <AlertDescription>
                 This is the only time you'll see the full API key.
               </AlertDescription>
             </Alert>
             <div className="space-y-2">
                 <Label htmlFor="apiKeyTitle">Title</Label>
                 <Input id="apiKeyTitle" value={createdTokenData.title} readOnly disabled />
             </div>
             {/* Display derived prefix */}
              <div className="space-y-2">
                 <Label htmlFor="apiKeyPrefix">Prefix</Label>
                 <Input id="apiKeyPrefix" value={getTokenPrefix(createdTokenData.token) + "..."} readOnly disabled />
             </div>
             <div className="space-y-2">
                <Label htmlFor="generatedApiKey">Generated API Key</Label>
                <div className="flex items-center space-x-2">
                     <Input
                        id="generatedApiKey"
                        type="text"
                        value={createdTokenData?.token} // Display the full token
                        readOnly
                        className="font-mono flex-1"
                        />
                     <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy API Key">
                         {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                     </Button>
                </div>
             </div>
             {createdTokenData.description && (
                <div className="space-y-2">
                    <Label htmlFor="apiKeyDesc">Description</Label>
                    <Textarea id="apiKeyDesc" value={createdTokenData.description} readOnly disabled rows={2} />
                </div>
             )}
          </div>
        )}

        {createdTokenData && (
            <DialogFooter className="mt-4">
                 <DialogClose asChild>
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                 </DialogClose>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};