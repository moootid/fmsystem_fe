// src/pages/ApiAuthPageTest.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/apiService';
import { ApiAuthToken, CreateApiAuthTokenPayload } from '@/types/apiAuthToken';

// Helper to display JSON nicely (optional)
const JsonDisplay = ({ data }: { data: any }) => (
    <pre style={{ background: '#f4f4f4', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
);

// --- Main Test Page Component ---
export default function ApiAuthPageTest() {
    const queryClient = useQueryClient();

    // --- State for Forms ---
    const [createTitle, setCreateTitle] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [updateId, setUpdateId] = useState('');
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateDescription, setUpdateDescription] = useState('');
    const [newlyCreatedToken, setNewlyCreatedToken] = useState<any>(null); // To display the created token info

    // --- Fetch API Keys Query ---
    const {
        data: apiKeys = [], // Default to empty array
        isLoading: isLoadingKeys,
        isError: isFetchError,
        error: fetchError,
        refetch: refetchKeys,
    } = useQuery<ApiAuthToken[], Error>({
        queryKey: ['testApiKeys'], // Unique key for this test page
        queryFn: () => apiService.apiAuthTokens.list(),
    });

    // --- Create API Key Mutation ---
    const {
        mutate: createApiKey,
        isPending: isCreating,
        error: createError,
    } = useMutation<ApiAuthToken, Error, CreateApiAuthTokenPayload>({
        mutationFn: (payload) => apiService.apiAuthTokens.create(payload),
        onSuccess: (data) => {
            console.log('Create Success:', data);
            alert(`API Key created successfully!`);
            setNewlyCreatedToken(data); // Store the created token details
            queryClient.invalidateQueries({ queryKey: ['testApiKeys'] }); // Refetch the list
            // Clear form
            setCreateTitle('');
            setCreateDescription('');
        },
        onError: (error) => {
            console.error('Create Error:', error);
            alert(`Failed to create API Key: ${error.message}`);
            setNewlyCreatedToken(null);
        },
    });

    // // --- Update API Key Mutation ---
    // const {
    //     mutate: updateApiKey,
    //     isPending: isUpdating,
    //     error: updateError,
    // } = useMutation<ApiAuthToken, Error, { id: string; payload: UpdateApiAuthTokenPayload }>({
    //     mutationFn: ({ id, payload }) => apiService.apiAuthTokens.update(id, payload),
    //     onSuccess: (data) => {
    //         console.log('Update Success:', data);
    //         alert(`API Key "${data.title}" (ID: ${data.id}) updated successfully!`);
    //         queryClient.invalidateQueries({ queryKey: ['testApiKeys'] });
    //         // Clear form
    //         setUpdateId('');
    //         setUpdateTitle('');
    //         setUpdateDescription('');
    //     },
    //     onError: (error) => {
    //         console.error('Update Error:', error);
    //         alert(`Failed to update API Key: ${error.message}`);
    //     },
    // });

    // --- Delete API Key Mutation ---
    const {
        mutate: deleteApiKey,
        isPending: isDeleting,
        error: deleteError,
    } = useMutation<void, Error, string>({ // Takes ID string
        mutationFn: (id) => apiService.apiAuthTokens.delete(id),
        onSuccess: (_, deletedId) => { // Context often includes the variable passed to mutate
            console.log('Delete Success: ID', deletedId);
            alert(`API Key (ID: ${deletedId}) deleted successfully!`);
            queryClient.invalidateQueries({ queryKey: ['testApiKeys'] });
        },
        onError: (error, deletedId) => {
            console.error('Delete Error for ID:', deletedId, error);
            alert(`Failed to delete API Key (ID: ${deletedId}): ${error.message}`);
        },
    });


    // --- Event Handlers ---
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createTitle) {
            alert('Title is required for creating an API Key.');
            return;
        }
        setNewlyCreatedToken(null); // Clear previous created token display
        createApiKey({
            title: createTitle,
            description: createDescription || undefined,
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!updateId) {
            alert('API Key ID is required for updating.');
            return;
        }
        if (!updateTitle && !updateDescription) {
            alert('Provide at least a Title or Description to update.');
            return;
        }
        // updateApiKey({
        //     id: updateId,
        //     payload: {
        //         // Only include fields if they have a value to prevent accidentally clearing them
        //         ...(updateTitle && { title: updateTitle }),
        //         // Send null to clear description if field is empty, otherwise send value
        //         description: updateDescription || null,
        //     },
        // });
    };

    const handleDeleteClick = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete the key "${title}" (ID: ${id})?`)) {
            deleteApiKey(id);
        }
    };

    // --- Render Logic ---
    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>API Key Backend Test Page</h1>
            <hr style={{ margin: '20px 0' }} />

            {/* --- CREATE FORM --- */}
            <section>
                <h2>Create New API Key</h2>
                <form onSubmit={handleCreateSubmit} style={{ marginBottom: '10px' }}>
                    <div>
                        <label>Title*: </label>
                        <input
                            type="text"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            required
                            disabled={isCreating}
                            style={{ marginRight: '10px' }}
                        />
                    </div>
                    <div style={{ marginTop: '5px' }}>
                        <label>Description: </label>
                        <input
                            type="text"
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                            disabled={isCreating}
                            style={{ marginRight: '10px', width: '300px' }}
                        />
                    </div>
                    <button type="submit" disabled={isCreating} style={{ marginTop: '10px' }}>
                        {isCreating ? 'Creating...' : 'Create Key'}
                    </button>
                    {createError && <p style={{ color: 'red' }}>Error creating: {createError.message}</p>}
                </form>

                {/* Display Newly Created Token */}
                {newlyCreatedToken && (
                    <div style={{ marginTop: '15px', border: '1px solid green', padding: '10px' }}>
                        <h3>Last Created Key Details (Save the token now!):</h3>
                        <p><strong>Title:</strong> {newlyCreatedToken.title}</p>
                        <p><strong>ID:</strong> {newlyCreatedToken.id}</p>
                        <p><strong>Description:</strong> {newlyCreatedToken.description || 'N/A'}</p>
                        <p><strong>Token:</strong> <code style={{ background: '#eee', padding: '2px 4px', wordBreak: 'break-all' }}>{newlyCreatedToken.token}</code></p>
                    </div>
                )}
            </section>

            <hr style={{ margin: '20px 0' }} />

            {/* --- UPDATE FORM --- */}


            <hr style={{ margin: '20px 0' }} />

            {/* --- LIST KEYS --- */}
            <section>
                <h2>Existing API Keys</h2>
                <button onClick={() => refetchKeys()} disabled={isLoadingKeys}>
                    {isLoadingKeys ? 'Refreshing...' : 'Refresh List'}
                </button>

                {isLoadingKeys && <p>Loading keys...</p>}
                {isFetchError && <p style={{ color: 'red' }}>Error fetching keys: {fetchError?.message}</p>}

                {!isLoadingKeys && !isFetchError && apiKeys.length === 0 && <p>No API keys found.</p>}

                {!isLoadingKeys && apiKeys.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {apiKeys.map((key:any) => (
                            <li key={key.id} style={{ border: '1px solid #ccc', marginBottom: '15px', padding: '10px' }}>
                                <div><strong>Title:</strong> {key.title}</div>
                                <div><strong>ID:</strong> {key.id}</div>
                                <div><strong>Description:</strong> {key.description || 'N/A'}</div>
                                <div><strong>Token:</strong> {key.token}</div>
                                <div><strong>Created At:</strong> {new Date(key.inserted_at).toLocaleString()}</div>
                                <div><strong>Last Accessed:</strong> {key.last_access ? new Date(key.last_access).toLocaleString() : 'Never'}</div>
                                <button
                                    onClick={() => handleDeleteClick(key.id, key.title)}
                                    disabled={isDeleting} // Simple disable during any delete
                                    style={{ color: 'red', marginLeft: '10px', marginTop: '5px' }}
                                >
                                    Delete
                                </button>
                                {/* Optional: Display full details */}
                                {/* <details><summary>Raw Data</summary><JsonDisplay data={key} /></details> */}
                            </li>
                        ))}
                    </ul>
                )}
                {/* Display delete error globally for simplicity */}
                {deleteError && <p style={{ color: 'red' }}>Error deleting: {deleteError.message}</p>}
            </section>
        </div>
    );
}