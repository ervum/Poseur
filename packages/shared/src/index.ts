import { ConfigurationType, SecretsType, ServerConfigurationType } from '@ervum/types';



const ServerPort: number = 6900;
const ClientPort: number = 4200;

const ProxyURL: string = 'api';
const SlashedProxyURL: string = `/${ProxyURL}`;



export const DefaultSecrets: SecretsType = {
    Database: {
        Host: 'localhost',
        Port: 5432,

        User: 'Administrator',
        Password: 'Pass',

        Name: 'Database'
    }
};



async function GetSecrets(): Promise<SecretsType> {
  try {
    const { Secrets: DynamicSecrets }: { Secrets: SecretsType } = await import('./secrets.js');
    
    return { ...DefaultSecrets, ...DynamicSecrets };
  } catch (e: unknown) {
    console.log("Optional 'secrets.ts' not found, using default configuration.");

    return DefaultSecrets;
  }
}

async function CreateServerConfiguration(): Promise<ServerConfigurationType> {
  const Secrets: SecretsType = await GetSecrets();

  const ServerConfiguration: ServerConfigurationType = {
    URL: `http://localhost:${ServerPort}`,
    Port: ServerPort,

    ProxyURL: ProxyURL,
    SlashedProxyURL: SlashedProxyURL,
    
    ...Secrets
  };

  return ServerConfiguration;
}



export const ServerConfiguration: Promise<ServerConfigurationType> = CreateServerConfiguration();
export const ClientConfiguration: ConfigurationType = {
    URL: `http://localhost:${ClientPort}`,
    Port: ClientPort,
    
    ProxyURL: ProxyURL,
    SlashedProxyURL: SlashedProxyURL
};