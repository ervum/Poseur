const Port: number = 6900;



export const Configuration: {
    ServerURL: string,
    ClientURL: string,

    ProxyURLPrefix: string,

    Port: number
} = {
    ServerURL: `http://localhost:${Port}`,
    ClientURL: 'http://localhost:4200',

    ProxyURLPrefix: 'api',

    Port: Port
};