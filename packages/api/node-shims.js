// This file provides shims for Node.js built-in modules
// that might be dynamically required in the bundled code

import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as util from 'util';
import * as stream from 'stream';
import * as buffer from 'buffer';
import * as crypto from 'crypto';
import * as events from 'events';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as querystring from 'querystring';
import * as zlib from 'zlib';

// Export the modules so they can be injected by esbuild
export { 
  path, 
  fs, 
  url, 
  util, 
  stream, 
  buffer, 
  crypto, 
  events, 
  http, 
  https, 
  os, 
  querystring, 
  zlib 
};