// src/components/apikeys/ApiKeyList.tsx
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
import { Badge } from "@/components/ui/badge"; // For visual flair if needed
import { Pencil, Trash2 } from "lucide-react";
import { ApiAuthToken } from "@/types/apiAuthToken";
import { formatDateTime } from "@/lib/utils"; // Import the helper

interface ApiKeyListProps {
  apiKeys: ApiAuthToken[];
  isLoading: boolean;
  onEdit: (apiKeyId: string) => void;
  onDelete: (apiKeyId: string, apiKeyTitle: string) => void;
}

export const ApiKeyList: React.FC<ApiKeyListProps> = ({
  apiKeys,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableCaption
            className={
              apiKeys.length > 0 || isLoading ? "sr-only" : "mt-4 mb-4"
            }
          >
            {isLoading
              ? "Loading API keys..."
              : apiKeys.length === 0
                ? "No API keys found."
                : "A list of your registered API keys."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Accessed</TableHead>
              {/* <TableHead className="text-center">Devices</TableHead> */}
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{apiKey.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{apiKey.token_prefix}...</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {apiKey.description ?? <span className="italic">No description</span>}
                  </TableCell>
                  <TableCell>{formatDateTime(apiKey.created_at)}</TableCell>
                  <TableCell>{formatDateTime(apiKey.last_accessed_at)}</TableCell>
                  {/* <TableCell className="text-center">
                    {apiKey.iot_devices_count ?? 0}
                  </TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                       {/* View button omitted for brevity, add if needed */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(apiKey.id)}
                        aria-label={`Edit API key ${apiKey.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => onDelete(apiKey.id, apiKey.title)}
                        aria-label={`Delete API key ${apiKey.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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