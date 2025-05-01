// src/components/apiAuth/ViewApiAuthTokenDialog.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import apiService from "@/services/apiService";
import { ApiAuthToken } from "@/types/apiAuthToken";

interface ViewApiAuthTokenDialogProps {
    tokenId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Helper component (move to shared location?)
const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-1">
        <dt className="font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2">{value ?? <span className="text-muted-foreground italic">N/A</span>}</dd>
    </div>
);

// Helper function (move to utils?)
const formatDateTime = (timestamp: string | null | undefined): string => {
    if (!timestamp) return "N/A";
    try { return new Date(timestamp).toLocaleString(); }
    catch (e) { return "Invalid Date"; }
};

export const ViewApiAuthTokenDialog: React.FC<ViewApiAuthTokenDialogProps> = ({
    tokenId,
    isOpen,
    onOpenChange,
}) => {

    const fetchToken = async (id: string | null) => {
        console.log("Fetching token with ID:", id);
        if (!id) return Promise.resolve(null);
        const res:any = await apiService.apiAuthTokens.getById(id); // Assuming getById returns a promise
        console.log("Token data:", res);
        return res.data; // Assuming getById returns the token details
    }

    const {
        data: token,
        isLoading,
        isError,
        error,
        isFetching, // Use isFetching to handle refetch loading state
    } = useQuery<ApiAuthToken | null, Error>({
        queryKey: ["apiAuthToken", tokenId], // Unique query key
        queryFn: () => fetchToken(tokenId),
        enabled: !!tokenId && isOpen, // Fetch only when ID is present and dialog is open
        refetchOnWindowFocus: false,
        retry: 1,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>API Key Details</DialogTitle>
                    <DialogDescription>
                        Viewing details for key: {token?.title ?? '...'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {(isLoading || isFetching) && !isError && (
                        <div className="flex justify-center items-center h-40">
                            <LoadingSpinner />
                        </div>
                    )}
                    {isError && !isFetching && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading Key Data</AlertTitle>
                            <AlertDescription>
                                Could not load key details. {error?.message}
                            </AlertDescription>
                        </Alert>
                    )}
                    {!isLoading && !isError && !isFetching && token && (
                        <dl className="space-y-2">
                            <DetailItem label="ID" value={<code className="text-xs">{token.id}</code>} />
                            <DetailItem label="Title" value={token.title} />
                            <DetailItem label="Description" value={token.description} />
                            <DetailItem label="Token Prefix" value={<code>{token.token.slice(0,4)}...</code>} />
                            <DetailItem label="Last Accessed" value={formatDateTime(token.last_accessed_at)} />
                            <DetailItem label="Created At" value={formatDateTime(token.inserted_at)} />
                        </dl>
                    )}
                     {!isLoading && !isError && !isFetching && !token && tokenId && (
                         <p className="text-center text-muted-foreground">API Key not found.</p>
                     )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};