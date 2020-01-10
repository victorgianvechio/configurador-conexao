/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

const path = require('path');
const ipc = require('electron').ipcRenderer;
const generator = require('../../src/util/fileGenerator.js');
const db = require('../../src/db/dbConnection.js');
const cfg = require('../../src/util/configureOracleClient.js');

const timeout = require('../util/timeout.js');

async function generateFile($, remote) {
  let options = '';
  const user = $('#user').val();
  const pass = $('#pass').val();
  const database = $('#database').val();
  const fileName = $('#fileName').val();
  const filePath = $('#filePath').val();

  ipc.send('show-progressbar', 'Gerando Arquivo');
  generator.createFile(user, pass, database, filePath, fileName);
  await timeout(3000);
  ipc.send('set-progressbar-completed');

  options = {
    type: 'info',
    title: 'Configurador de Conexão',
    message: 'Arquivo de conexão gerado com sucesso!',
    detail: path.join(filePath, fileName),
  };

  await timeout(500);
  remote.dialog.showMessageBox(null, options);
}

async function configure(remote) {
  const winrarExist = cfg.checkWinrar();
  const envExist = cfg.checkEnv();
  const folderExist = cfg.checkFolder();

  const options = {
    type: '',
    title: 'Configurador de Conexão',
    message: '',
    detail: '',
  };

  if (!winrarExist) {
    options.type = 'warning';
    options.message = 'Necessário instalar Winrar.';
    remote.dialog.showMessageBox(null, options);
    return;
  }

  options.type = 'info';
  options.message = 'Configuração realizada com sucesso!';

  if (!folderExist) {
    options.detail += '- Dependências instaladas.\n';
    ipc.send('show-progressbar', 'Instalando dependências');
    cfg.extract();
    await timeout(3000);
    ipc.send('set-progressbar-completed');
  }

  if (!envExist) {
    options.detail +=
      '- Variável de ambiente criada.\n\nNecessário reiniciar a aplicação.';
    ipc.send('show-progressbar', 'Configurando variável de ambiente');
    cfg.setEnv();
    await timeout(3000);
    ipc.send('set-progressbar-completed');
  }

  if (envExist && folderExist)
    options.message = 'Parâmetros e configurações já realizadas.';

  await timeout(500);
  await remote.dialog.showMessageBox(null, options);
  if (!envExist) await remote.getCurrentWindow().close();
}

function selectFolder(remote) {
  const filePath = remote.dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  $('#filePath').val(filePath);
}

async function testConnection() {
  const user = $('#user').val();
  const pass = $('#pass').val();
  const conn = $('#conn').val();
  const database = $('#database').val();

  const connString = `${conn}/${database}`;

  ipc.send('show-progressbar', 'Testando Conexão');
  await db.connect(user, pass, connString).then(async v => {
    if (v === true) {
      options = {
        type: 'info',
        title: 'Configurador de Conexão',
        message: 'Conexão testada com sucesso!',
        detail: 'Pronto para gerar o arquivo.',
      };
    } else {
      options = {
        type: 'error',
        title: 'Configurador de Conexão',
        message: 'Erro ao testar conexão.',
        detail: v,
      };
    }
    await timeout(2000);
    ipc.send('set-progressbar-completed');

    await timeout(500);
    remote.dialog.showMessageBox(null, options);
  });
}

function validadeConn($, remote) {
  const list = [
    (user = [$('#user').val(), '- Usuário \n']),
    (pass = [$('#pass').val(), '- Senha \n']),
    (conn = [$('#conn').val(), '- String de Conexão \n']),
    (database = [$('#database').val(), '- Database \n']),
    (fileName = [$('#fileName').val(), '- Nome do Arquivo \n']),
  ];

  let isValid = true;
  const options = {
    type: 'error',
    title: 'Configurador de Conexão',
    message: 'Preencher campos obrigatórios:',
    detail: '',
  };

  list.forEach(item => {
    if (!item[0]) {
      options.detail += item[1];
      isValid = false;
    }
  });

  if (isValid) testConnection();
  else remote.dialog.showMessageBox(null, options);
}

function validadeGenerateFile($, remote) {
  const list = [
    (user = [$('#user').val(), '- Usuário \n']),
    (pass = [$('#pass').val(), '- Senha \n']),
    (database = [$('#database').val(), '- Database \n']),
    (filePath = [$('#filePath').val(), '- Diretório \n']),
    (fileName = [$('#fileName').val(), '- Nome do Arquivo \n']),
  ];

  let isValid = true;
  const options = {
    type: 'error',
    title: 'Configurador de Conexão',
    message: 'Preencher campos obrigatórios:',
    detail: '',
  };

  list.forEach(item => {
    if (!item[0]) {
      options.detail += item[1];
      isValid = false;
    }
  });

  if (isValid) generateFile($, remote);
  else remote.dialog.showMessageBox(null, options);
}

module.exports = ($, remote) => {
  $('#mainContent').load('../../app/view/components/mainContent.html');

  $(document).ready(() => {
    function getWindow() {
      return remote.BrowserWindow.getFocusedWindow();
    }

    $('#btnSair').click(() => {
      getWindow().close();
    });

    $('#btnGerar').click(() => {
      validadeGenerateFile($, remote);
    });

    $('#btnFolder').click(() => {
      selectFolder(remote);
    });

    $('#filePath').click(() => {
      selectFolder(remote);
    });

    $('#btnTestar').click(() => {
      validadeConn($, remote);
    });

    $('#btnConfig').click(() => {
      configure(remote);
    });
  });
};
