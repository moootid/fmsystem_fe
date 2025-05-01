// src/components/apiAuth/ApiAuthTokenList.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from "@/components/ui/table";
import { Eye, Trash2, Copy } from "lucide-react";
import { ApiAuthToken } from "@/types/apiAuthToken"; // Import the correct type
import { toast } from "sonner";

interface ApiAuthTokenListProps {
    apiAuthTokens: ApiAuthToken[];
    isLoading: boolean;
    onView: (tokenId: string) => void;
    onDelete: (tokenId: string, tokenTitle: string) => void; // Pass title for confirmation
}

// Helper function to format date strings (move to utils?)
const formatDateTime = (timestamp: string | null | undefined): string => {
    if (!timestamp) return "N/A";
    try {
        return new Date(timestamp).toLocaleString();
    } catch (e) {
        console.error("Error formatting date:", timestamp, e);
        return "Invalid Date";
    }
};

export const ApiAuthTokenList: React.FC<ApiAuthTokenListProps> = ({
    apiAuthTokens,
    isLoading,
    onView,
    onDelete,
}) => {
    // Adjust based on actual API response structure if needed (e.g., data nesting)
    const tokenList = apiAuthTokens.data || apiAuthTokens || [];

    const copyPrefixToClipboard = (prefix: string) => {
        navigator.clipboard.writeText(prefix)
            .then(() => {
                toast.success("Prefix Copied", { description: "Token prefix copied to clipboard." });
            })
            .catch(err => {
                toast.error("Copy Failed", { description: "Could not copy prefix to clipboard." });
                console.error('Failed to copy text: ', err);
            });
    };


    return (
        <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableCaption
                        className={
                            tokenList.length > 0 || isLoading ? "sr-only" : "mt-4 mb-4"
                        }
                    >
                        {isLoading
                            ? "Loading API keys..."
                            : tokenList.length === 0
                                ? "No API keys found."
                                : "A list of your generated API keys."}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">ID</TableHead>
                            {/* Adjusted width for ID column */}
                            <TableHead>Title</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Last Accessed</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-center">IoT Devices</TableHead>
                            <TableHead className="text-right w-[90px]">Actions</TableHead> {/* Adjusted width */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center"> {/* Adjusted colSpan */}
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : tokenList.length > 0 ? (
                            tokenList.map((token) => (
                                <TableRow key={token.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <code className="text-xs">{token.id}</code>
                                    </TableCell>
                                    <TableCell className="font-medium">{token.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code>{token.token.slice(0,4)}...</code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyPrefixToClipboard(token.token)}
                                                aria-label="Copy token"
                                                title="Copy token"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                                        {token.description ?? <span className="italic">N/A</span>}
                                    </TableCell>
                                    <TableCell>{formatDateTime(token.last_accessed_at)}</TableCell>
                                    <TableCell>{formatDateTime(token.inserted_at)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center">
                                            {token.iot_devices.length > 0 ? (
                                                <span className="text-sm text-muted-foreground">
                                                    {token.iot_devices[0].model} - 
                                                    [{token?.iot_devices[0].id}] 
                        
                                                </span>
                                            ) : (
                                                <span className="italic text-muted-foreground">None</span>
                                            )}
                                        </div>


                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* No dedicated View button needed if View Dialog implemented */}
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onView(token.id)}
                                                aria-label={`View details for key ${token.title}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => onDelete(token.id, token.title)}
                                                aria-label={`Delete key ${token.title}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center"> {/* Adjusted colSpan */}
                                    No API keys available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};