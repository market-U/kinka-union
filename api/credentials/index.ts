import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {
    generateBlobSASQueryParameters,
    ContainerSASPermissions,
    StorageSharedKeyCredential,
    BlobSASSignatureValues,
    ContainerClient
} from "@azure/storage-blob"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            url: getSasUrl()
        }
    };

};

function getSasUrl(): string {
    const connectionString = process.env.STORAGE_CONNECTION_STRING;
    const accountKey = process.env.STORAGE_ACCOUNT_KEY;
    const container = process.env.STORAGE_CONTAINER_NAME;
    return generateSasToken(connectionString, accountKey, container, "rc");
}

function generateSasToken(connectionString: string, accountKey: string, container: string, permissions: string) {
    const containerClient = new ContainerClient(connectionString, container);
    const sharedKeyCredential = new StorageSharedKeyCredential(containerClient.accountName, accountKey);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);

    const sasOptions: BlobSASSignatureValues = {
        containerName: containerClient.containerName,
        permissions: ContainerSASPermissions.parse("rc")
    };

    sasOptions.startsOn = new Date();
    sasOptions.expiresOn = expiryDate;

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    console.log(`SAS token for blob container is: ${sasToken}`);

    return `${containerClient.url}?${sasToken}`;
}

export default httpTrigger;