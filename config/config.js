module.exports = {
  development: {
    username: 'samanthalee',
    password: null,
    database: 'dsp_react_development',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  /* development: {
    username: 'fmczscrzxbxyzi',
    password: '0838f7871e055e4cca28f80cf4f934f7ff5277aa280a9b5a8a254f7f55cc1cd2',
    database: 'd5vbsg1nmnqsfg',
    host: 'ec2-54-197-43-39.compute-1.amazonaws.com',
    port: '5432',
    dialect: 'postgres',
  }, */
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: { // https://github.com/sequelize/sequelize/issues/12083
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
