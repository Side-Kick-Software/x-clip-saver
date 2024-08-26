"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";

interface MediaItem {
  type: "photo" | "video";
  url: string;
}

interface TweetData {
  tweetId: string;
  text: string;
  author: {
    name: string;
    username: string;
    profileImageUrl: string;
  };
  createdAt: string;
  mediaItems: MediaItem[];
}

function isTweetData(data: any): data is TweetData {
  return (
    typeof data === "object" &&
    "tweetId" in data &&
    "text" in data &&
    "author" in data &&
    "createdAt" in data &&
    "mediaItems" in data &&
    Array.isArray(data.mediaItems) &&
    data.mediaItems.every(
      (item: any) => typeof item === "object" && "type" in item && "url" in item
    )
  );
}

export default function Component() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetData, setTweetData] = useState<TweetData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const downloadMedia = (url: string, filename: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setTweetData(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tweetUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tweet data");
      }

      const data = await response.json();
      if (isTweetData(data)) {
        setTweetData(data);
      } else {
        throw new Error("Invalid tweet data received");
      }
    } catch (err) {
      setError("Failed to fetch tweet data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>X/Twitter Media Downloader</CardTitle>
          <CardDescription>
            Enter a X/Twitter link to view and download media
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="https://x.com/jedpattersonn/status/123456789"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Fetch Tweet"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tweetData && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={tweetData.author.profileImageUrl}
                  alt={tweetData.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{tweetData.author.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    @{tweetData.author.username}
                  </p>
                </div>
              </div>
              <p>{tweetData.text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tweetData.mediaItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {item.type === "photo" ? (
                      <img
                        src={item.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-auto"
                      />
                    ) : (
                      <video src={item.url} controls className="w-full h-auto">
                        Your browser does not support the video tag.
                      </video>
                    )}
                    <Button
                      onClick={() => {
                        if (
                          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        ) {
                          window.open(item.url, "_blank");
                        } else {
                          const filename = `tweet_media_${item.type}_${index + 1}.${item.type === "photo" ? "jpg" : "mp4"}`;
                          downloadMedia(item.url, filename);
                        }
                      }}
                      className="w-full mt-2"
                    >
                      <Download className="mr-2 h-4 w-4" />{" "}
                      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                        ? "Open"
                        : "Download"}{" "}
                      {item.type}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Posted on {new Date(tweetData.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Disclaimer: This Twitter video downloader is for personal use only.
          Please respect copyright laws and Twitter&apos;s terms of service.
        </p>
        <p>Developed with ❤️ by Side Kick Software</p>
      </footer>
    </div>
  );
}
