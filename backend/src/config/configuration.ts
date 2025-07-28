interface Config {
  port: number;
  supabase: {
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  graphql: {
    playground: boolean;
    introspection: boolean;
    subscriptions: {
      'subscriptions-transport-ws': boolean;
      'graphql-ws': boolean;
    };
  };
}

export default (): Config => ({
  port: parseInt((process.env.PORT as string) || '3001', 10) || 3001,
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  graphql: {
    playground: process.env.NODE_ENV === 'development',
    introspection: true,
    subscriptions: {
      'subscriptions-transport-ws': true,
      'graphql-ws': true,
    },
  },
});
