const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Carregar variáveis do arquivo .env

// Caminho para a pasta de gravações
const gravacoesPath = process.env.GRAVACOES_PATH;
const webhookUrl = process.env.WEBHOOK_URL;
const maxFileSize = 25 * 1024 * 1024; // 25 MB
const minFileSize = 300 * 1024; // 300 KB

// Função para fazer upload do arquivo
const uploadFile = async (filePath) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;

    // Verificar o tamanho do arquivo
    if (fileSize > maxFileSize) {
      console.log(`Arquivo ${filePath} excede o tamanho máximo de 25 MB. Não será enviado.`);
      return;
    } else if (fileSize < minFileSize) {
      console.log(`Arquivo ${filePath} é menor que o tamanho mínimo de 300 KB. Não será enviado.`);
      return;
    }
  
    const response = await axios.post(webhookUrl, fileStream, {
      headers: {
        'Content-Type': 'audio/wav',
      },
    });

    console.log(`Arquivo ${filePath} enviado com sucesso. Resposta do webhook:`, response.status);
  } catch (error) {
    console.error(`Erro ao enviar o arquivo ${filePath}:`, error.message);
  }
};

// Iniciar monitoramento da pasta de gravações e subpastas
const watcher = chokidar.watch(gravacoesPath, {
  persistent: true,
  ignoreInitial: true, // Ignora os arquivos que já existem na inicialização
  awaitWriteFinish: {
    stabilityThreshold: 5000, // Tempo em milissegundos para considerar que a gravação foi concluída
    pollInterval: 100, // Intervalo de verificação em milissegundos
  },
});

// Detectar quando novos arquivos são adicionados
watcher.on('add', (filePath) => {
  if (path.extname(filePath) === '.wav') {
    console.log(`Novo arquivo detectado: ${filePath}`);
    uploadFile(filePath);
  }
});

watcher.on('error', (error) => {
  console.error('Erro ao monitorar a pasta de gravações:', error);
});

console.log('Monitorando a pasta de gravações:', gravacoesPath);
