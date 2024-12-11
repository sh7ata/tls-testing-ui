import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PublicationTable from "@/components/PublicationTable";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

// Add these utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: "follow", // Explicitly follow redirects
      });

      if (response.ok) {
        return await response.json();
      }

      // Handle redirects manually if needed
      if (
        response.status === 301 ||
        response.status === 302 ||
        response.status === 307
      ) {
        const redirectUrl = response.headers.get("Location");
        if (redirectUrl) {
          const redirectResponse = await fetch(redirectUrl, options);
          if (redirectResponse.ok) {
            return await redirectResponse.json();
          }
        }
      }

      if (response.status === 401) {
        throw new Error("Authentication failed");
      }

      if (attempt < maxRetries) {
        await delay(1000);
        continue;
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(1000);
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
};

const formatResponseData = (data) => {
  const formatted = {};
  if (data.messages) {
    Object.entries(data.messages).forEach(([version, messages]) => {
      formatted[version] = messages.map((msg) => msg.content.key);
    });
  }
  return formatted;
};

function Home() {
  const [positionId, setPositionId] = useState("");
  const [version, setVersion] = useState(1);
  const [apiResponse, setApiResponse] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isLocalMode, setIsLocalMode] = useState(false);

  const handleGetRequest = async () => {
    const url = `http://xtrader.cibc.com:10499/api/trade-publication/publication-message/${positionId}?api-version=${version}`;
    setGeneratedUrl(url);

    try {
      const data = await fetchWithRetry(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: "Negotiate",
        },
      });

      // Store full response in localStorage
      localStorage.setItem(`response_${positionId}`, JSON.stringify(data));

      // Format and set displayed response
      setApiResponse(formatResponseData(data));
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiResponse({ error: error.message });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        setApiResponse(json);
      } catch (error) {
        setApiResponse({ error: "Invalid JSON file" });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Trade Publication Viewer</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="local-mode"
              checked={isLocalMode}
              onCheckedChange={setIsLocalMode}
            />
            <Label htmlFor="local-mode">Local Mode</Label>
          </div>
          {isLocalMode && (
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          )}
        </div>
      </div>

      {!isLocalMode && (
        <>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter Position ID"
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
            />
            <Select onValueChange={(value) => setVersion(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">v1</SelectItem>
                <SelectItem value="2">v2</SelectItem>
                <SelectItem value="3">v3</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGetRequest}>GET</Button>
          </div>
          <input
            type="text"
            className="w-full mb-4 p-2 border rounded-md"
            value={generatedUrl}
            onChange={(e) => setGeneratedUrl(e.target.value)}
          />
        </>
      )}

      {apiResponse && !apiResponse.error && (
        <div className="mt-4 overflow-hidden">
          <h2 className="font-semibold mb-4">Publication Messages:</h2>
          <PublicationTable data={apiResponse} />
        </div>
      )}

      {apiResponse?.error && (
        <div className="mt-4 p-4 border rounded-md bg-red-100 text-red-700">
          {apiResponse.error}
        </div>
      )}
    </div>
  );
}

export default Home;
