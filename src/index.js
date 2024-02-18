const dotenv = require('dotenv');
const Client = require('./util/Base.js');

new Client(dotenv.config());
