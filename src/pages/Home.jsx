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

function Home() {
  const [positionId, setPositionId] = useState("");
  const [version, setVersion] = useState(1);
  const [apiResponse, setApiResponse] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleGetRequest = async () => {
    const url = `http://xtrader.cibc.com:10499/api/trade-publication/publication-message/${positionId}?api-version=${version}`;
    setGeneratedUrl(url);

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // This enables Kerberos authentication
        headers: {
          Accept: "application/json",
          Authorization: "Negotiate", // Indicates we want to use Kerberos
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      } else if (response.status === 401) {
        setApiResponse({
          error:
            "Authentication failed - Please ensure you're logged into your domain",
        });
      } else {
        setApiResponse({
          error: `Failed to fetch data: ${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiResponse({ error: `Network error: ${error.message}` });
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

      {apiResponse && (
        <div className="mt-4">
          <h2 className="font-semibold">API Response:</h2>
          <pre className="p-4 border rounded-md bg-gray-100 h-[300px] w-full overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Home;
