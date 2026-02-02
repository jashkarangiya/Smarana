"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Save, Code, Eye, Edit3, Check, Lightbulb, Clock } from "lucide-react"

interface NotesEditorProps {
    problemId?: string
    problemTitle?: string
    initialNotes?: string
    initialCode?: string
    onSave?: (notes: string, code: string) => void
}

export function NotesEditor({
    problemId,
    problemTitle = "Problem Notes",
    initialNotes = "",
    initialCode = "",
    onSave,
}: NotesEditorProps) {
    const [notes, setNotes] = useState(initialNotes)
    const [code, setCode] = useState(initialCode)
    const [activeTab, setActiveTab] = useState<"notes" | "code">("notes")
    const [isPreview, setIsPreview] = useState(false)
    const [isSaved, setIsSaved] = useState(true)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const handleNotesChange = (value: string) => {
        setNotes(value)
        setIsSaved(false)
    }

    const handleCodeChange = (value: string) => {
        setCode(value)
        setIsSaved(false)
    }

    const handleSave = () => {
        onSave?.(notes, code)
        setIsSaved(true)
        setLastSaved(new Date())
    }

    const formatLastSaved = () => {
        if (!lastSaved) return ""
        const now = new Date()
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
        if (diff < 60) return "Just now"
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // Simple markdown preview
    const renderMarkdown = (text: string) => {
        return text
            .split("\n")
            .map((line, i) => {
                // Headers
                if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(4)}</h3>
                if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(3)}</h2>
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>
                // Bold
                let processed = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                // Inline code
                processed = processed.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-xs">$1</code>')
                // Lists
                if (line.startsWith("- ")) return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />
                // Regular text
                if (line.trim() === "") return <br key={i} />
                return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: processed }} />
            })
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {problemTitle}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {lastSaved && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatLastSaved()}
                            </span>
                        )}
                        <Button
                            size="sm"
                            variant={isSaved ? "ghost" : "default"}
                            className="h-8 gap-1.5 rounded-full"
                            onClick={handleSave}
                            disabled={isSaved}
                        >
                            {isSaved ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Tab Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 p-1 bg-muted/50 rounded-full">
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-full transition-all ${activeTab === "notes"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Lightbulb className="h-3.5 w-3.5" />
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab("code")}
                            className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-full transition-all ${activeTab === "code"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Code className="h-3.5 w-3.5" />
                            Solution
                        </button>
                    </div>
                    {activeTab === "notes" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs rounded-full"
                            onClick={() => setIsPreview(!isPreview)}
                        >
                            {isPreview ? (
                                <>
                                    <Edit3 className="h-3 w-3" />
                                    Edit
                                </>
                            ) : (
                                <>
                                    <Eye className="h-3 w-3" />
                                    Preview
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Editor Content */}
                {activeTab === "notes" ? (
                    isPreview ? (
                        <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 rounded-lg bg-muted/30 text-sm prose prose-sm prose-invert max-w-none">
                            {notes ? renderMarkdown(notes) : (
                                <p className="text-muted-foreground italic">No notes yet...</p>
                            )}
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Write your notes here... 

Supports basic markdown:
# Heading
**bold text**
`inline code`
- List items"
                            value={notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            className="min-h-[200px] max-h-[400px] resize-none bg-muted/30 border-border/50 focus:border-primary/50 text-sm font-mono"
                        />
                    )
                ) : (
                    <Textarea
                        placeholder="Paste your solution code here..."
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="min-h-[200px] max-h-[400px] resize-none bg-muted/30 border-border/50 focus:border-primary/50 text-sm font-mono"
                        spellCheck={false}
                    />
                )}

                {/* Quick Tips */}
                <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Tip:</span> Write down the key insight that helped you solve this problem. It will help during reviews!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
