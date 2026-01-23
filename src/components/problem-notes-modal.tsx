"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Code, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProblemNotesModalProps {
    problemId: string
    problemTitle: string
    isOpen: boolean
    onClose: () => void
}

export function ProblemNotesModal({
    problemId,
    problemTitle,
    isOpen,
    onClose,
}: ProblemNotesModalProps) {
    const [notes, setNotes] = useState("")
    const [solution, setSolution] = useState("")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("notes")

    useEffect(() => {
        if (isOpen && problemId) {
            fetchNotes()
        }
    }, [isOpen, problemId])

    const fetchNotes = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/problems/${problemId}/notes`)
            if (res.ok) {
                const data = await res.json()
                setNotes(data.notes || "")
                setSolution(data.solution || "")
            }
        } catch (error) {
            console.error("Failed to fetch notes:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/problems/${problemId}/notes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes, solution }),
            })

            if (res.ok) {
                toast.success("Notes saved successfully!")
                onClose()
            } else {
                toast.error("Failed to save notes")
            }
        } catch (error) {
            toast.error("Failed to save notes")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Notes & Solution
                    </DialogTitle>
                    <DialogDescription className="truncate">
                        {problemTitle}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="notes" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Notes
                            </TabsTrigger>
                            <TabsTrigger value="solution" className="gap-2">
                                <Code className="h-4 w-4" />
                                Solution
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="notes" className="flex-1 mt-4 overflow-hidden">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Write your notes here... 

• Key observations
• Approach used
• Time/Space complexity
• Edge cases to remember"
                                className="h-[300px] resize-none font-mono text-sm"
                            />
                        </TabsContent>

                        <TabsContent value="solution" className="flex-1 mt-4 overflow-hidden">
                            <Textarea
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder="Paste your solution code here..."
                                className="h-[300px] resize-none font-mono text-sm"
                            />
                        </TabsContent>
                    </Tabs>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
