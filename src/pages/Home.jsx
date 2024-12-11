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

// Add these utility functions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
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
      formatted[version] = messages.map((msg) => msg.key);
    });
  }
  return formatted;
};

function Home() {
  const [positionId, setPositionId] = useState("");
  const [version, setVersion] = useState(1);
  const [apiResponse, setApiResponse] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState("");

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trade Publication Viewer</h1>

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

      {apiResponse && !apiResponse.error && (
        <div className="mt-4">
          <h2 className="font-semibold">GUIDs by Version:</h2>
          <div className="p-4 border rounded-md bg-gray-100 h-[300px] w-full overflow-auto">
            {Object.entries(apiResponse).map(([version, guids]) => (
              <div key={version} className="mb-4">
                <h3 className="font-medium">Version {version}:</h3>
                <ul className="list-disc pl-6">
                  {guids.map((guid) => (
                    <li key={guid}>{guid}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
