export const StorageClasses = Object.freeze([
  'STANDARD',
  'REDUCED_REDUNDANCY',
  'GLACIER',
  'STANDARD_IA',
  'ONEZONE_IA',
  'INTELLIGENT_TIERING',
  'DEEP_ARCHIVE',
] as const);
export type StorageClass = typeof StorageClasses[number];

interface S3ListObjectsContent {
  ETag: string;
  Key: string;
  LastModified: Date;
  Size: number;
  StorageClass: StorageClass;
  Owner?: {
    DisplayName: string;
    ID: string;
  };
}

interface S3ListObjectsResponse {
  CommonPrefixes: unknown[];
  Contents: S3ListObjectsContent[];
  IsTruncated: boolean;
  KeyCounts: number;
  MaxKeys: number;
  Name: string;
  Prefix: string;
}

interface S3HeadObjectResponse {
  ContentLength: number;
  ContentType: string;
  LastModified: Date;
  Metadata: { [key: string]: string };
}

interface S3GetObjectResponse {
  ETag: string;
  Body: Uint8Array;
  ContentLength: number;
  ContentType: string;
  LastModified: Date;
  Metadata: { [key: string]: string };
  DeleteMarker?: boolean;
  AcceptRanges?: string;
}
