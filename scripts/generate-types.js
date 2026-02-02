#!/usr/bin/env node
/**
 * Generate TypeScript types from Swagger/OpenAPI spec
 * 
 * Usage: yarn generate:types
 */

const { generateApi } = require('swagger-typescript-api');
const path = require('path');
const fs = require('fs');

const SWAGGER_PATH = path.resolve(__dirname, '../../server/docs/swagger.json');
const OUTPUT_PATH = path.resolve(__dirname, '../src/lib/generated');

async function main() {
  console.log('🔄 Generating TypeScript types from Swagger spec...');
  console.log(`   Source: ${SWAGGER_PATH}`);
  console.log(`   Output: ${OUTPUT_PATH}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  try {
    await generateApi({
      name: 'api-types.ts',
      output: OUTPUT_PATH,
      input: SWAGGER_PATH,
      httpClientType: 'fetch',
      generateClient: false,  // Only generate types, not the full client
      generateRouteTypes: false,
      generateResponses: true,
      extractRequestParams: true,
      extractRequestBody: true,
      extractResponseBody: true,
      extractResponseError: true,
      unwrapResponseData: true,
      prettier: {
        printWidth: 100,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'es5',
      },
      defaultResponseAsSuccess: false,
      generateUnionEnums: true,
      addReadonly: false,
      sortTypes: true,
      extractingOptions: {
        requestBodySuffix: ['Request', 'Input'],
        requestParamsSuffix: ['Params'],
        responseBodySuffix: ['Response', 'Output'],
        responseErrorSuffix: ['Error'],
      },
      primitiveTypeConstructs: (constructs) => ({
        ...constructs,
        string: {
          'date-time': 'string',
        },
      }),
    });

    console.log('✅ Types generated successfully!');
    console.log(`   Output file: ${OUTPUT_PATH}/api-types.ts`);
  } catch (error) {
    console.error('Failed to generate types:', error.message);
    process.exit(1);
  }
}

main();
