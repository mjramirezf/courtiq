export interface YouTubeResult {
  videoId: string;
  title: string;
  thumbnail: string;
  watchUrl: string;
}

export async function searchYouTube(query: string): Promise<YouTubeResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    const item = data.items[0];
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    };
  } catch {
    return null;
  }
}
