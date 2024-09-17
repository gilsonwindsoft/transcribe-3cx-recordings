module.exports = {
    apps: [
      {
        name: 'monitor-gravacoes',
        script: 'index.js',
        watch: true,
        ignore_watch: ['node_modules', 'temp'], // Ignore pasta de módulos e temporários
      }
    ]
  };
  