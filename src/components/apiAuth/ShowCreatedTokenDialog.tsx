// src/components/apiAuth/ShowCreatedTokenDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ApiAuthToken } from "@/types/apiAuthToken";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface ShowCreatedTokenDialogProps {
    tokenData: ApiAuthToken | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void; // To close it
}

export const ShowCreatedTokenDialog: React.FC<ShowCreatedTokenDialogProps> = ({
    tokenData,
    isOpen,
    onOpenChange,
}) => {
    const [copied, setCopied] = React.useState(false);
    let token_data = tokenData?.data || tokenData; // Ensure tokenData is not null

    const copyTokenToClipboard = (token: string) => {
        navigator.clipboard.writeText(token)
            .then(() => {
                setCopied(true);
                toast.success("Token Copied", { description: "API key copied to clipboard." });
                setTimeout(() => setCopied(false), 2000); // Reset icon after 2s
            })
            .catch(err => {
                toast.error("Copy Failed", { description: "Could not copy token automatically." });
                console.error('Failed to copy token: ', err);
            });
    };

    // Reset copied state when dialog reopens with new token data
    React.useEffect(() => {
        if (isOpen) {
            setCopied(false);
        }
    }, [isOpen, tokenData]);

    if (!tokenData) return null; // Should not happen if logic is correct

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>API Key Generated Successfully</DialogTitle>
                    <DialogDescription>
                        Key: <span className="font-semibold">{token_data.title}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Alert variant="destructive">
                         <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important!</AlertTitle>
                        <AlertDescription>
                            This is a secret API key.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                         <Label htmlFor="api-token-display">Your API Key:</Label>
                         <div className="flex items-center space-x-2">
                             <Input
                                id="api-token-display"
                                value={token_data.token}
                                readOnly
                                className="flex-1 font-mono text-sm bg-muted/30"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => copyTokenToClipboard(token_data.token)}
                                disabled={copied}
                                aria-label="Copy API Key"
                                title="Copy API Key"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                     {/* <p className="text-sm text-muted-foreground">
                        Use this token in the `Authorization: Bearer YOUR_TOKEN` header for API requests.
                        Your token prefix is <code>{tokenData.token}</code>.
                     </p> */}

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="default">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};