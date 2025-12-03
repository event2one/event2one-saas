import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      privilege?: number;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    privilege?: number;
    isAdmin?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    privilege?: number;
    isAdmin?: boolean;
  }
}
