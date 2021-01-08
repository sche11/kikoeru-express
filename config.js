const fs = require('fs');
const path = require('path');
const stringRandom = require('string-random');

const configFolderDir = process.pkg ? path.join(process.execPath, '..', 'config') : path.join(__dirname, 'config');
const configPath = path.join(configFolderDir, 'config.json');
const pjson = require('./package.json');

const versionWithoutVerTracking = '0.4.1';

const defaultConfig = {
  version: pjson.version,
  maxParallelism: 16,
  rootFolders: [
    // {
    //   name: '',
    //   path: ''
    // }
  ],
  coverFolderDir: process.pkg ? path.join(process.execPath, '..', 'covers') : path.join(__dirname, 'covers'),
  databaseFolderDir: process.pkg ? path.join(process.execPath, '..', 'sqlite') : path.join(__dirname, 'sqlite'),
  auth: false,
  md5secret: stringRandom(14),
  jwtsecret: stringRandom(14),
  expiresIn: 2592000,
  scannerMaxRecursionDepth: 2,
  pageSize: 12,
  tagLanguage: 'zh-cn',
  retry: 5,
  dlsiteTimeout: 10000,
  hvdbTimeout: 10000,
  retryDelay: 2000,
  httpProxyHost: '',
  httpProxyPort: 0,
  listenPort: 8888
};

const initConfig = () => fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, "\t"));

const setConfig = (newConfig) => fs.writeFileSync(configPath, JSON.stringify(newConfig, null, "\t"));

// Get or use default value
const getConfig = () => {
  let config = JSON.parse(fs.readFileSync(configPath));
  for (let key in defaultConfig) {
    if (!config.hasOwnProperty(key)) {
      if (key === 'version') {
        config['version'] = versionWithoutVerTracking;
      } else {
        config[key] = defaultConfig[key];
      }
    }
  }
  return config;
};

if (!fs.existsSync(configPath)) {
  if (!fs.existsSync(configFolderDir)) {
    try {
      fs.mkdirSync(configFolderDir, { recursive: true });
    } catch(err) {
      console.error(` ! 在创建存放配置文件的文件夹时出错: ${err.message}`);
    }
  }
  initConfig();
}

// Migrate config
const updateConfig = () => {
  let config = JSON.parse(fs.readFileSync(configPath));
  let countChanged = 0;
  for (let key in defaultConfig) {
    if (!config.hasOwnProperty(key)) {
      console.log('写入设置', key);
      config[key] = defaultConfig[key];
      countChanged += 1;
    }
  }
  if (countChanged || config.version !== pjson.version) {
    config.version = pjson.version;
    setConfig(config)
  };
}

module.exports = {
  setConfig, getConfig, updateConfig
};
