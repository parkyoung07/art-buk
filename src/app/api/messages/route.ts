import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: string;
}

interface RoomData {
  userId: string;
  lastMessage: string;
  lastSender: string;
  lastUpdated: string;
  messageCount: number;
  messages: ChatMessage[];
}

const dataFilePath = path.join(process.cwd(), "public/data/chat-rooms.json");

function loadRooms(): Record<string, RoomData> {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (_e) {
    // ignore
  }
  return {};
}

function saveRooms(rooms: Record<string, RoomData>) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(rooms, null, 2), "utf8");
  } catch (_e) {
    // ignore
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const rooms = loadRooms();

  if (userId) {
    const room = rooms[userId];
    return NextResponse.json({
      ok: true,
      messages: room ? room.messages : [],
    });
  }

  const roomList = Object.values(rooms)
    .map(({ userId: uid, lastMessage, lastSender, lastUpdated, messageCount }) => ({
      userId: uid,
      lastMessage,
      lastSender,
      lastUpdated,
      messageCount,
    }))
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

  return NextResponse.json({ ok: true, rooms: roomList });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, message, sender } = body;

    if (!userId || !message) {
      return NextResponse.json({ ok: false, error: "필수 파라미터 누락" }, { status: 400 });
    }

    const rooms = loadRooms();
    const nowIso = new Date().toISOString();

    if (!rooms[userId]) {
      rooms[userId] = {
        userId,
        lastMessage: message,
        lastSender: sender || "user",
        lastUpdated: nowIso,
        messageCount: 0,
        messages: [],
      };
    }

    const newMessage: ChatMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      sender: sender || "user",
      text: message,
      timestamp: nowIso,
    };

    rooms[userId].messages.push(newMessage);
    rooms[userId].lastMessage = message;
    rooms[userId].lastSender = sender || "user";
    rooms[userId].lastUpdated = nowIso;
    rooms[userId].messageCount = rooms[userId].messages.length;

    saveRooms(rooms);

    return NextResponse.json({ ok: true, message: newMessage });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId 누락" }, { status: 400 });
    }

    const rooms = loadRooms();
    if (rooms[userId]) {
      delete rooms[userId];
      saveRooms(rooms);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
