declare module "pg" {
  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | object;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query(queryText: string, values?: any[]): Promise<{ rows: any[]; rowCount: number }>;
  }
}
