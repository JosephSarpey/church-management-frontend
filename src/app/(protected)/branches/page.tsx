"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { branchesApi } from "@/lib/api/branches";
import { Branch } from "@/lib/api/branches/types";
import { toast } from "sonner";

export default function BranchesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const formatId = (id: string) => id.slice(-6);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const data = await branchesApi.getBranches();
                setBranches(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching branches:", error);
                toast.error("Failed to load branches");
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const handleDelete = (id: string) => {
        const branch = branches.find((b) => b.id === id);
        if (!branch) return;

        toast(
            <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                        <Trash2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">Delete Branch</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Are you sure you want to delete <span className="font-medium">{branch.name}</span>? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toast.dismiss()}
                        className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={async () => {
                            toast.dismiss();
                            try {
                                setDeletingId(id);
                                await branchesApi.deleteBranch(id);
                                setBranches((prev) => prev.filter((b) => b.id !== id));
                                toast.success("Branch deleted successfully");
                            } catch (error) {
                                console.error("Error deleting branch:", error);
                                toast.error("Failed to delete branch");
                            } finally {
                                setDeletingId(null);
                            }
                        }}
                        disabled={deletingId === id}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                        {deletingId === id ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </span>
                        ) : "Delete"}
                    </Button>
                </div>
            </div>,
            {
                duration: 10000, // 10 seconds
                className: "w-full max-w-md p-0 bg-transparent shadow-none [&>div]:w-full"
            }
        );
    };

    const filteredBranches = branches.filter(
        (branch) =>
            branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.currentProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.id.includes(searchTerm)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Branches</h1>
                <Link href="/branches/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Branch
                    </Button>
                </Link>
            </div>

            <SearchInput
                placeholder="Search branches by name, project, or ID..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="mb-6"
            />

            <Card>
                <CardHeader>
                    <CardTitle>All Branches</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Income</TableHead>
                                <TableHead>Expenditure</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead>Current Project</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        Loading branches...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? 'No branches found matching your search.' : 'No branches available.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell title={branch.id}>{formatId(branch.id)}</TableCell>
                                        <TableCell className="font-medium">{branch.name}</TableCell>
                                        <TableCell>{branch.memberCount}</TableCell>
                                        <TableCell>${branch.income.toLocaleString()}</TableCell>
                                        <TableCell>${branch.expenditure.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {(branch.events || '').split(/\r?\n/).filter(Boolean).length}
                                        </TableCell>
                                        <TableCell>{branch.currentProject}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/branches/${branch.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(branch.id)}
                                                disabled={deletingId === branch.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}