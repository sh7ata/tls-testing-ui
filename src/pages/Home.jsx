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

  const handleGetRequest = async () => {
    const url = `http://xtrader.cibc.com:10499/api/trade-publication/publication-message/${positionId}?api-version=${version}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      } else {
        setApiResponse({ error: "Failed to fetch data" });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiResponse({ error: "An error occurred" });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trade Publication Viewer</h1>

      <div className="flex space-x-4 mb-4">
        <Input
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

      {apiResponse && (
        <div className="mt-4">
          <h2 className="font-semibold">API Response:</h2>
          <pre className="p-4 border rounded-md bg-gray-100">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Home;
