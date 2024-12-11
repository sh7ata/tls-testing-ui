import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, differenceInMilliseconds } from "date-fns";

const generateAlias = (index) => {
  if (index < 26) {
    return String.fromCharCode(97 + index);
  }
  const first = String.fromCharCode(97 + Math.floor(index / 26) - 1);
  const second = String.fromCharCode(97 + (index % 26));
  return `${first}${second}`;
};

const formatTimeDifference = (current, previous) => {
  if (!previous) return "0ms";
  const diff = differenceInMilliseconds(new Date(current), new Date(previous));
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(2)}s`;
  if (diff < 3600000) return `${(diff / 60000).toFixed(2)}m`;
  return `${(diff / 3600000).toFixed(2)}h`;
};

const formatLifeCycleEvents = (events) => {
  return events.map((event) => Object.keys(event)[0]).join(", ");
};

const PublicationTable = ({ data }) => {
  const sortedMessages = Object.entries(data?.messages || {})
    .flatMap(([_, msgs]) => msgs.map((msg) => msg.content))
    .sort(
      (a, b) =>
        new Date(a.messageTimestampUTC) - new Date(b.messageTimestampUTC)
    );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Alias</TableHead>
            <TableHead className="w-[80px]">Version</TableHead>
            <TableHead className="w-[200px]">Business Event</TableHead>
            <TableHead className="w-[250px]">Lifecycle Events</TableHead>
            <TableHead className="w-[300px]">Key</TableHead>
            <TableHead className="w-[200px]">Timestamp</TableHead>
            <TableHead className="w-[100px]">Δt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMessages.map((msg, idx) => (
            <TableRow key={msg.key}>
              <TableCell className="font-medium">
                {generateAlias(idx)}
              </TableCell>
              <TableCell>{msg.position.version}</TableCell>
              <TableCell className="whitespace-normal break-words">
                {msg.eventDetails.businessEvent.type}
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                {formatLifeCycleEvents(msg.eventDetails.lifeCycleEvents)}
              </TableCell>
              <TableCell className="font-mono text-sm whitespace-normal break-words">
                {msg.key}
              </TableCell>
              <TableCell className="whitespace-normal">
                {format(
                  new Date(msg.messageTimestampUTC),
                  "yyyy-MM-dd HH:mm:ss.SSS"
                )}
              </TableCell>
              <TableCell>
                {formatTimeDifference(
                  msg.messageTimestampUTC,
                  idx > 0 ? sortedMessages[idx - 1].messageTimestampUTC : null
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PublicationTable;
