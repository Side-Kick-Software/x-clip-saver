import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getTweet } from "react-tweet/api";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const schema = z.object({
  url: z.string().url(),
});

interface MediaItem {
  type: "photo" | "video";
  url: string;
}

export async function POST(request: NextRequest) {
  const myKv = getRequestContext().env.MY_KV;

  try {
    const body = await request.json();
    const { url } = schema.parse(body);

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const tweetIdRegex = /\/status\/(\d+)/;
    const match = url.match(tweetIdRegex);

    if (!match) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const tweetId = match[1];

    const tweet = await getTweet(tweetId);

    if (!tweet) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    const mediaItems: MediaItem[] = [];

    if (
      tweet.video &&
      tweet.video.variants &&
      tweet.video.variants.length > 0
    ) {
      const mp4Variants = tweet.video.variants.filter(
        (v) => v.type === "video/mp4"
      );
      if (mp4Variants.length > 0) {
        const highestQualityVideo = mp4Variants[mp4Variants.length - 1];
        mediaItems.push({
          type: "video",
          url: highestQualityVideo.src,
        });
      }
    }

    if (tweet.photos && tweet.photos.length > 0) {
      tweet.photos.forEach((photo) => {
        mediaItems.push({
          type: "photo",
          url: photo.url,
        });
      });
    }

    const countKey = "api_call_count";
    const currentCount = await myKv.get(countKey);
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    await myKv.put(countKey, newCount.toString());

    return NextResponse.json({
      tweetId: tweet.id_str,
      text: tweet.text,
      author: {
        name: tweet.user.name,
        username: tweet.user.screen_name,
        profileImageUrl: tweet.user.profile_image_url_https,
      },
      createdAt: tweet.created_at,
      mediaItems: mediaItems,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
}
