
import { useState } from "react";
import { IssueType } from "../types";

export function useReportIssue(logEvent: (msg: string) => void) {
  const [reportedIssue, setReportedIssue] = useState<IssueType | null>(null);

  const handleReportIssue = (issue: IssueType) => {
    setReportedIssue(issue);
    logEvent(`Technical issue reported: ${issue}`);
    setTimeout(() => setReportedIssue(null), 3000);
  };

  return { reportedIssue, handleReportIssue };
}
