// src/components/trades/import/ImportDropdown.tsx
import { useState, useRef } from 'react';
import { FileArrowUp, FileCsv, Image, CaretDown } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImportDropdownProps {
  onImportCSV: (file: File) => void;     // <--- UPDATED: Expects File object
  onImportImage: (file: File) => void;   // <--- UPDATED: Expects File object
}

export const ImportDropdown = ({ onImportCSV, onImportImage }: ImportDropdownProps) => {
  const [open, setOpen] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleCSVClick = () => {
    setOpen(false);
    csvInputRef.current?.click();
  };

  const handleImageClick = () => {
    setOpen(false);
    imageInputRef.current?.click();
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file); // <--- Pass the full File object
      e.target.value = ''; // Reset so same file can be selected again if needed
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportImage(file); // <--- Pass the full File object
      e.target.value = '';
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="gap-2 border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-all duration-200"
          >
            <FileArrowUp weight="light" className="w-4 h-4" />
            Import
            <CaretDown weight="bold" className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-background/95 backdrop-blur-xl border-border/60"
        >
          <DropdownMenuItem 
            onClick={handleCSVClick}
            className="gap-3 cursor-pointer py-2.5 focus:bg-secondary/50"
          >
            <FileCsv weight="duotone" className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleImageClick}
            className="gap-3 cursor-pointer py-2.5 focus:bg-secondary/50"
          >
            <Image weight="duotone" className="w-4 h-4 text-blue-400" />
            <span>Import Image</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleCSVChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </>
  );
};