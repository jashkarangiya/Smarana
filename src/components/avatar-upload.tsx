"use client"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, ImageIcon, X, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
    currentImage?: string | null
    name?: string | null
    onSave: (imageData: string) => Promise<void>
}

export function AvatarUpload({ currentImage, name, onSave }: AvatarUploadProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [urlInput, setUrlInput] = useState("")
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleUrlPreview = useCallback(() => {
        if (!urlInput.trim()) {
            toast.error("Please enter a URL")
            return
        }
        try {
            new URL(urlInput)
            setPreview(urlInput)
        } catch {
            toast.error("Please enter a valid URL")
        }
    }, [urlInput])

    const handleSave = async () => {
        if (!preview) {
            toast.error("Please select or enter an image")
            return
        }

        setSaving(true)
        try {
            await onSave(preview)
            setOpen(false)
            setPreview(null)
            setUrlInput("")
        } catch (error) {
            // Error handling is done in parent
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setPreview(null)
        setUrlInput("")
    }

    return (
        <>
            {/* Clickable Avatar */}
            <button
                onClick={() => setOpen(true)}
                className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
            >
                <Avatar className="h-24 w-24 transition-all duration-200 group-hover:opacity-80">
                    <AvatarImage src={currentImage || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                </div>
            </button>

            {/* Upload Dialog */}
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Profile Picture</DialogTitle>
                        <DialogDescription>
                            Upload an image or paste a URL
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "url")} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Upload
                            </TabsTrigger>
                            <TabsTrigger value="url" className="gap-2">
                                <Link className="h-4 w-4" />
                                URL
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-4">
                            {/* Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                                    isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                                        isDragging ? "bg-primary/20" : "bg-muted"
                                    )}>
                                        <ImageIcon className={cn(
                                            "h-6 w-6",
                                            isDragging ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {isDragging ? "Drop image here" : "Drag & drop an image"}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            or click to browse (max 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="image-url"
                                        placeholder="https://example.com/image.jpg"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleUrlPreview()}
                                    />
                                    <Button variant="outline" onClick={handleUrlPreview}>
                                        Preview
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Preview */}
                    {preview && (
                        <div className="mt-4 flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={preview} />
                                    <AvatarFallback>
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => setPreview(null)}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">Preview</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!preview || saving} className="flex-1">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
