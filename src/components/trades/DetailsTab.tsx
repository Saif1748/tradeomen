import { useRef, useState } from "react";
import { 
  Plus, 
  X, 
  Tag as TagIcon, 
  NotePencil, 
  Image as ImageIcon,
  Trash,
  UploadSimple,
  Sparkle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { defaultTags } from "@/lib/tradesData";

interface DetailsTabProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
}

const DetailsTab = ({
  selectedTags,
  setSelectedTags,
  tagInput,
  setTagInput,
  notes,
  setNotes,
  selectedFiles,
  setSelectedFiles,
}: DetailsTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !selectedTags.includes(val)) {
      setSelectedTags([...selectedTags, val]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + newFiles.length;
      
      if (totalFiles > 5) {
        alert("You can only upload up to 5 screenshots.");
        return;
      }
      
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(selectedFiles.filter((_, idx) => idx !== indexToRemove));
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const totalFiles = selectedFiles.length + files.length;
      
      if (totalFiles > 5) {
        alert("You can only upload up to 5 screenshots.");
        return;
      }
      
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* === Tags Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <TagIcon className="w-4 h-4 text-primary" weight="duotone" />
          </div>
          <div>
            <Label className="text-sm font-semibold tracking-tight text-foreground">
              Tags
            </Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">Organize and categorize your trade</p>
          </div>
        </div>

        {/* Tag Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Add custom tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className={cn(
                "h-10 pr-10 tracking-tight rounded-lg",
                "bg-background/50 backdrop-blur-sm border-white/5",
                "focus:border-primary/50 focus:shadow-sm",
                "transition-all duration-300 placeholder:text-muted-foreground/40"
              )}
            />
            {tagInput && (
              <Button
                type="button"
                size="sm"
                onClick={handleAddTag}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-md",
                  "bg-primary/10 hover:bg-primary/20 border border-primary/20",
                  "transition-all duration-300"
                )}
              >
                <Plus className="w-3.5 h-3.5 text-primary" weight="bold" />
              </Button>
            )}
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground/80 tracking-tight ml-1">Active Tags</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "h-7 px-2.5 tracking-tight font-medium rounded-md",
                    "bg-primary/5 border-primary/20 text-primary",
                    "hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400",
                    "cursor-pointer transition-all duration-300 shadow-sm"
                  )}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="ml-1.5 w-3 h-3" weight="bold" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Tags */}
        {defaultTags && defaultTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground/80 tracking-tight ml-1">Suggested</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTags
                .filter(tag => !selectedTags.includes(tag))
                .slice(0, 8)
                .map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "h-7 px-2.5 tracking-tight font-medium cursor-pointer rounded-md",
                      "bg-background/50 border-white/5 text-muted-foreground",
                      "hover:bg-primary/10 hover:border-primary/20 hover:text-primary",
                      "transition-all duration-300"
                    )}
                    onClick={() => setSelectedTags([...selectedTags, tag])}
                  >
                    <Plus className="mr-1 w-3 h-3" weight="bold" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* === Notes Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <NotePencil className="w-4 h-4 text-amber-500" weight="duotone" />
          </div>
          <div>
            <Label className="text-sm font-semibold tracking-tight text-foreground">
              Trade Notes
            </Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">Document your analysis and reasoning</p>
          </div>
        </div>

        <Textarea
          placeholder="What was your setup? Market conditions? Entry/exit reasoning? Lessons learned..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={cn(
            "min-h-[140px] resize-none tracking-tight leading-relaxed rounded-lg",
            "bg-background/50 backdrop-blur-sm border-white/5",
            "focus:border-primary/50 focus:shadow-sm",
            "transition-all duration-300",
            "placeholder:text-muted-foreground/40"
          )}
        />

        {/* Character Count */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkle className="w-3 h-3 text-primary/70" weight="duotone" />
            <span className="tracking-tight">Detailed notes improve future analysis</span>
          </div>
          <span className="text-muted-foreground/60 tracking-tight">
            {notes.length} chars
          </span>
        </div>
      </div>

      {/* === Screenshots Section === */}
      <div className="space-y-3.5 p-5 rounded-xl bg-muted/5 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <ImageIcon className="w-4 h-4 text-cyan-500" weight="duotone" />
            </div>
            <div>
              <Label className="text-sm font-semibold tracking-tight text-foreground">
                Screenshots
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">Upload charts (Max 5)</p>
            </div>
          </div>
          {selectedFiles.length > 0 && (
            <Badge 
              variant="outline" 
              className="bg-primary/5 border-primary/20 text-primary font-semibold h-6 rounded-md"
            >
              {selectedFiles.length}/5
            </Badge>
          )}
        </div>

        {/* Upload Zone with Drag & Drop */}
        <div
          className={cn(
            "relative group overflow-hidden rounded-xl transition-all duration-300",
            "border-2 border-dashed cursor-pointer",
            isDragging
              ? "border-primary/60 bg-primary/5 scale-[1.01]"
              : "border-white/10 bg-background/20 hover:bg-background/40 hover:border-primary/30"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          <div className="p-8 flex flex-col items-center gap-3"> {/* Reduced padding */}
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              isDragging 
                ? "bg-primary/20 scale-105" 
                : "bg-primary/5 group-hover:bg-primary/10 group-hover:scale-105"
            )}>
              <UploadSimple 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isDragging ? "text-primary animate-pulse" : "text-primary/70"
                )} 
                weight="duotone" 
              />
            </div>

            <div className="text-center space-y-1">
              <p className={cn(
                "text-sm font-medium tracking-tight transition-colors duration-300",
                isDragging ? "text-primary" : "text-foreground"
              )}>
                {isDragging ? "Drop here" : "Click or drag & drop"}
              </p>
              <p className="text-[10px] text-muted-foreground/60 tracking-tight">
                PNG, JPG • Max 5 files
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-4 mt-1 tracking-tight font-medium rounded-lg",
                "bg-primary/5 border-primary/20 text-primary",
                "hover:bg-primary/10 hover:border-primary/30",
                "transition-all duration-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" weight="bold" />
              Browse
            </Button>
          </div>
        </div>

        {/* Preview Grid */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[11px] font-medium text-muted-foreground/80 tracking-tight ml-1">
              Selected Images
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                  
                  {/* Overlay with filename */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-[10px] text-white truncate tracking-tight">
                        {file.name}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className={cn(
                      "absolute top-1.5 right-1.5 p-1 rounded-md",
                      "bg-black/60 backdrop-blur-md border border-white/10",
                      "opacity-0 group-hover:opacity-100",
                      "hover:bg-rose-500/80 hover:border-rose-500/50",
                      "transition-all duration-300 shadow-md"
                    )}
                  >
                    <Trash className="w-3 h-3 text-white" weight="bold" />
                  </button>

                  {/* Image Number Badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary/80 backdrop-blur-md border border-primary/50 text-[10px] font-bold text-white">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* === Pro Tip === */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm border border-primary/10">
        <Sparkle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" weight="duotone" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground tracking-tight">
            Pro Tip: Document Everything
          </p>
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed tracking-tight">
            The best traders review their notes regularly. Include setup details and emotions to build a trade journal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;