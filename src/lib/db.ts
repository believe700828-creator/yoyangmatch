// 데이터 저장소
// - 실제 사이트(Vercel): Upstash Redis (Vercel 대시보드 > Storage 에서 연결하면 환경변수가 자동으로 들어옵니다)
// - 내 컴퓨터에서 테스트할 때: 프로젝트 안의 .data/db.json 파일에 저장
import { promises as fs } from "fs";
import path from "path";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const hasRemoteStore = Boolean(REDIS_URL && REDIS_TOKEN);

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("데이터 저장소가 연결되지 않았습니다. Vercel > Storage 에서 Upstash Redis를 연결해 주세요.");
  }
}

async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || json.error) throw new Error(json.error || `Redis 오류 (${res.status})`);
  return json.result as T;
}

// ---------- 로컬 파일 저장소 (개발용) ----------
type FileDB = Record<string, Record<string, string>>;
const FILE = path.join(process.cwd(), ".data", "db.json");
let fileQueue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<FileDB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as FileDB;
  } catch {
    return {};
  }
}

function withFile<T>(fn: (db: FileDB) => T | Promise<T>, write: boolean): Promise<T> {
  const run = fileQueue.then(async () => {
    const db = await readFile();
    const out = await fn(db);
    if (write) {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(db, null, 2));
    }
    return out;
  });
  fileQueue = run.catch(() => undefined);
  return run;
}

function ensureStore() {
  if (!hasRemoteStore && process.env.VERCEL) throw new StoreNotConfiguredError();
}

const PREFIX = "ym:";

// ---------- 공통 함수: 컬렉션(해시) 단위로 JSON 저장 ----------
export async function getAll<T>(collection: string): Promise<T[]> {
  ensureStore();
  if (hasRemoteStore) {
    const flat = await redis<string[]>(["HGETALL", PREFIX + collection]);
    const out: T[] = [];
    for (let i = 1; i < (flat?.length ?? 0); i += 2) out.push(JSON.parse(flat[i]) as T);
    return out;
  }
  return withFile((db) => Object.values(db[collection] ?? {}).map((v) => JSON.parse(v) as T), false);
}

export async function getOne<T>(collection: string, id: string): Promise<T | null> {
  ensureStore();
  if (hasRemoteStore) {
    const v = await redis<string | null>(["HGET", PREFIX + collection, id]);
    return v ? (JSON.parse(v) as T) : null;
  }
  return withFile((db) => {
    const v = db[collection]?.[id];
    return v ? (JSON.parse(v) as T) : null;
  }, false);
}

export async function putOne<T extends { id: string }>(collection: string, item: T): Promise<T> {
  ensureStore();
  const value = JSON.stringify(item);
  if (hasRemoteStore) {
    await redis(["HSET", PREFIX + collection, item.id, value]);
    return item;
  }
  return withFile((db) => {
    db[collection] = db[collection] ?? {};
    db[collection][item.id] = value;
    return item;
  }, true);
}

export async function deleteOne(collection: string, id: string): Promise<void> {
  ensureStore();
  if (hasRemoteStore) {
    await redis(["HDEL", PREFIX + collection, id]);
    return;
  }
  await withFile((db) => {
    if (db[collection]) delete db[collection][id];
  }, true);
}
