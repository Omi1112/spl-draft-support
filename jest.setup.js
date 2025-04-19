import 'reflect-metadata';
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// グローバル設定
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// fetch APIのグローバル定義
global.Request = class Request {};
global.Response = class Response {};
global.Headers = class Headers {};

// Prismaクライアントのモック
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    tournament: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    participant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    draft: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    draftStatus: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    tournamentParticipant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback()),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Next.jsのRouterのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Window.fetch のモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
  })
);

// matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// NextRequest/NextResponseのモック
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, options) => {
      return {
        url,
        method: options?.method || 'GET',
        headers: new Map(),
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(''),
      };
    }),
    NextResponse: {
      json: jest.fn().mockImplementation((body) => ({ body })),
    },
  };
});
