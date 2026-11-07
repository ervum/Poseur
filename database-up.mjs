import { execSync as ExecuteSync } from 'child_process';
import { createRequire as CreateRequire } from 'module';

import * as FileSystem from 'fs';
import * as Network from 'net';



let DefaultSecrets = {
  Database: {
    Host: 'localhost',
    Port: 5432,
    User: 'Administrator',
    Password: 'Pass',
    Name: 'Database'
  }
};

try {
  const SharedModule = await import('./packages/shared/dist/index.js');
  if (SharedModule && SharedModule.DefaultSecrets) {
    DefaultSecrets = SharedModule.DefaultSecrets;
  }
} catch (_SharedImportError) {
  // If packages/shared is not built yet, fallback to default database secrets
}



const CandidateFileNames = ['.env', 'docker.env', '.env.local'];
const CandidatePathPrefixes = ['', '../', '../../'];

if (typeof process.loadEnvFile === 'function') {
  for (const FileName of CandidateFileNames) {
    for (const PathPrefix of CandidatePathPrefixes) {
      try {
        const CandidatePath = `${PathPrefix}${FileName}`;
        process.loadEnvFile(CandidatePath);
      } catch (_LoadEnvironmentError) {
        // Ignored if candidate environment file does not exist at candidate path
      }
    }
  }
}

const RawDatabaseURL = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
let ParsedDatabaseURL;

if (RawDatabaseURL) {
  try {
    ParsedDatabaseURL = new URL(RawDatabaseURL);
  } catch (_ParseURLError) {
    // Ignore invalid URL format
  }
}

const DatabaseHost =
  process.env.DATABASE_HOST ||
  process.env.POSTGRES_HOST ||
  process.env.DB_HOST ||
  ParsedDatabaseURL?.hostname ||
  DefaultSecrets.Database?.Host ||
  '127.0.0.1';

const DatabasePortNumber = parseInt(
  process.env.DATABASE_PORT ||
  process.env.POSTGRES_PORT ||
  process.env.DB_PORT ||
  (ParsedDatabaseURL?.port ? ParsedDatabaseURL.port : '') ||
  String(DefaultSecrets.Database?.Port || '5432'),
  10
);

const DatabaseUser =
  process.env.DATABASE_USER ||
  process.env.POSTGRES_USER ||
  process.env.DB_USER ||
  (ParsedDatabaseURL?.username ? decodeURIComponent(ParsedDatabaseURL.username) : '') ||
  DefaultSecrets.Database?.User ||
  'Administrator';

const DatabasePassword =
  process.env.DATABASE_PASSWORD ||
  process.env.POSTGRES_PASSWORD ||
  process.env.DB_PASSWORD ||
  (ParsedDatabaseURL?.password ? decodeURIComponent(ParsedDatabaseURL.password) : '') ||
  DefaultSecrets.Database?.Password ||
  '7oHOLPPkVNQBRSWkAlnAMUWg0NhTXL9G';

const DatabaseName =
  process.env.DATABASE_NAME ||
  process.env.POSTGRES_DB ||
  process.env.DB_NAME ||
  (ParsedDatabaseURL?.pathname ? ParsedDatabaseURL.pathname.replace(/^\//, '') : '') ||
  DefaultSecrets.Database?.Name ||
  'DuartePropiedades';

const HasSSLDisabled =
  process.env.DATABASE_SSL === 'false' ||
  process.env.DATABASE_SSL === '0' ||
  Boolean(RawDatabaseURL && (RawDatabaseURL.includes('sslmode=disable') || RawDatabaseURL.includes('ssl=false')));

const IsLocalDatabase =
  DatabaseHost === 'localhost' ||
  DatabaseHost === '127.0.0.1' ||
  HasSSLDisabled;

const SSLConfiguration = IsLocalDatabase ? false : { rejectUnauthorized: false };

if (IsLocalDatabase) {
  const EnvironmentContent = `
POSTGRES_USER=${DatabaseUser}
POSTGRES_PASSWORD=${DatabasePassword}
POSTGRES_DB=${DatabaseName}
`;

  FileSystem.writeFileSync('docker.env', EnvironmentContent);
}

console.log(`Checking PostgreSQL connection for database "${DatabaseName}" at ${DatabaseHost}:${DatabasePortNumber}...`);

function CheckPortOpen(PortNumber = 5432, HostAddress = '127.0.0.1', TimeoutMilliseconds = 800) {
  return new Promise((ResolvePromise) => {
    const SocketInstance = new Network.Socket();

    SocketInstance.setTimeout(TimeoutMilliseconds);

    SocketInstance.on('connect', () => {
      SocketInstance.destroy();
      ResolvePromise(true);
    });

    SocketInstance.on('timeout', () => {
      SocketInstance.destroy();
      ResolvePromise(false);
    });

    SocketInstance.on('error', () => {
      SocketInstance.destroy();
      ResolvePromise(false);
    });

    SocketInstance.connect(PortNumber, HostAddress);
  });
}

async function EnsureSchemaHealthy(HostAddress, PortNumber, UserName, UserPassword, TargetDatabaseName, PostgresClient) {
  if (!PostgresClient) return;
  try {
    const AppClient = new PostgresClient({
      host: HostAddress,
      port: PortNumber,
      user: UserName,
      password: UserPassword,
      database: TargetDatabaseName,
      ssl: SSLConfiguration
    });
    await AppClient.connect();

    await AppClient.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_estate_property_entity') THEN
          ALTER TABLE "real_estate_property_entity" ADD COLUMN IF NOT EXISTS "ImageURL" text DEFAULT '';
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "ImageURL" TYPE text;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "ImageURL" DROP NOT NULL;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "ImageURL" SET DEFAULT '';
          UPDATE "real_estate_property_entity" SET "ImageURL" = '' WHERE "ImageURL" IS NULL;

          ALTER TABLE "real_estate_property_entity" ADD COLUMN IF NOT EXISTS "GalleryImages" text DEFAULT '[]';
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "GalleryImages" TYPE text;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "GalleryImages" DROP NOT NULL;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "GalleryImages" SET DEFAULT '[]';
          UPDATE "real_estate_property_entity" SET "GalleryImages" = '[]' WHERE "GalleryImages" IS NULL;

          ALTER TABLE "real_estate_property_entity" ADD COLUMN IF NOT EXISTS "IsUnlisted" boolean DEFAULT false;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "IsUnlisted" DROP NOT NULL;
          ALTER TABLE "real_estate_property_entity" ALTER COLUMN "IsUnlisted" SET DEFAULT false;
          UPDATE "real_estate_property_entity" SET "IsUnlisted" = false WHERE "IsUnlisted" IS NULL;
        END IF;
      END $$;
    `);

    await AppClient.end();
    console.log(`✅ Schema health verification passed for "${TargetDatabaseName}".`);
  } catch (SchemaError) {
    console.warn('⚠️ Schema health check notice:', SchemaError instanceof Error ? SchemaError.message : String(SchemaError));
  }
}

async function EnsureDatabaseExists(HostAddress, PortNumber, UserName, UserPassword, TargetDatabaseName) {
  let PostgresClient;
  try {
    const NodeRequire = CreateRequire(import.meta.url);
    const PostgresPackagePath = NodeRequire.resolve('pg', { paths: [process.cwd() + '/server', process.cwd()] });
    const PostgresModule = NodeRequire(PostgresPackagePath);
    PostgresClient = PostgresModule.Client;
  } catch (_RequireError) {
    try {
      const DynamicPostgres = await import('pg');
      PostgresClient = DynamicPostgres.Client || DynamicPostgres.default?.Client;
    } catch (_ImportError) {
      console.warn('⚠️ PostgreSQL client (pg) is not available. Skipping database creation check.');
      return;
    }
  }

  if (!PostgresClient) {
    return;
  }

  // Attempt direct connection to TargetDatabaseName first (standard for cloud or pre-created databases)
  try {
    const DirectClient = new PostgresClient({
      host: HostAddress,
      port: PortNumber,
      user: UserName,
      password: UserPassword,
      database: TargetDatabaseName,
      ssl: SSLConfiguration
    });
    await DirectClient.connect();
    await DirectClient.end();
    console.log(`✅ Database "${TargetDatabaseName}" already exists and is reachable.`);
    await EnsureSchemaHealthy(HostAddress, PortNumber, UserName, UserPassword, TargetDatabaseName, PostgresClient);
    return;
  } catch (DirectConnectionError) {
    const DirectErrorMessage = DirectConnectionError instanceof Error ? DirectConnectionError.message : String(DirectConnectionError);
    if (!DirectErrorMessage.includes('does not exist') && !DirectErrorMessage.includes('3D000')) {
      console.warn(`Direct connection to "${TargetDatabaseName}" returned: ${DirectErrorMessage}. Attempting admin connection...`);
    }
  }

  const MaximumConnectionAttempts = 5;
  let IsConnected = false;
  let DatabaseClient;

  for (let AttemptIndex = 1; AttemptIndex <= MaximumConnectionAttempts; AttemptIndex++) {
    DatabaseClient = new PostgresClient({
      host: HostAddress,
      port: PortNumber,
      user: UserName,
      password: UserPassword,
      database: 'postgres',
      ssl: SSLConfiguration
    });

    try {
      await DatabaseClient.connect();
      IsConnected = true;
      break;
    } catch (_ConnectionError) {
      try {
        await DatabaseClient.end();
      } catch (_EndError) {
        // Ignored
      }
      if (AttemptIndex < MaximumConnectionAttempts) {
        await new Promise((ResolvePromise) => setTimeout(ResolvePromise, 1000));
      }
    }
  }

  if (!IsConnected || !DatabaseClient) {
    console.error(`Could not connect to PostgreSQL at ${HostAddress}:${PortNumber} after ${MaximumConnectionAttempts} attempts.`);
    return;
  }

  try {
    const QueryResult = await DatabaseClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [TargetDatabaseName]);

    if (QueryResult.rowCount === 0) {
      console.log(`Database "${TargetDatabaseName}" does not exist. Creating it...`);
      await DatabaseClient.query(`CREATE DATABASE "${TargetDatabaseName}"`);
      console.log(`✅ Database "${TargetDatabaseName}" created successfully.`);
    } else {
      console.log(`✅ Database "${TargetDatabaseName}" already exists.`);
    }

    await EnsureSchemaHealthy(HostAddress, PortNumber, UserName, UserPassword, TargetDatabaseName, PostgresClient);
  } catch (ErrorObject) {
    const ErrorMessage = ErrorObject instanceof Error ? ErrorObject.message : String(ErrorObject);
    console.error(`Could not ensure database "${TargetDatabaseName}":`, ErrorMessage);
  } finally {
    try {
      await DatabaseClient.end();
    } catch (_FinalEndError) {
      // Ignored
    }
  }
}

const IsAlreadyRunning = await CheckPortOpen(DatabasePortNumber, DatabaseHost);

if (IsAlreadyRunning) {
  console.log(`✅ PostgreSQL is already active on port ${DatabasePortNumber}. Ensuring database exists...`);
  await EnsureDatabaseExists(DatabaseHost, DatabasePortNumber, DatabaseUser, DatabasePassword, DatabaseName);
  process.exit(0);
}

if (!IsLocalDatabase) {
  console.warn(`⚠️ PostgreSQL host ${DatabaseHost}:${DatabasePortNumber} is not reachable and is not local. Skipping Docker Compose.`);
  process.exit(0);
}

console.log(`Port ${DatabasePortNumber} is not active. Attempting Docker Compose start...`);

try {
  const DockerComposeFileName = FileSystem.existsSync('docker-compose.dev.yaml')
    ? 'docker-compose.dev.yaml'
    : 'docker-compose.dev.yml';

  ExecuteSync(`docker compose -f ${DockerComposeFileName} up -d db`, {
    stdio: 'inherit',
    timeout: 5000
  });

  await EnsureDatabaseExists(DatabaseHost, DatabasePortNumber, DatabaseUser, DatabasePassword, DatabaseName);
} catch (_ErrorObject) {
  console.warn('⚠️ Could not start docker-compose (Docker Desktop may be off or not installed). Continuing server startup...');
}
