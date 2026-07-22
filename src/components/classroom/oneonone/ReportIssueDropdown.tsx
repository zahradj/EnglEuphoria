
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IssueType } from "./video/types";

interface ReportIssueDropdownProps {
  onReport: (issue: IssueType) => void;
}

export function ReportIssueDropdown({ onReport }: ReportIssueDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
        >
          Report Technical Issue
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => { onReport("Audio not working"); setOpen(false); }}>Audio not working</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Video not working"); setOpen(false); }}>Video not working</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Connection issues"); setOpen(false); }}>Connection issues</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Poor audio quality"); setOpen(false); }}>Poor audio quality</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Poor video quality"); setOpen(false); }}>Poor video quality</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Screen sharing not working"); setOpen(false); }}>Screen sharing not working</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { onReport("Other technical issue"); setOpen(false); }}>Other technical issue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
