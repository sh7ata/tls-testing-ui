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
  // Sort messages by timestamp
  const sortedMessages = Object.entries(data.messages)
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
            <TableHead>Alias</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Business Event</TableHead>
            <TableHead>Lifecycle Events</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Δt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMessages.map((msg, idx) => (
            <TableRow key={msg.key}>
              <TableCell className="font-medium">
                {generateAlias(idx)}
              </TableCell>
              <TableCell>{msg.position.version}</TableCell>
              <TableCell>{msg.eventDetails.businessEvent.type}</TableCell>
              <TableCell className="max-w-md truncate">
                {formatLifeCycleEvents(msg.eventDetails.lifeCycleEvents)}
              </TableCell>
              <TableCell className="font-mono text-sm">{msg.key}</TableCell>
              <TableCell>
                {format(new Date(msg.messageTimestampUTC), "HH:mm:ss.SSS")}
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
