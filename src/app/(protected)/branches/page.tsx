"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";

// Dummy data - replace with actual API call
const branches = [
    {
        id: "1",
        name: "Main Branch",
        memberCount: 150,
        income: 50000,
        expenditure: 35000,
        events: 12,
        currentProject: "Church Renovation"
    },
    {
        id: "2",
        name: "North Branch",
        memberCount: 85,
        income: 25000,
        expenditure: 20000,
        events: 8,
        currentProject: "Community Outreach"
    },
];

export default function BranchesPage() {
    const [searchTerm, setSearchTerm] = useState('');

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
                            {filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? 'No branches found matching your search.' : 'No branches available.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell>{branch.id}</TableCell>
                                        <TableCell className="font-medium">{branch.name}</TableCell>
                                        <TableCell>{branch.memberCount}</TableCell>
                                        <td>${branch.income.toLocaleString()}</td>
                                        <td>${branch.expenditure.toLocaleString()}</td>
                                        <td>{branch.events}</td>
                                        <td>{branch.currentProject}</td>
                                        <td className="text-right space-x-2">
                                            <Link href={`/branches/${branch.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
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