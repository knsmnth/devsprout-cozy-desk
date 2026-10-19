import { NextResponse } from "next/server";

/**
 * Universal Music Search API
 * Searches across all genres, artists, and songs globally via open metadata APIs.
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl ? request.nextUrl.searchParams : new URL(request.url).searchParams;
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const genre = searchParams.get("genre") || "";
    const limit = Math.min(Number(searchParams.get("limit") || 30), 50);

    // Default search term if empty: general popular music hits
    const searchTerm = (query || genre || "popular hits acoustic lofi pop").trim();

    // 1. Try iTunes Search API
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=${limit}`;

    const itunesRes = await fetch(itunesUrl, {
      headers: {
        "User-Agent": "DevSproutCozyDesk/1.0",
      },
      next: { revalidate: 300 }, // 5-minute cache
    });

    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      if (itunesData.results && itunesData.results.length > 0) {
        const songs = itunesData.results
          .filter((item) => item.previewUrl && item.trackName)
          .map((item) => {
            const highResArtwork = (item.artworkUrl100 || "")
              .replace("100x100bb", "600x600bb")
              .replace("100x100", "600x600");

            return {
              id: `itunes-${item.trackId}`,
              title: item.trackName,
              artist: item.artistName,
              artistId: item.artistId ? `artist-${item.artistId}` : null,
              album: item.collectionName || "",
              duration: Math.round((item.trackTimeMillis || 30000) / 1000),
              streamUrl: item.previewUrl,
              artwork: highResArtwork,
              genre: item.primaryGenreName || genre || "Music",
              cover: {
                type: "image",
                imageUrl: highResArtwork,
                primaryColor: "#fff4b8",
                accentColor: "#d9a406",
                icon: "🎵",
                label: item.primaryGenreName || "Music",
              },
              mood: item.primaryGenreName ? `${item.primaryGenreName} • Popular` : "Hit Song",
            };
          });

        if (songs.length > 0) {
          return NextResponse.json({
            success: true,
            source: "itunes",
            count: songs.length,
            songs,
          });
        }
      }
    }

    // 2. Fallback to Deezer Search API
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`;
    const deezerRes = await fetch(deezerUrl, {
      next: { revalidate: 300 },
    });

    if (deezerRes.ok) {
      const deezerData = await deezerRes.json();
      if (deezerData.data && deezerData.data.length > 0) {
        const songs = deezerData.data
          .filter((item) => item.preview && item.title)
          .map((item) => {
            const artwork = item.album?.cover_big || item.album?.cover_medium || "";
            return {
              id: `deezer-${item.id}`,
              title: item.title,
              artist: item.artist?.name || "Unknown Artist",
              artistId: item.artist?.id ? `artist-${item.artist.id}` : null,
              album: item.album?.title || "",
              duration: item.duration || 30,
              streamUrl: item.preview,
              artwork,
              genre: genre || "Music",
              cover: {
                type: "image",
                imageUrl: artwork,
                primaryColor: "#fff4b8",
                accentColor: "#d9a406",
                icon: "🎵",
                label: genre || "Music",
              },
              mood: "Global Music",
            };
          });

        return NextResponse.json({
          success: true,
          source: "deezer",
          count: songs.length,
          songs,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: 0,
      songs: [],
    });
  } catch (err) {
    if (err?.digest?.startsWith("NEXT_")) {
      throw err;
    }
    console.error("Music search API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search music catalog",
        songs: [],
      },
      { status: 500 }
    );
  }
}
