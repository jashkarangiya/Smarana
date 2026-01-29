"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Plus,
    Link as LinkIcon,
    FileText,
    Upload,
    Loader2,
    CheckCircle2,
    ArrowRight,
    Search
} from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddProblemPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    // URL Import State
    const [url, setUrl] = useState("")
    const [fetching, setFetching] = useState(false)

    // Manual Form State
    const [title, setTitle] = useState("")
    const [difficulty, setDifficulty] = useState("Medium")
    const [platform, setPlatform] = useState("leetcode")

    // Metadata Fetch Mutation
    const fetchMetadata = useMutation({
        mutationFn: async (url: string) => {
            const res = await fetch("/api/problems/fetch-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            })
            if (!res.ok) throw new Error("Failed to fetch metadata")
            return res.json()
        },
        onSuccess: (data) => {
            setTitle(data.title)
            setDifficulty(data.difficulty)
            toast.success("Problem details fetched!")
        },
        onError: () => {
            toast.error("Could not fetch details. Please fill manually.")
        }
    })

    // Create Problem Mutation
    const createProblem = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    title,
                    difficulty,
                    platform
                }),
            })

            if (res.status === 409) throw new Error("You are already tracking this problem")
            if (!res.ok) throw new Error("Failed to create problem")
            return res.json()
        },
        onSuccess: (data) => {
            toast.success("Problem added to your list!")
            queryClient.invalidateQueries({ queryKey: ["problems"] })
            // Redirect to the new problem detail page
            router.push(`/problems/${data.id}`)
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add problem")
        }
    })

    const handleUrlBlur = () => {
        if (url && url.includes("leetcode.com") && !title) {
            setFetching(true)
            fetchMetadata.mutate(url, {
                onSettled: () => setFetching(false)
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) {
            toast.error("Please fill in title and URL")
            return
        }
        createProblem.mutate()
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Plus className="h-8 w-8 text-primary" />
                    Add Problem
                </h1>
                <p className="text-muted-foreground mt-2">
                    Add problems to your spaced repetition queue manually or by importing.
                </p>
            </div>

            <Tabs defaultValue="manual" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Add Single
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Bulk Import
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Details</CardTitle>
                            <CardDescription>
                                Paste a LeetCode URL to auto-fill details, or enter manually.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">Problem URL</Label>
                                    <div className="relative">
                                        <Input
                                            id="url"
                                            placeholder="https://leetcode.com/problems/..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            onBlur={handleUrlBlur}
                                            className="pr-10"
                                        />
                                        {fetching && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Auto-fetches details for LeetCode links
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Two Sum"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty">Difficulty</Label>
                                        <Select value={difficulty} onValueChange={setDifficulty}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy" className="text-emerald-500">Easy</SelectItem>
                                                <SelectItem value="Medium" className="text-amber-500">Medium</SelectItem>
                                                <SelectItem value="Hard" className="text-rose-500">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="platform">Platform</Label>
                                        <Select value={platform} onValueChange={setPlatform}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="leetcode">LeetCode</SelectItem>
                                                <SelectItem value="codeforces">Codeforces</SelectItem>
                                                <SelectItem value="atcoder">AtCoder</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-2"
                                    disabled={createProblem.isPending || !title || !url}
                                >
                                    {createProblem.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Problem
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>
                                Coming soon: Import from CSV or paste a list of URLs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">Feature In Progress</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                We're working on allowing you to paste a list of URLs or upload a CSV file to import multiple problems at once.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
