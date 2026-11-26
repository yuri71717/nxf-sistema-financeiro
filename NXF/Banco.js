import bcrypt from 'bcryptjs';
import { Platform } from 'react-native';

let db = null;
let isWebOrFallback = Platform.OS === 'web';

async function obterBanco() {
  if (db) return db;

  if (!isWebOrFallback) {
    try {
      const SQLite = await import('expo-sqlite');
      if (SQLite.openDatabaseSync) {
        db = SQLite.openDatabaseSync('novax_finance.db');
      } else if (SQLite.openDatabase) {
        db = SQLite.openDatabase('novax_finance.db');
      }
    } catch (e) {
      console.warn(
        'Expo SQLite não disponível, utilizando fallback em memória:',
        e
      );
      isWebOrFallback = true;
    }
  }

  return db;
}

const memoria = {
  usuarios: [],
  sessao: null,
  movimentacoes: [],
  cartoes: [],
  metas: [],
  recorrentes: [],
  orcamentos: [],
  contas: [],
  categorias: [],
};

function normalizarUsuario(row) {
  if (!row) return null;
  const id = row.cd_usuario || row.id;
  const nome = row.nm_usuario || row.nome || '';
  const email = row.ds_email || row.email || '';
  const criadoEm = row.dt_criado_em || row.criado_em || '';
  return {
    id,
    cd_usuario: id,
    nome,
    nm_usuario: nome,
    email,
    ds_email: email,
    criado_em: criadoEm,
    dt_criado_em: criadoEm,
  };
}

function normalizarCartao(row) {
  if (!row) return null;
  const id = row.cd_cartao || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const nome = row.nm_cartao || row.nome || '';
  const bancoNome = row.ds_banco_cartao || row.banco || 'Nubank';
  const bandeira = row.ds_bandeira_cartao || row.bandeira || 'Mastercard';
  const finalCartao = row.ds_final_cartao || row.final_cartao || '0000';
  const limite = Number(
    row.ds_limite !== undefined ? row.ds_limite : row.limite || 0
  );
  const diaVencimento = Number(
    row.dt_vencimento !== undefined
      ? row.dt_vencimento
      : row.dia_vencimento || 10
  );
  const diaFechamento = Number(
    row.dt_fechamento !== undefined
      ? row.dt_fechamento
      : row.dia_fechamento || 1
  );
  const cor = row.cor_cartao || row.cor || '#18181B';

  return {
    id,
    cd_cartao: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    nome,
    nm_cartao: nome,
    banco: bancoNome,
    ds_banco_cartao: bancoNome,
    bandeira,
    ds_bandeira_cartao: bandeira,
    final_cartao: finalCartao,
    ds_final_cartao: finalCartao,
    limite,
    ds_limite: limite,
    dia_vencimento: diaVencimento,
    dt_vencimento: diaVencimento,
    dia_fechamento: diaFechamento,
    dt_fechamento: diaFechamento,
    cor,
    cor_cartao: cor,
  };
}

function normalizarMovimentacao(row) {
  if (!row) return null;
  const id = row.cd_movimentacao || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const descricao = row.ds_movimentacao || row.descricao || '';
  const valor = Number(
    row.vl_movimentacao !== undefined ? row.vl_movimentacao : row.valor || 0
  );
  const tipo = row.ds_tipo || row.tipo || 'Saída';
  const categoria = row.ds_categoria || row.categoria || 'Outros';
  const formaPagamento = row.ds_forma_pagamento || row.forma_pagamento || 'Pix';
  const cartaoId =
    row.id_cartao !== undefined ? row.id_cartao : row.cartao_id || null;
  const data = row.dt_movimentacao || row.data || '';
  const recorrenteId =
    row.id_recorrente !== undefined
      ? row.id_recorrente
      : row.recorrente_id || null;
  const criadaEm = Number(row.criada_em || Date.now());

  return {
    id,
    cd_movimentacao: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    descricao,
    ds_movimentacao: descricao,
    valor,
    vl_movimentacao: valor,
    tipo,
    ds_tipo: tipo,
    categoria,
    ds_categoria: categoria,
    forma_pagamento: formaPagamento,
    ds_forma_pagamento: formaPagamento,
    cartao_id: cartaoId,
    id_cartao: cartaoId,
    data,
    dt_movimentacao: data,
    recorrente_id: recorrenteId,
    id_recorrente: recorrenteId,
    criada_em: criadaEm,
    nome_cartao: row.nome_cartao || row.nm_cartao || null,
    banco_cartao: row.ds_banco_cartao || null,
    bandeira_cartao: row.ds_bandeira_cartao || null,
    final_cartao: row.ds_final_cartao || null,
    cor_cartao: row.cor_cartao || null,
  };
}

function normalizarMeta(row) {
  if (!row) return null;
  const id = row.cd_meta || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const titulo = row.nm_meta || row.titulo || '';
  const valorAlvo = Number(
    row.ds_valor_alvo !== undefined ? row.ds_valor_alvo : row.valor_alvo || 0
  );
  const valorAtual = Number(
    row.ds_valor_atual !== undefined ? row.ds_valor_atual : row.valor_atual || 0
  );
  const dataLimite = row.dt_limite || row.data_limite || '';
  const cor = row.ds_cor || row.cor || '#18181B';

  return {
    id,
    cd_meta: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    titulo,
    nm_meta: titulo,
    valor_alvo: valorAlvo,
    ds_valor_alvo: valorAlvo,
    valor_atual: valorAtual,
    ds_valor_atual: valorAtual,
    data_limite: dataLimite,
    dt_limite: dataLimite,
    cor,
    ds_cor: cor,
  };
}

function normalizarRecorrente(row) {
  if (!row) return null;
  const id = row.cd_recorrente || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const descricao = row.ds_recorrente || row.descricao || '';
  const valor = Number(
    row.vl_recorrente !== undefined ? row.vl_recorrente : row.valor || 0
  );
  const tipo = row.ds_tipo_recorrente || row.tipo || 'Saída';
  const categoria = row.ds_categoria || row.categoria || 'Contas';
  const formaPagamento = row.ds_forma_pagamento || row.forma_pagamento || 'Pix';
  const cartaoId =
    row.id_cartao !== undefined ? row.id_cartao : row.cartao_id || null;
  const diaMes = Number(
    row.dt_dia_mes !== undefined ? row.dt_dia_mes : row.dia_mes || 1
  );
  const ativo = Number(
    row.fl_ativo !== undefined
      ? row.fl_ativo
      : row.ativo !== undefined
      ? row.ativo
      : 1
  );

  return {
    id,
    cd_recorrente: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    descricao,
    ds_recorrente: descricao,
    valor,
    vl_recorrente: valor,
    tipo,
    ds_tipo: tipo,
    ds_tipo_recorrente: tipo,
    categoria,
    ds_categoria: categoria,
    forma_pagamento: formaPagamento,
    ds_forma_pagamento: formaPagamento,
    cartao_id: cartaoId,
    id_cartao: cartaoId,
    dia_mes: diaMes,
    dt_dia_mes: diaMes,
    ativo,
    fl_ativo: ativo,
    nome_cartao: row.nome_cartao || row.nm_cartao || null,
  };
}

function normalizarConta(row) {
  if (!row) return null;
  const id = row.cd_conta || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const descricao = row.ds_conta || row.descricao || '';
  const valor = Number(
    row.vl_conta !== undefined ? row.vl_conta : row.valor || 0
  );
  const tipo = row.ds_tipo || row.tipo || 'Pagar';
  const categoria = row.ds_categoria || row.categoria || 'Contas';
  const dataVencimento = row.dt_vencimento || row.data || '';
  const pago = Number(row.fl_pago !== undefined ? row.fl_pago : row.pago || 0);

  return {
    id,
    cd_conta: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    descricao,
    ds_conta: descricao,
    valor,
    vl_conta: valor,
    tipo,
    ds_tipo: tipo,
    categoria,
    ds_categoria: categoria,
    data_vencimento: dataVencimento,
    dt_vencimento: dataVencimento,
    pago,
    fl_pago: pago,
  };
}

function normalizarOrcamento(row) {
  if (!row) return null;
  const id = row.cd_orcamento || row.id;
  const usuarioId = row.id_usuario || row.usuario_id;
  const categoria = row.ds_categoria || row.categoria || '';
  const limiteMensal = Number(
    row.vl_limite_mensal !== undefined ? row.vl_limite_mensal : row.valor || 0
  );
  const mesAno = row.dt_mes_ano || row.mes_ano || '';

  return {
    id,
    cd_orcamento: id,
    usuario_id: usuarioId,
    id_usuario: usuarioId,
    categoria,
    ds_categoria: categoria,
    limite_mensal: limiteMensal,
    vl_limite_mensal: limiteMensal,
    mes_ano: mesAno,
    dt_mes_ano: mesAno,
  };
}

export const banco = {
  async inicializar() {
    const database = await obterBanco();

    if (!isWebOrFallback && database) {
      try {
        if (database.execSync) {
          database.execSync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
            PRAGMA busy_timeout = 5000;

            CREATE TABLE IF NOT EXISTS tb_usuarios (
              cd_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
              nm_usuario TEXT NOT NULL,
              ds_email TEXT UNIQUE NOT NULL,
              ds_senha TEXT NOT NULL,
              dt_criado_em TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tb_sessao (
              cd_sessao INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER UNIQUE NOT NULL,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tb_cartoes (
              cd_cartao INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              nm_cartao TEXT NOT NULL,
              ds_banco_cartao TEXT,
              ds_bandeira_cartao TEXT,
              ds_final_cartao TEXT,
              ds_limite REAL NOT NULL,
              dt_vencimento INTEGER DEFAULT 10,
              dt_fechamento INTEGER,
              cor_cartao TEXT DEFAULT '#18181B',
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tb_recorrentes (
              cd_recorrente INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              ds_recorrente TEXT NOT NULL,
              vl_recorrente REAL NOT NULL,
              ds_tipo_recorrente TEXT NOT NULL,
              ds_categoria TEXT NOT NULL,
              ds_forma_pagamento TEXT NOT NULL,
              id_cartao INTEGER,
              dt_dia_mes INTEGER NOT NULL,
              fl_ativo INTEGER DEFAULT 1,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE,
              FOREIGN KEY (id_cartao) REFERENCES tb_cartoes(cd_cartao) ON DELETE SET NULL,
              CHECK (ds_tipo_recorrente IN ('Entrada', 'Saída')),
              CHECK (dt_dia_mes BETWEEN 1 AND 31),
              CHECK (fl_ativo IN (0, 1))
            );

            CREATE TABLE IF NOT EXISTS tb_movimentacoes (
              cd_movimentacao INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              ds_movimentacao TEXT NOT NULL,
              vl_movimentacao REAL NOT NULL,
              ds_tipo TEXT NOT NULL,
              ds_categoria TEXT NOT NULL,
              ds_forma_pagamento TEXT DEFAULT 'Pix',
              id_cartao INTEGER,
              dt_movimentacao TEXT NOT NULL DEFAULT CURRENT_DATE,
              id_recorrente INTEGER,
              criada_em INTEGER NOT NULL,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE,
              FOREIGN KEY (id_cartao) REFERENCES tb_cartoes(cd_cartao) ON DELETE SET NULL,
              FOREIGN KEY (id_recorrente) REFERENCES tb_recorrentes(cd_recorrente) ON DELETE SET NULL,
              CHECK (ds_tipo IN ('Entrada', 'Saída'))
            );

            CREATE TABLE IF NOT EXISTS tb_metas (
              cd_meta INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              nm_meta TEXT NOT NULL,
              ds_valor_alvo REAL NOT NULL,
              ds_valor_atual REAL DEFAULT 0,
              dt_limite TEXT,
              ds_cor TEXT DEFAULT '#18181B',
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tb_orcamentos (
              cd_orcamento INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              ds_categoria TEXT NOT NULL,
              vl_limite_mensal REAL NOT NULL,
              dt_mes_ano TEXT NOT NULL,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tb_contas (
              cd_conta INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              ds_conta TEXT NOT NULL,
              vl_conta REAL NOT NULL,
              ds_tipo TEXT NOT NULL,
              ds_categoria TEXT NOT NULL,
              dt_vencimento TEXT NOT NULL,
              fl_pago INTEGER DEFAULT 0,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE,
              CHECK (ds_tipo IN ('Pagar', 'Receber')),
              CHECK (fl_pago IN (0, 1))
            );

            CREATE TABLE IF NOT EXISTS tb_categorias (
              cd_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
              id_usuario INTEGER NOT NULL,
              nm_categoria TEXT NOT NULL,
              ds_tipo TEXT NOT NULL,
              FOREIGN KEY (id_usuario) REFERENCES tb_usuarios(cd_usuario) ON DELETE CASCADE,
              CHECK (ds_tipo IN ('Entrada', 'Saída'))
            );

            CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario ON tb_movimentacoes(id_usuario);
            CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON tb_movimentacoes(dt_movimentacao);
            CREATE INDEX IF NOT EXISTS idx_recorrentes_usuario ON tb_recorrentes(id_usuario);
            CREATE INDEX IF NOT EXISTS idx_cartoes_usuario ON tb_cartoes(id_usuario);
            CREATE INDEX IF NOT EXISTS idx_metas_usuario ON tb_metas(id_usuario);
            CREATE INDEX IF NOT EXISTS idx_orcamentos_usuario ON tb_orcamentos(id_usuario);
            CREATE INDEX IF NOT EXISTS idx_contas_usuario ON tb_contas(id_usuario);
          `);

          // Migração suave caso existam dados nas tabelas legadas anteriores
          try {
            const legUsuarios = database.getFirstSync(
              "SELECT count(*) as total FROM sqlite_master WHERE type='table' AND name='usuarios'"
            );
            if (legUsuarios && legUsuarios.total > 0) {
              database.execSync(`
                INSERT OR IGNORE INTO tb_usuarios (cd_usuario, nm_usuario, ds_email, ds_senha, dt_criado_em)
                SELECT id, nome, email, senha, criado_em FROM usuarios;
              `);
            }
          } catch (migErr) {}

          return;
        }
      } catch (err) {
        console.warn('Erro ao inicializar SQLite nativo:', err);
        isWebOrFallback = true;
      }
    }
  },

  async cadastrarUsuario(nome, email, senha) {
    await this.inicializar();
    const database = await obterBanco();
    nome = String(nome || '').trim();
    email = String(email || '')
      .trim()
      .toLowerCase();
    senha = String(senha || '');

    if (!nome) throw new Error('Por favor, digite seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error('Digite um endereço de e-mail válido.');
    if (senha.length < 8)
      throw new Error(
        'A senha precisa ter pelo menos 8 caracteres para sua segurança.'
      );

    const senhaHash = await bcrypt.hash(senha, 10);

    if (!isWebOrFallback && database && database.runSync) {
      const existe = database.getFirstSync(
        'SELECT cd_usuario FROM tb_usuarios WHERE lower(ds_email) = ?',
        [email]
      );
      if (existe)
        throw new Error('Já existe uma conta cadastrada com este e-mail.');

      const res = database.runSync(
        'INSERT INTO tb_usuarios (nm_usuario, ds_email, ds_senha) VALUES (?, ?, ?)',
        [nome, email, senhaHash]
      );
      const novoId = res.lastInsertRowId;
      database.runSync('DELETE FROM tb_sessao');
      database.runSync('INSERT INTO tb_sessao (id_usuario) VALUES (?)', [
        novoId,
      ]);

      return normalizarUsuario({
        cd_usuario: novoId,
        nm_usuario: nome,
        ds_email: email,
      });
    }

    const existente = memoria.usuarios.find((u) => u.ds_email === email);
    if (existente)
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    const novoUsuario = {
      cd_usuario: Date.now(),
      nm_usuario: nome,
      ds_email: email,
      ds_senha: senhaHash,
      dt_criado_em: new Date().toISOString(),
    };
    memoria.usuarios.push(novoUsuario);
    memoria.sessao = novoUsuario.cd_usuario;

    return normalizarUsuario(novoUsuario);
  },

  async loginUsuario(email, senha) {
    await this.inicializar();
    const database = await obterBanco();
    email = String(email || '')
      .trim()
      .toLowerCase();
    senha = String(senha || '');
    if (!email || !senha)
      throw new Error('Digite seu e-mail e senha para entrar.');

    if (!isWebOrFallback && database && database.getFirstSync) {
      const user = database.getFirstSync(
        'SELECT cd_usuario, nm_usuario, ds_email, ds_senha, dt_criado_em FROM tb_usuarios WHERE lower(ds_email) = ?',
        [email]
      );
      if (!user) throw new Error('E-mail ou senha incorretos.');

      let senhaCorreta = false;
      try {
        senhaCorreta = await bcrypt.compare(senha, user.ds_senha);
      } catch (e) {
        senhaCorreta = false;
      }

      if (!senhaCorreta && user.ds_senha === senha) {
        const hashAtualizado = await bcrypt.hash(senha, 10);
        database.runSync(
          'UPDATE tb_usuarios SET ds_senha = ? WHERE cd_usuario = ?',
          [hashAtualizado, user.cd_usuario]
        );
        senhaCorreta = true;
      }

      if (!senhaCorreta) throw new Error('E-mail ou senha incorretos.');

      database.runSync('DELETE FROM tb_sessao');
      database.runSync('INSERT INTO tb_sessao (id_usuario) VALUES (?)', [
        user.cd_usuario,
      ]);
      return normalizarUsuario(user);
    }

    const user = memoria.usuarios.find(
      (u) => String(u.ds_email).toLowerCase() === email
    );
    if (!user) throw new Error('E-mail ou senha incorretos.');

    let senhaCorreta = false;
    try {
      senhaCorreta = await bcrypt.compare(senha, user.ds_senha);
    } catch (e) {
      senhaCorreta = false;
    }
    if (!senhaCorreta && user.ds_senha === senha) {
      user.ds_senha = await bcrypt.hash(senha, 10);
      senhaCorreta = true;
    }
    if (!senhaCorreta) throw new Error('E-mail ou senha incorretos.');

    memoria.sessao = user.cd_usuario;
    return normalizarUsuario(user);
  },

  async obterSessao() {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getFirstSync) {
      const sessao = database.getFirstSync(
        'SELECT id_usuario FROM tb_sessao LIMIT 1'
      );
      if (!sessao || !sessao.id_usuario) return null;
      const user = database.getFirstSync(
        'SELECT cd_usuario, nm_usuario, ds_email, dt_criado_em FROM tb_usuarios WHERE cd_usuario = ?',
        [sessao.id_usuario]
      );
      return normalizarUsuario(user);
    }

    if (memoria.sessao) {
      const u = memoria.usuarios.find((x) => x.cd_usuario === memoria.sessao);
      return normalizarUsuario(u);
    }
    return null;
  },

  async encerrarSessao() {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync('DELETE FROM tb_sessao');
    }
    memoria.sessao = null;
  },

  async alterarNome(usuarioId, novoNome) {
    await this.inicializar();
    const database = await obterBanco();
    const nomeLimpo = String(novoNome || '').trim();
    if (!nomeLimpo) throw new Error('Digite seu novo nome.');

    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'UPDATE tb_usuarios SET nm_usuario = ? WHERE cd_usuario = ?',
        [nomeLimpo, usuarioId]
      );
      return { id: usuarioId, nome: nomeLimpo };
    }

    const u = memoria.usuarios.find((x) => x.cd_usuario === usuarioId);
    if (u) u.nm_usuario = nomeLimpo;
    return { id: usuarioId, nome: nomeLimpo };
  },

  async alterarSenha(usuarioId, senhaAtual, novaSenha) {
    await this.inicializar();
    const database = await obterBanco();
    if (novaSenha.length < 8)
      throw new Error('A nova senha deve ter no mínimo 8 caracteres.');

    if (!isWebOrFallback && database && database.getFirstSync) {
      const user = database.getFirstSync(
        'SELECT ds_senha FROM tb_usuarios WHERE cd_usuario = ?',
        [usuarioId]
      );
      if (!user) throw new Error('Usuário não encontrado.');

      const valida = await bcrypt.compare(senhaAtual, user.ds_senha);
      if (!valida && user.ds_senha !== senhaAtual) {
        throw new Error('A senha atual está incorreta.');
      }

      const novoHash = await bcrypt.hash(novaSenha, 10);
      database.runSync(
        'UPDATE tb_usuarios SET ds_senha = ? WHERE cd_usuario = ?',
        [novoHash, usuarioId]
      );
      return true;
    }

    const u = memoria.usuarios.find((x) => x.cd_usuario === usuarioId);
    if (!u) throw new Error('Usuário não encontrado.');
    const valida = await bcrypt.compare(senhaAtual, u.ds_senha);
    if (!valida && u.ds_senha !== senhaAtual) {
      throw new Error('A senha atual está incorreta.');
    }
    u.ds_senha = await bcrypt.hash(novaSenha, 10);
    return true;
  },

  async excluirConta(usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync('DELETE FROM tb_usuarios WHERE cd_usuario = ?', [
        usuarioId,
      ]);
      database.runSync('DELETE FROM tb_sessao');
      return true;
    }
    memoria.usuarios = memoria.usuarios.filter(
      (u) => u.cd_usuario !== usuarioId
    );
    memoria.movimentacoes = memoria.movimentacoes.filter(
      (m) => m.id_usuario !== usuarioId
    );
    memoria.cartoes = memoria.cartoes.filter((c) => c.id_usuario !== usuarioId);
    memoria.metas = memoria.metas.filter((m) => m.id_usuario !== usuarioId);
    memoria.recorrentes = memoria.recorrentes.filter(
      (r) => r.id_usuario !== usuarioId
    );
    memoria.orcamentos = memoria.orcamentos.filter(
      (o) => o.id_usuario !== usuarioId
    );
    memoria.contas = memoria.contas.filter((c) => c.id_usuario !== usuarioId);
    memoria.sessao = null;
    return true;
  },

  async processarRecorrentes(usuarioId, mesAno) {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getAllSync) {
      const recorrentes = database.getAllSync(
        'SELECT * FROM tb_recorrentes WHERE id_usuario = ? AND fl_ativo = 1',
        [usuarioId]
      );

      for (const rec of recorrentes) {
        const jaRegistrada = database.getFirstSync(
          'SELECT cd_movimentacao FROM tb_movimentacoes WHERE id_usuario = ? AND id_recorrente = ? AND dt_movimentacao LIKE ?',
          [usuarioId, rec.cd_recorrente, `${mesAno}%`]
        );

        if (!jaRegistrada) {
          const diaFormatado = String(rec.dt_dia_mes || 1).padStart(2, '0');
          const dataGerada = `${mesAno}-${diaFormatado}`;
          database.runSync(
            `INSERT INTO tb_movimentacoes 
             (id_usuario, ds_movimentacao, vl_movimentacao, ds_tipo, ds_categoria, ds_forma_pagamento, id_cartao, dt_movimentacao, id_recorrente, criada_em) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              usuarioId,
              rec.ds_recorrente,
              rec.vl_recorrente,
              rec.ds_tipo_recorrente,
              rec.ds_categoria,
              rec.ds_forma_pagamento,
              rec.id_cartao || null,
              dataGerada,
              rec.cd_recorrente,
              Date.now(),
            ]
          );
        }
      }
      return;
    }

    const recs = memoria.recorrentes.filter(
      (r) => r.id_usuario === usuarioId && r.fl_ativo === 1
    );
    for (const rec of recs) {
      const jaExiste = memoria.movimentacoes.find(
        (m) =>
          m.id_usuario === usuarioId &&
          m.id_recorrente === rec.cd_recorrente &&
          m.dt_movimentacao.startsWith(mesAno)
      );
      if (!jaExiste) {
        const diaFormatado = String(rec.dt_dia_mes || 1).padStart(2, '0');
        memoria.movimentacoes.push({
          cd_movimentacao: Date.now() + Math.floor(Math.random() * 1000),
          id_usuario: usuarioId,
          ds_movimentacao: rec.ds_recorrente,
          vl_movimentacao: rec.vl_recorrente,
          ds_tipo: rec.ds_tipo_recorrente,
          ds_categoria: rec.ds_categoria,
          ds_forma_pagamento: rec.ds_forma_pagamento,
          id_cartao: rec.id_cartao || null,
          dt_movimentacao: `${mesAno}-${diaFormatado}`,
          id_recorrente: rec.cd_recorrente,
          criada_em: Date.now(),
        });
      }
    }
  },

  async listarRecorrentes(usuarioId) {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        `SELECT r.*, c.nm_cartao as nome_cartao, c.cor_cartao 
         FROM tb_recorrentes r 
         LEFT JOIN tb_cartoes c ON r.id_cartao = c.cd_cartao 
         WHERE r.id_usuario = ? 
         ORDER BY r.dt_dia_mes ASC`,
        [usuarioId]
      );
      return rows.map(normalizarRecorrente);
    }

    return memoria.recorrentes
      .filter((r) => r.id_usuario === usuarioId)
      .map((r) => {
        const c = memoria.cartoes.find(
          (cart) => cart.cd_cartao === r.id_cartao
        );
        return normalizarRecorrente({
          ...r,
          nome_cartao: c ? c.nm_cartao : null,
        });
      });
  },

  async adicionarRecorrente(dados) {
    const database = await obterBanco();
    const uid = dados.usuario_id || dados.id_usuario;
    const desc = dados.descricao || dados.ds_recorrente;
    const val = dados.valor || dados.vl_recorrente;
    const tipo = dados.tipo || dados.ds_tipo_recorrente || 'Saída';
    const cat = dados.categoria || dados.ds_categoria || 'Contas';
    const forma = dados.forma_pagamento || dados.ds_forma_pagamento || 'Pix';
    const cid = dados.cartao_id || dados.id_cartao || null;
    const dia = Number(dados.dia_mes || dados.dt_dia_mes || 1);

    if (!isWebOrFallback && database && database.runSync) {
      const res = database.runSync(
        `INSERT INTO tb_recorrentes 
         (id_usuario, ds_recorrente, vl_recorrente, ds_tipo_recorrente, ds_categoria, ds_forma_pagamento, id_cartao, dt_dia_mes, fl_ativo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [uid, desc, val, tipo, cat, forma, cid, dia]
      );
      return normalizarRecorrente({
        cd_recorrente: res.lastInsertRowId,
        id_usuario: uid,
        ds_recorrente: desc,
        vl_recorrente: val,
        ds_tipo_recorrente: tipo,
        ds_categoria: cat,
        ds_forma_pagamento: forma,
        id_cartao: cid,
        dt_dia_mes: dia,
        fl_ativo: 1,
      });
    }

    const item = {
      cd_recorrente: Date.now(),
      id_usuario: uid,
      ds_recorrente: desc,
      vl_recorrente: val,
      ds_tipo_recorrente: tipo,
      ds_categoria: cat,
      ds_forma_pagamento: forma,
      id_cartao: cid,
      dt_dia_mes: dia,
      fl_ativo: 1,
    };
    memoria.recorrentes.push(item);
    return normalizarRecorrente(item);
  },

  async excluirRecorrente(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'DELETE FROM tb_recorrentes WHERE cd_recorrente = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }
    memoria.recorrentes = memoria.recorrentes.filter(
      (r) => !(r.cd_recorrente === id && r.id_usuario === usuarioId)
    );
    return true;
  },

  async listarMovimentacoes(usuarioId) {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        `SELECT m.*, c.nm_cartao as nome_cartao, c.ds_banco_cartao, c.ds_bandeira_cartao, c.ds_final_cartao, c.cor_cartao 
         FROM tb_movimentacoes m 
         LEFT JOIN tb_cartoes c ON m.id_cartao = c.cd_cartao 
         WHERE m.id_usuario = ? 
         ORDER BY m.dt_movimentacao DESC, m.criada_em DESC`,
        [usuarioId]
      );
      return rows.map(normalizarMovimentacao);
    }

    return memoria.movimentacoes
      .filter((m) => m.id_usuario === usuarioId)
      .map((m) => {
        const c = memoria.cartoes.find(
          (cart) => cart.cd_cartao === m.id_cartao
        );
        return normalizarMovimentacao({
          ...m,
          nome_cartao: c ? c.nm_cartao : null,
          ds_banco_cartao: c ? c.ds_banco_cartao : null,
          ds_bandeira_cartao: c ? c.ds_bandeira_cartao : null,
          ds_final_cartao: c ? c.ds_final_cartao : null,
          cor_cartao: c ? c.cor_cartao : null,
        });
      })
      .sort(
        (a, b) =>
          (b.dt_movimentacao || '').localeCompare(a.dt_movimentacao || '') ||
          b.criada_em - a.criada_em
      );
  },

  async adicionarMovimentacao(dados) {
    const database = await obterBanco();
    const timestamp = Date.now();
    const uid = dados.usuario_id || dados.id_usuario;
    const desc = dados.descricao || dados.ds_movimentacao;
    const val = dados.valor || dados.vl_movimentacao;
    const tipo = dados.tipo || dados.ds_tipo || 'Saída';
    const cat = dados.categoria || dados.ds_categoria || 'Outros';
    const forma = dados.forma_pagamento || dados.ds_forma_pagamento || 'Pix';
    const cid = dados.cartao_id || dados.id_cartao || null;
    const data = dados.data || dados.dt_movimentacao;
    const rid = dados.recorrente_id || dados.id_recorrente || null;

    if (!isWebOrFallback && database && database.runSync) {
      const res = database.runSync(
        `INSERT INTO tb_movimentacoes 
         (id_usuario, ds_movimentacao, vl_movimentacao, ds_tipo, ds_categoria, ds_forma_pagamento, id_cartao, dt_movimentacao, id_recorrente, criada_em) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, desc, val, tipo, cat, forma, cid, data, rid, timestamp]
      );
      return normalizarMovimentacao({
        cd_movimentacao: res.lastInsertRowId,
        id_usuario: uid,
        ds_movimentacao: desc,
        vl_movimentacao: val,
        ds_tipo: tipo,
        ds_categoria: cat,
        ds_forma_pagamento: forma,
        id_cartao: cid,
        dt_movimentacao: data,
        id_recorrente: rid,
        criada_em: timestamp,
      });
    }

    const item = {
      cd_movimentacao: Date.now(),
      id_usuario: uid,
      ds_movimentacao: desc,
      vl_movimentacao: val,
      ds_tipo: tipo,
      ds_categoria: cat,
      ds_forma_pagamento: forma,
      id_cartao: cid,
      dt_movimentacao: data,
      id_recorrente: rid,
      criada_em: timestamp,
    };
    memoria.movimentacoes.push(item);
    return normalizarMovimentacao(item);
  },

  async adicionarMovimentacaoParcelada(dados, totalParcelas) {
    const qtd = Math.max(1, Math.min(36, Number(totalParcelas) || 1));
    if (qtd === 1) {
      return [await this.adicionarMovimentacao(dados)];
    }

    const valorTotal = Number(dados.valor || dados.vl_movimentacao || 0);
    const valorParcela = Math.round((valorTotal / qtd) * 100) / 100;
    const baseData =
      dados.data ||
      dados.dt_movimentacao ||
      new Date().toISOString().slice(0, 10);
    const [anoBase, mesBase, diaBase] = baseData.split('-').map(Number);

    const resultados = [];
    for (let i = 0; i < qtd; i++) {
      const dataParcelaObj = new Date(anoBase, mesBase - 1 + i, diaBase);
      const a = dataParcelaObj.getFullYear();
      const m = String(dataParcelaObj.getMonth() + 1).padStart(2, '0');
      const maxDia = new Date(a, dataParcelaObj.getMonth() + 1, 0).getDate();
      const d = String(Math.min(diaBase, maxDia)).padStart(2, '0');
      const dataFormatada = `${a}-${m}-${d}`;

      const res = await this.adicionarMovimentacao({
        ...dados,
        descricao: `${dados.descricao || dados.ds_movimentacao} (${
          i + 1
        }/${qtd})`,
        valor: valorParcela,
        data: dataFormatada,
      });
      resultados.push(res);
    }
    return resultados;
  },

  async atualizarMovimentacao(dados) {
    const database = await obterBanco();
    const id = dados.id || dados.cd_movimentacao;
    const uid = dados.usuario_id || dados.id_usuario;
    const desc = dados.descricao || dados.ds_movimentacao;
    const val = dados.valor || dados.vl_movimentacao;
    const tipo = dados.tipo || dados.ds_tipo;
    const cat = dados.categoria || dados.ds_categoria;
    const forma = dados.forma_pagamento || dados.ds_forma_pagamento;
    const cid = dados.cartao_id || dados.id_cartao || null;
    const data = dados.data || dados.dt_movimentacao;

    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        `UPDATE tb_movimentacoes SET 
          ds_movimentacao = ?, 
          vl_movimentacao = ?, 
          ds_tipo = ?, 
          ds_categoria = ?, 
          ds_forma_pagamento = ?, 
          id_cartao = ?, 
          dt_movimentacao = ? 
         WHERE cd_movimentacao = ? AND id_usuario = ?`,
        [desc, val, tipo, cat, forma, cid, data, id, uid]
      );
      return normalizarMovimentacao(dados);
    }

    const idx = memoria.movimentacoes.findIndex(
      (m) => m.cd_movimentacao === id && m.id_usuario === uid
    );
    if (idx >= 0) {
      memoria.movimentacoes[idx] = {
        ...memoria.movimentacoes[idx],
        ds_movimentacao: desc,
        vl_movimentacao: val,
        ds_tipo: tipo,
        ds_categoria: cat,
        ds_forma_pagamento: forma,
        id_cartao: cid,
        dt_movimentacao: data,
      };
    }
    return normalizarMovimentacao(dados);
  },

  async excluirMovimentacao(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'DELETE FROM tb_movimentacoes WHERE cd_movimentacao = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }
    memoria.movimentacoes = memoria.movimentacoes.filter(
      (m) => !(m.cd_movimentacao === id && m.id_usuario === usuarioId)
    );
    return true;
  },

  async listarCartoes(usuarioId) {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        'SELECT * FROM tb_cartoes WHERE id_usuario = ? ORDER BY cd_cartao ASC',
        [usuarioId]
      );
      return rows.map(normalizarCartao);
    }
    return memoria.cartoes
      .filter((c) => c.id_usuario === usuarioId)
      .map(normalizarCartao);
  },

  async adicionarCartao(dados) {
    const database = await obterBanco();
    const uid = dados.usuario_id || dados.id_usuario;
    const nome = dados.nome || dados.nm_cartao;
    const bancoNome = dados.banco || dados.ds_banco_cartao || 'Nubank';
    const bandeira = dados.bandeira || dados.ds_bandeira_cartao || 'Mastercard';
    const finalCartao = dados.final_cartao || dados.ds_final_cartao || '0000';
    const limite = Number(dados.limite || dados.ds_limite || 0);
    const fechamento = Number(dados.dia_fechamento || dados.dt_fechamento || 5);
    const vencimento = Number(
      dados.dia_vencimento || dados.dt_vencimento || 15
    );
    const cor = dados.cor || dados.cor_cartao || '#18181B';

    if (!isWebOrFallback && database && database.runSync) {
      const res = database.runSync(
        `INSERT INTO tb_cartoes 
         (id_usuario, nm_cartao, ds_banco_cartao, ds_bandeira_cartao, ds_final_cartao, ds_limite, dt_fechamento, dt_vencimento, cor_cartao) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uid,
          nome,
          bancoNome,
          bandeira,
          finalCartao,
          limite,
          fechamento,
          vencimento,
          cor,
        ]
      );
      return normalizarCartao({
        cd_cartao: res.lastInsertRowId,
        id_usuario: uid,
        nm_cartao: nome,
        ds_banco_cartao: bancoNome,
        ds_bandeira_cartao: bandeira,
        ds_final_cartao: finalCartao,
        ds_limite: limite,
        dt_fechamento: fechamento,
        dt_vencimento: vencimento,
        cor_cartao: cor,
      });
    }

    const novo = {
      cd_cartao: Date.now(),
      id_usuario: uid,
      nm_cartao: nome,
      ds_banco_cartao: bancoNome,
      ds_bandeira_cartao: bandeira,
      ds_final_cartao: finalCartao,
      ds_limite: limite,
      dt_fechamento: fechamento,
      dt_vencimento: vencimento,
      cor_cartao: cor,
    };
    memoria.cartoes.push(novo);
    return normalizarCartao(novo);
  },

  async atualizarCartao(dados) {
    const database = await obterBanco();
    const id = dados.id || dados.cd_cartao;
    const uid = dados.usuario_id || dados.id_usuario;
    const nome = dados.nome || dados.nm_cartao;
    const bancoNome = dados.banco || dados.ds_banco_cartao || 'Nubank';
    const bandeira = dados.bandeira || dados.ds_bandeira_cartao || 'Mastercard';
    const finalCartao = dados.final_cartao || dados.ds_final_cartao || '0000';
    const limite = Number(dados.limite || dados.ds_limite || 0);
    const fechamento = Number(dados.dia_fechamento || dados.dt_fechamento || 5);
    const vencimento = Number(
      dados.dia_vencimento || dados.dt_vencimento || 15
    );
    const cor = dados.cor || dados.cor_cartao || '#18181B';

    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        `UPDATE tb_cartoes SET 
          nm_cartao = ?, 
          ds_banco_cartao = ?, 
          ds_bandeira_cartao = ?, 
          ds_final_cartao = ?, 
          ds_limite = ?, 
          dt_fechamento = ?, 
          dt_vencimento = ?, 
          cor_cartao = ?
         WHERE cd_cartao = ? AND id_usuario = ?`,
        [
          nome,
          bancoNome,
          bandeira,
          finalCartao,
          limite,
          fechamento,
          vencimento,
          cor,
          id,
          uid,
        ]
      );
      return normalizarCartao(dados);
    }

    const idx = memoria.cartoes.findIndex(
      (c) => c.cd_cartao === id && c.id_usuario === uid
    );
    if (idx >= 0) {
      memoria.cartoes[idx] = {
        ...memoria.cartoes[idx],
        nm_cartao: nome,
        ds_banco_cartao: bancoNome,
        ds_bandeira_cartao: bandeira,
        ds_final_cartao: finalCartao,
        ds_limite: limite,
        dt_fechamento: fechamento,
        dt_vencimento: vencimento,
        cor_cartao: cor,
      };
    }
    return normalizarCartao(dados);
  },

  async excluirCartao(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'UPDATE tb_movimentacoes SET id_cartao = NULL WHERE id_cartao = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      database.runSync(
        'UPDATE tb_recorrentes SET id_cartao = NULL WHERE id_cartao = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      database.runSync(
        'DELETE FROM tb_cartoes WHERE cd_cartao = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }

    memoria.cartoes = memoria.cartoes.filter(
      (c) => !(c.cd_cartao === id && c.id_usuario === usuarioId)
    );
    memoria.movimentacoes = memoria.movimentacoes.map((m) =>
      m.id_cartao === id && m.id_usuario === usuarioId
        ? { ...m, id_cartao: null }
        : m
    );
    memoria.recorrentes = memoria.recorrentes.map((r) =>
      r.id_cartao === id && r.id_usuario === usuarioId
        ? { ...r, id_cartao: null }
        : r
    );
    return true;
  },

  async listarMetas(usuarioId) {
    await this.inicializar();
    const database = await obterBanco();

    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        'SELECT * FROM tb_metas WHERE id_usuario = ? ORDER BY cd_meta ASC',
        [usuarioId]
      );
      return rows.map(normalizarMeta);
    }
    return memoria.metas
      .filter((m) => m.id_usuario === usuarioId)
      .map(normalizarMeta);
  },

  async adicionarMeta(dados) {
    const database = await obterBanco();
    const uid = dados.usuario_id || dados.id_usuario;
    const tit = dados.titulo || dados.nm_meta;
    const alvo = Number(dados.valor_alvo || dados.ds_valor_alvo || 0);
    const atual = Number(dados.valor_atual || dados.ds_valor_atual || 0);
    const data = dados.data_limite || dados.dt_limite || '';
    const cor = dados.cor || dados.ds_cor || '#18181B';

    if (!isWebOrFallback && database && database.runSync) {
      const res = database.runSync(
        `INSERT INTO tb_metas (id_usuario, nm_meta, ds_valor_alvo, ds_valor_atual, dt_limite, ds_cor) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uid, tit, alvo, atual, data, cor]
      );
      return normalizarMeta({
        cd_meta: res.lastInsertRowId,
        id_usuario: uid,
        nm_meta: tit,
        ds_valor_alvo: alvo,
        ds_valor_atual: atual,
        dt_limite: data,
        ds_cor: cor,
      });
    }

    const nova = {
      cd_meta: Date.now(),
      id_usuario: uid,
      nm_meta: tit,
      ds_valor_alvo: alvo,
      ds_valor_atual: atual,
      dt_limite: data,
      ds_cor: cor,
    };
    memoria.metas.push(nova);
    return normalizarMeta(nova);
  },

  async atualizarValorMeta(id, usuarioId, novoValorAtual) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'UPDATE tb_metas SET ds_valor_atual = ? WHERE cd_meta = ? AND id_usuario = ?',
        [novoValorAtual, id, usuarioId]
      );
      return true;
    }
    const m = memoria.metas.find(
      (meta) => meta.cd_meta === id && meta.id_usuario === usuarioId
    );
    if (m) m.ds_valor_atual = novoValorAtual;
    return true;
  },

  async excluirMeta(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'DELETE FROM tb_metas WHERE cd_meta = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }
    memoria.metas = memoria.metas.filter(
      (m) => !(m.cd_meta === id && m.id_usuario === usuarioId)
    );
    return true;
  },

  async listarOrcamentos(usuarioId, mesAno) {
    await this.inicializar();
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        'SELECT * FROM tb_orcamentos WHERE id_usuario = ? AND dt_mes_ano = ?',
        [usuarioId, mesAno]
      );
      return rows.map(normalizarOrcamento);
    }
    return memoria.orcamentos
      .filter((o) => o.id_usuario === usuarioId && o.dt_mes_ano === mesAno)
      .map(normalizarOrcamento);
  },

  async salvarOrcamento(dados) {
    const database = await obterBanco();
    const uid = dados.usuario_id || dados.id_usuario;
    const cat = dados.categoria || dados.ds_categoria;
    const val = Number(dados.limite_mensal || dados.vl_limite_mensal || 0);
    const mesAno = dados.mes_ano || dados.dt_mes_ano;

    if (!isWebOrFallback && database && database.runSync) {
      const jaExiste = database.getFirstSync(
        'SELECT cd_orcamento FROM tb_orcamentos WHERE id_usuario = ? AND ds_categoria = ? AND dt_mes_ano = ?',
        [uid, cat, mesAno]
      );
      if (jaExiste) {
        database.runSync(
          'UPDATE tb_orcamentos SET vl_limite_mensal = ? WHERE cd_orcamento = ?',
          [val, jaExiste.cd_orcamento]
        );
        return {
          id: jaExiste.cd_orcamento,
          categoria: cat,
          limite_mensal: val,
          mes_ano: mesAno,
        };
      } else {
        const res = database.runSync(
          'INSERT INTO tb_orcamentos (id_usuario, ds_categoria, vl_limite_mensal, dt_mes_ano) VALUES (?, ?, ?, ?)',
          [uid, cat, val, mesAno]
        );
        return {
          id: res.lastInsertRowId,
          categoria: cat,
          limite_mensal: val,
          mes_ano: mesAno,
        };
      }
    }

    const idx = memoria.orcamentos.findIndex(
      (o) =>
        o.id_usuario === uid &&
        o.ds_categoria === cat &&
        o.dt_mes_ano === mesAno
    );
    if (idx >= 0) {
      memoria.orcamentos[idx].vl_limite_mensal = val;
      return normalizarOrcamento(memoria.orcamentos[idx]);
    }
    const novo = {
      cd_orcamento: Date.now(),
      id_usuario: uid,
      ds_categoria: cat,
      vl_limite_mensal: val,
      dt_mes_ano: mesAno,
    };
    memoria.orcamentos.push(novo);
    return normalizarOrcamento(novo);
  },

  async excluirOrcamento(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'DELETE FROM tb_orcamentos WHERE cd_orcamento = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }
    memoria.orcamentos = memoria.orcamentos.filter(
      (o) => !(o.cd_orcamento === id && o.id_usuario === usuarioId)
    );
    return true;
  },

  async listarContas(usuarioId) {
    await this.inicializar();
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.getAllSync) {
      const rows = database.getAllSync(
        'SELECT * FROM tb_contas WHERE id_usuario = ? ORDER BY fl_pago ASC, dt_vencimento ASC',
        [usuarioId]
      );
      return rows.map(normalizarConta);
    }
    return memoria.contas
      .filter((c) => c.id_usuario === usuarioId)
      .map(normalizarConta);
  },

  async adicionarConta(dados) {
    const database = await obterBanco();
    const uid = dados.usuario_id || dados.id_usuario;
    const desc = dados.descricao || dados.ds_conta;
    const val = Number(dados.valor || dados.vl_conta || 0);
    const tipo = dados.tipo || dados.ds_tipo || 'Pagar';
    const cat = dados.categoria || dados.ds_categoria || 'Contas';
    const venc = dados.data_vencimento || dados.dt_vencimento;

    if (!isWebOrFallback && database && database.runSync) {
      const res = database.runSync(
        'INSERT INTO tb_contas (id_usuario, ds_conta, vl_conta, ds_tipo, ds_categoria, dt_vencimento, fl_pago) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [uid, desc, val, tipo, cat, venc]
      );
      return normalizarConta({
        cd_conta: res.lastInsertRowId,
        id_usuario: uid,
        ds_conta: desc,
        vl_conta: val,
        ds_tipo: tipo,
        ds_categoria: cat,
        dt_vencimento: venc,
        fl_pago: 0,
      });
    }

    const nova = {
      cd_conta: Date.now(),
      id_usuario: uid,
      ds_conta: desc,
      vl_conta: val,
      ds_tipo: tipo,
      ds_categoria: cat,
      dt_vencimento: venc,
      fl_pago: 0,
    };
    memoria.contas.push(nova);
    return normalizarConta(nova);
  },

  async alternarStatusConta(id, usuarioId, novoStatus) {
    const database = await obterBanco();
    const statusNum = novoStatus ? 1 : 0;
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'UPDATE tb_contas SET fl_pago = ? WHERE cd_conta = ? AND id_usuario = ?',
        [statusNum, id, usuarioId]
      );
      return true;
    }
    const c = memoria.contas.find(
      (x) => x.cd_conta === id && x.id_usuario === usuarioId
    );
    if (c) c.fl_pago = statusNum;
    return true;
  },

  async marcarContaComoPagaEGerarMovimentacao(
    contaId,
    usuarioId,
    formaPagamento = 'Pix',
    cartaoId = null
  ) {
    const database = await obterBanco();
    let conta = null;

    if (!isWebOrFallback && database && database.getFirstSync) {
      conta = database.getFirstSync(
        'SELECT * FROM tb_contas WHERE cd_conta = ? AND id_usuario = ?',
        [contaId, usuarioId]
      );
      if (conta) {
        database.runSync(
          'UPDATE tb_contas SET fl_pago = 1 WHERE cd_conta = ? AND id_usuario = ?',
          [contaId, usuarioId]
        );
      }
    } else {
      conta = memoria.contas.find(
        (c) => c.cd_conta === contaId && c.id_usuario === usuarioId
      );
      if (conta) conta.fl_pago = 1;
    }

    if (!conta) throw new Error('Conta não encontrada.');
    const dadosConta = normalizarConta(conta);

    const tipoMov = dadosConta.tipo === 'Pagar' ? 'Saída' : 'Entrada';
    const movCriada = await this.adicionarMovimentacao({
      usuario_id: usuarioId,
      descricao: `Pagamento: ${dadosConta.descricao}`,
      valor: dadosConta.valor,
      tipo: tipoMov,
      categoria: dadosConta.categoria,
      forma_pagamento: formaPagamento,
      cartao_id: cartaoId,
      data: new Date().toISOString().slice(0, 10),
    });

    return { conta: dadosConta, movimentacao: movCriada };
  },

  async excluirConta(id, usuarioId) {
    const database = await obterBanco();
    if (!isWebOrFallback && database && database.runSync) {
      database.runSync(
        'DELETE FROM tb_contas WHERE cd_conta = ? AND id_usuario = ?',
        [id, usuarioId]
      );
      return true;
    }
    memoria.contas = memoria.contas.filter(
      (c) => !(c.cd_conta === id && c.id_usuario === usuarioId)
    );
    return true;
  },
};
