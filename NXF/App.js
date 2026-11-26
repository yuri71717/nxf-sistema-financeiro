import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { banco } from './Banco';
import { C, s } from './Style';

const CORES_GRAFICO = [
  '#FAFAFA',
  '#D4D4D8',
  '#A1A1AA',
  '#71717A',
  '#52525B',
  '#3F3F46',
  '#E4E4E7',
  '#27272A',
];

export const BANCOS_BRASIL = [
  {
    id: 'Nubank',
    nome: 'Nubank',
    sigla: 'nu',
    cor: '#820AD1',
    corSecundaria: '#530082',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Roxo clássico Nubank com logo Nu',
  },
  {
    id: 'Banco Inter',
    nome: 'Banco Inter',
    sigla: 'inter',
    cor: '#FF7A00',
    corSecundaria: '#D65D00',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Laranja vibrante Inter',
  },
  {
    id: 'Itaú',
    nome: 'Itaú',
    sigla: 'itau',
    cor: '#003399',
    corSecundaria: '#EC7000',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Visa',
    detalhes: 'Azul clássico com badge laranja Itaú',
  },
  {
    id: 'Bradesco',
    nome: 'Bradesco',
    sigla: 'Bradesco',
    cor: '#CC092F',
    corSecundaria: '#8B0018',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Elo',
    detalhes: 'Vermelho Bradesco com traço prateado',
  },
  {
    id: 'Santander',
    nome: 'Santander',
    sigla: 'Santander',
    cor: '#EA1D2C',
    corSecundaria: '#990000',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Vermelho intenso Santander',
  },
  {
    id: 'Banco do Brasil',
    nome: 'Banco do Brasil',
    sigla: 'BB',
    cor: '#002D62',
    corSecundaria: '#F8D117',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Elo',
    detalhes: 'Azul institucional e detalhe dourado BB',
  },
  {
    id: 'Caixa Econômica',
    nome: 'Caixa',
    sigla: 'CAIXA',
    cor: '#005CA9',
    corSecundaria: '#F37021',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Elo',
    detalhes: 'Azul e faixa laranja Caixa',
  },
  {
    id: 'C6 Bank',
    nome: 'C6 Bank',
    sigla: 'C6 BANK',
    cor: '#181818',
    corSecundaria: '#2E2E2E',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Carbon black acabamento titânio',
  },
  {
    id: 'BTG Pactual',
    nome: 'BTG Pactual',
    sigla: 'BTG',
    cor: '#0A192F',
    corSecundaria: '#19355E',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Azul marinho corporate BTG',
  },
  {
    id: 'Mercado Pago',
    nome: 'Mercado Pago',
    sigla: 'MP',
    cor: '#009EE3',
    corSecundaria: '#007BB5',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Visa',
    detalhes: 'Azul cobalto Mercado Pago',
  },
  {
    id: 'Neon',
    nome: 'Neon',
    sigla: 'neon',
    cor: '#0B192C',
    corSecundaria: '#00E5FF',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Visa',
    detalhes: 'Azul noite com ciano neon',
  },
  {
    id: 'Black / Minimalista',
    nome: 'Black Card',
    sigla: 'BLACK',
    cor: '#18181B',
    corSecundaria: '#27272A',
    corTexto: '#FFFFFF',
    bandeiraPadrao: 'Mastercard',
    detalhes: 'Titânio fosco monocromático',
  },
];

export const BANDEIRAS_CARTAO = [
  'Mastercard',
  'Visa',
  'Elo',
  'American Express',
  'Hipercard',
];

const LARGURA_TELA = Dimensions.get('window').width;
const LARGURA_CARTAO = Math.min(340, Math.max(280, LARGURA_TELA - 48));
const INTERVALO_CARTAO = LARGURA_CARTAO + 14;

const ENTRADAS = [
  'Salário',
  'Vendas',
  'Serviços',
  'Investimentos',
  'Presente',
  'Outros',
];

const SAIDAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Contas',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Outros',
];

const FORMAS_PAGAMENTO = [
  'Pix',
  'Dinheiro',
  'Cartão de Débito',
  'Cartão de Crédito',
];

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function moeda(valor) {
  if (!valor || isNaN(valor)) valor = 0;
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarValor(valor, ocultar = false) {
  if (ocultar) return 'R$ •••••';
  return moeda(valor);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dataHoje() {
  const h = new Date();
  return `${h.getFullYear()}-${pad2(h.getMonth() + 1)}-${pad2(h.getDate())}`;
}

function mesAtual() {
  return dataHoje().slice(0, 7);
}

function dataExibida(data) {
  if (!data || data.length !== 10) return data || '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function tratarDigitacaoData(texto, setter) {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  let formatado = digitos;
  if (digitos.length > 4) {
    formatado = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(
      4
    )}`;
  } else if (digitos.length > 2) {
    formatado = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }
  setter(formatado);
}

function validarEConverterData(dataBr) {
  if (!dataBr || dataBr.length !== 10) return { valido: false, iso: '' };
  const partes = dataBr.split('/');
  if (partes.length !== 3) return { valido: false, iso: '' };
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  if (
    !dia ||
    !mes ||
    !ano ||
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12 ||
    ano < 2000 ||
    ano > 2099
  ) {
    return { valido: false, iso: '' };
  }

  const d = new Date(ano, mes - 1, dia);
  if (
    d.getFullYear() !== ano ||
    d.getMonth() !== mes - 1 ||
    d.getDate() !== dia
  ) {
    return { valido: false, iso: '' };
  }

  return {
    valido: true,
    iso: `${ano}-${pad2(mes)}-${pad2(dia)}`,
  };
}

function valorNumerico(texto) {
  let v = String(texto || '')
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return Number(v);
}

function somar(lista, tipo) {
  return lista.reduce((total, item) => {
    return item.tipo === tipo ? total + Number(item.valor || 0) : total;
  }, 0);
}

function nomeDoMes(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  return `${MESES[mes - 1]} ${ano}`;
}

function somarMes(chave, qtd) {
  const [ano, mes] = chave.split('-').map(Number);
  const d = new Date(ano, mes - 1 + qtd, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function agruparCategorias(lista, tipo) {
  const grupos = {};
  lista.forEach((item) => {
    if (item.tipo === tipo) {
      grupos[item.categoria] =
        (grupos[item.categoria] || 0) + Number(item.valor || 0);
    }
  });

  const res = Object.keys(grupos).map((nome, idx) => ({
    nome,
    valor: grupos[nome],
    cor: CORES_GRAFICO[idx % CORES_GRAFICO.length],
  }));

  return res.sort((a, b) => b.valor - a.valor);
}

function calcularForcaSenha(s) {
  if (!s) return { nivel: 'Vazio', cor: '#3F3F46', largura: '0%' };
  let pts = 0;
  if (s.length >= 8) pts += 1;
  if (s.length >= 12) pts += 1;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) pts += 1;
  if (/\d/.test(s)) pts += 1;
  if (/[^A-Za-z0-9]/.test(s)) pts += 1;

  if (pts <= 2) return { nivel: 'Fraca', cor: '#71717A', largura: '33%' };
  if (pts <= 3) return { nivel: 'Média', cor: '#D4D4D8', largura: '66%' };
  return { nivel: 'Forte (Excelente)', cor: '#FFFFFF', largura: '100%' };
}

function extrairDadosTextoBancario(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();

  let valor = 0;
  const matchValor = texto.match(
    /(?:R\$\s*|BRL\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2}|\.\d{2}))/i
  );
  if (matchValor) {
    valor = valorNumerico(matchValor[1]);
  }

  let tipo = 'Saída';
  if (
    t.includes('recebeu') ||
    t.includes('recebida') ||
    t.includes('recebido') ||
    t.includes('crédito em conta') ||
    t.includes('depósito') ||
    t.includes('reembolso') ||
    t.includes('salário')
  ) {
    tipo = 'Entrada';
  }

  let forma = 'Pix';
  if (
    t.includes('cartão de crédito') ||
    t.includes('crédito') ||
    t.includes('fatura')
  ) {
    forma = 'Cartão de Crédito';
  } else if (t.includes('débito') || t.includes('cartão de débito')) {
    forma = 'Cartão de Débito';
  } else if (
    t.includes('dinheiro') ||
    t.includes('saque') ||
    t.includes('espécie')
  ) {
    forma = 'Dinheiro';
  } else if (t.includes('pix')) {
    forma = 'Pix';
  }

  let categoria = tipo === 'Entrada' ? 'Salário' : 'Outros';
  if (
    t.includes('mercado') ||
    t.includes('supermercado') ||
    t.includes('padaria') ||
    t.includes('ifood') ||
    t.includes('restaurante') ||
    t.includes('lanche')
  ) {
    categoria = 'Alimentação';
  } else if (
    t.includes('uber') ||
    t.includes('99') ||
    t.includes('combustível') ||
    t.includes('posto') ||
    t.includes('gasolina')
  ) {
    categoria = 'Transporte';
  } else if (
    t.includes('farmácia') ||
    t.includes('drogaria') ||
    t.includes('médico') ||
    t.includes('consulta')
  ) {
    categoria = 'Saúde';
  } else if (
    t.includes('luz') ||
    t.includes('energia') ||
    t.includes('água') ||
    t.includes('aluguel') ||
    t.includes('internet')
  ) {
    categoria = 'Contas';
  } else if (
    t.includes('netflix') ||
    t.includes('spotify') ||
    t.includes('cinema') ||
    t.includes('jogos')
  ) {
    categoria = 'Lazer';
  } else if (
    t.includes('shopping') ||
    t.includes('loja') ||
    t.includes('amazon') ||
    t.includes('mercado livre')
  ) {
    categoria = 'Compras';
  }

  let descricao = 'Lançamento Automático';
  const matchPara = texto.match(
    /(?:para|em|no|na)\s+([A-Za-z0-9À-ÿ\s]{3,25})/i
  );
  if (matchPara) {
    descricao = matchPara[1].trim();
  } else if (t.includes('pix')) {
    descricao = tipo === 'Entrada' ? 'Pix Recebido' : 'Pix Enviado';
  } else if (forma === 'Cartão de Crédito') {
    descricao = 'Compra no Cartão';
  }

  return { valor, tipo, forma, categoria, descricao };
}

const Icone = ({ nome, name, tamanho = 18, cor = C.texto }) => (
  <Feather name={nome || name} size={tamanho} color={cor} />
);

function BandeiraView({ bandeira }) {
  if (bandeira === 'Mastercard') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#EB001B',
            marginRight: -6,
            opacity: 0.95,
          }}
        />
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#F79E1B',
            opacity: 0.95,
          }}
        />
      </View>
    );
  }
  if (bandeira == 'Visa') {
    return (
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: '900',
          fontStyle: 'italic',
          letterSpacing: 1,
        }}>
        VISA
      </Text>
    );
  }
  if (bandeira == 'Elo') {
    return (
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>
          elo
        </Text>
      </View>
    );
  }
  if (bandeira === 'American Express') {
    return (
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 5,
          paddingVertical: 2,
          borderRadius: 4,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '900' }}>
          AMEX
        </Text>
      </View>
    );
  }
  return (
    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
      {bandeira || 'CARD'}
    </Text>
  );
}

function CartaoFisicoView({
  cartao,
  ativo = false,
  largura = LARGURA_CARTAO,
  nomeUsuario = 'TITULAR',
  fatura = 0,
  ocultarValores = false,
}) {
  const bancoInfo =
    BANCOS_BRASIL.find(
      (b) => b.id === cartao.banco || b.nome === cartao.banco
    ) || BANCOS_BRASIL[0];
  const corBase = cartao.cor || bancoInfo.cor;
  const finalDigitos = String(cartao.final_cartao || '4821')
    .padStart(4, '0')
    .slice(-4);
  const nomeCartaoExibido = (cartao.nome || bancoInfo.nome).toUpperCase();

  return (
    <View
      style={[
        s.cartaoWallet,
        { width: largura, backgroundColor: corBase },
        ativo && s.cartaoWalletAtivo,
      ]}>
      <View pointerEvents="none" style={s.walletOrbeGrande} />
      <View pointerEvents="none" style={s.walletOrbePequeno} />

      {/* Topo: Chip EMV e Marca/Logo da Agência */}
      <View style={s.walletTopo}>
        <View style={s.walletChip}>
          <View style={s.walletChipLinha} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: '900',
                letterSpacing: 1.5,
              }}>
              {bancoInfo.sigla}
            </Text>
          </View>
          <Icone nome="wifi" tamanho={16} cor="#FFFFFF" />
        </View>
      </View>

      <View style={s.walletMeio}>
        <Text style={s.walletTipo}>
          CARTÃO DE CRÉDITO · {bancoInfo.nome.toUpperCase()}
        </Text>
        <Text style={s.walletNome} numberOfLines={1}>
          {nomeCartaoExibido}
        </Text>
        <Text style={s.walletNumero}>•••• •••• •••• {finalDigitos}</Text>
      </View>

      <View style={s.walletRodape}>
        <View>
          <Text style={s.walletLegenda}>FATURA ATUAL</Text>
          <Text style={s.walletValor}>
            {formatarValor(fatura, ocultarValores)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={[s.walletLegenda, { fontSize: 8 }]}>
            {String(nomeUsuario || 'TITULAR')
              .toUpperCase()
              .slice(0, 16)}
          </Text>
          <BandeiraView
            bandeira={cartao.bandeira || bancoInfo.bandeiraPadrao}
          />
        </View>
      </View>
    </View>
  );
}

function CartaoNumero({
  titulo,
  valor,
  icone,
  cor = C.texto,
  ocultar = false,
}) {
  return (
    <View style={s.cartaoNumero}>
      <View style={s.linhaCartaoNumero}>
        <View style={s.iconePequeno}>
          <Icone nome={icone} tamanho={14} cor={cor} />
        </View>
        <Text style={s.rotulo} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
      <Text
        style={[s.valorCartao, { color: cor }]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {formatarValor(valor, ocultar)}
      </Text>
    </View>
  );
}

function CabecalhoMes({ mes, mudar }) {
  const podeAvancar = mes < mesAtual();
  return (
    <View style={s.cabecalhoMes}>
      <TouchableOpacity style={s.setaMes} onPress={() => mudar(-1)}>
        <Icone nome="chevron-left" tamanho={18} cor={C.texto} />
      </TouchableOpacity>
      <View style={s.centroMes}>
        <Text style={s.nomeMesGrande}>{nomeDoMes(mes)}</Text>
        <Text style={s.dicaMes}>Deslize para trocar de mês</Text>
      </View>
      <TouchableOpacity
        style={[s.setaMes, !podeAvancar && { opacity: 0.25 }]}
        disabled={!podeAvancar}
        onPress={() => mudar(1)}>
        <Icone nome="chevron-right" tamanho={18} cor={C.texto} />
      </TouchableOpacity>
    </View>
  );
}

function ItemMovimentacao({ item, editar, excluir, ultimo, ocultar = false }) {
  const entrada = item.tipo === 'Entrada';
  const ehCartao = item.forma_pagamento === 'Cartão de Crédito';
  const ehDebito = item.forma_pagamento === 'Cartão de Débito';
  const ehPix = item.forma_pagamento === 'Pix';

  const tagInfo = ehCartao
    ? { icone: 'credit-card', texto: item.nome_cartao || 'Crédito' }
    : ehDebito
    ? { icone: 'credit-card', texto: 'Débito' }
    : ehPix
    ? { icone: 'zap', texto: 'Pix' }
    : { icone: 'dollar-sign', texto: 'Dinheiro' };

  return (
    <View style={[s.itemMov, ultimo && s.semBorda]}>
      <View style={s.iconeMov}>
        <Icone
          nome={
            entrada
              ? 'arrow-down-left'
              : ehCartao
              ? 'credit-card'
              : 'arrow-up-right'
          }
          tamanho={18}
          cor={entrada ? C.branco : C.textoSecundario}
        />
      </View>
      <View style={s.dadosMov}>
        <View style={s.linhaNome}>
          <Text style={s.nomeMov} numberOfLines={1}>
            {item.descricao}
          </Text>
          {item.recorrente_id ? (
            <Icone nome="repeat" tamanho={12} cor={C.cinza} />
          ) : null}
        </View>
        <Text style={s.detalheMov} numberOfLines={1}>
          {item.categoria} · {dataExibida(item.data)}
        </Text>
        <View style={s.tagLinha}>
          <Icone nome={tagInfo.icone} tamanho={10} cor={C.textoSecundario} />
          <Text style={s.tagPagamento} numberOfLines={1}>
            {tagInfo.texto}
          </Text>
        </View>
      </View>
      <View style={s.valorEAcoes}>
        <Text style={s.valorMov} numberOfLines={1}>
          {entrada ? '+ ' : '− '}
          {formatarValor(item.valor, ocultar)}
        </Text>
        <View style={s.acoes}>
          <TouchableOpacity
            onPress={() => editar(item)}
            style={s.botaoIcone}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icone nome="edit-2" tamanho={14} cor={C.textoSecundario} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => excluir(item)}
            style={s.botaoIcone}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icone nome="trash-2" tamanho={14} cor={C.textoSecundario} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function GraficoDonut({ dados, total, ocultar = false }) {
  const tamanho = 160;
  const espessura = 22;
  const raio = (tamanho - espessura) / 2;
  const circ = 2 * Math.PI * raio;
  const itens = dados.filter((x) => x.valor > 0);
  const soma = itens.reduce((a, x) => a + x.valor, 0);
  let deslocamento = 0;

  return (
    <View style={s.areaPizza}>
      <View style={s.graficoPizza}>
        <Svg width={tamanho} height={tamanho}>
          <Circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            stroke={C.cartao2}
            strokeWidth={espessura}
            fill="none"
          />
          <G rotation="-90" origin={`${tamanho / 2}, ${tamanho / 2}`}>
            {itens.map((item) => {
              const comprimento = soma > 0 ? (item.valor / soma) * circ : 0;
              const inicio = deslocamento;
              deslocamento += comprimento;
              return (
                <Circle
                  key={item.nome}
                  cx={tamanho / 2}
                  cy={tamanho / 2}
                  r={raio}
                  stroke={item.cor}
                  strokeWidth={espessura}
                  fill="none"
                  strokeDasharray={`${comprimento} ${circ}`}
                  strokeDashoffset={-inicio}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>
        <View style={s.centroPizza}>
          <Text style={s.totalPizza} numberOfLines={1} adjustsFontSizeToFit>
            {formatarValor(total, ocultar)}
          </Text>
          <Text style={s.centroLegenda}>TOTAL</Text>
        </View>
      </View>

      <View style={s.legendaPizza}>
        {itens.length > 0 ? (
          itens.map((item, i) => (
            <View
              key={item.nome}
              style={[
                s.itemLegendaPizza,
                i === itens.length - 1 && s.semBorda,
              ]}>
              <View style={s.nomeLegendaPizza}>
                <View style={[s.ponto, { backgroundColor: item.cor }]} />
                <Text style={s.textoLegendaPizza} numberOfLines={1}>
                  {item.nome}
                </Text>
              </View>
              <Text style={s.valorLegendaPizza}>
                {Math.round((item.valor / (soma || 1)) * 100)}% ·{' '}
                {formatarValor(item.valor, ocultar)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={s.textoVazio}>Nenhum registro para este mês.</Text>
        )}
      </View>
    </View>
  );
}

function GraficoMeses({ historico, selecionado, escolher }) {
  const maior = Math.max(
    1,
    ...historico.flatMap((x) => [x.entradas, x.saidas])
  );

  return (
    <View style={s.graficoSeis}>
      {historico.map((item) => (
        <TouchableOpacity
          key={item.chave}
          style={s.colunaMes}
          onPress={() => escolher(item.chave)}
          activeOpacity={0.8}>
          <View
            style={[
              s.barrasMes,
              { opacity: selecionado === item.chave ? 1 : 0.4 },
            ]}>
            {[
              ['entradas', C.branco],
              ['saidas', C.cinza],
            ].map(([campo, cor]) => (
              <View
                key={campo}
                style={[
                  s.barraMes,
                  {
                    height: Math.max(
                      item[campo] > 0 ? 6 : 2,
                      (item[campo] / maior) * 95
                    ),
                    backgroundColor: cor,
                  },
                ]}
              />
            ))}
          </View>
          <Text
            style={[
              s.rotuloMes,
              selecionado === item.chave && s.rotuloMesAtivo,
            ]}>
            {item.nome}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const FORM_MOV_INICIAL = {
  id: null,
  tipo: 'Saída',
  descricao: '',
  valor: '',
  categoria: SAIDAS[0],
  categoriaPersonalizada: '',
  forma_pagamento: 'Pix',
  cartao_id: null,
  parcelas: 1,
  data: '',
};

const FORM_CARTAO_INICIAL = {
  id: null,
  nome: '',
  banco: 'Nubank',
  bandeira: 'Mastercard',
  final_cartao: '',
  limite: '',
  dia_fechamento: '5',
  dia_vencimento: '15',
  cor: '#820AD1',
};

const FORM_META_INICIAL = {
  titulo: '',
  valor_alvo: '',
  valor_atual: '',
  data_limite: '',
  cor: '#18181B',
};

const FORM_RECORRENTE_INICIAL = {
  descricao: '',
  valor: '',
  tipo: 'Saída',
  categoria: 'Contas',
  forma_pagamento: 'Pix',
  cartao_id: null,
  dia_mes: '5',
};

const FORM_ORCAMENTO_INICIAL = {
  id: null,
  categoria: SAIDAS[0],
  limite_mensal: '',
};

const FORM_CONTA_INICIAL = {
  id: null,
  tipo: 'Pagar',
  descricao: '',
  valor: '',
  categoria: 'Contas',
  data_vencimento: '',
};

export default function App() {
  const [tela, setTela] = useState('Início');
  const [usuario, setUsuario] = useState(null);

  const [ocultarValores, setOcultarValores] = useState(false);

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  const [metas, setMetas] = useState([]);
  const [recorrentes, setRecorrentes] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [contas, setContas] = useState([]);

  const [mesSelecionado, setMesSelecionado] = useState(mesAtual());
  const [filtro, setFiltro] = useState('Todas');
  const [busca, setBusca] = useState('');

  const [modalMovAberto, setModalMovAberto] = useState(false);
  const [formMov, setFormMov] = useState(FORM_MOV_INICIAL);

  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [formCartao, setFormCartao] = useState(FORM_CARTAO_INICIAL);

  const [modalMetaAberto, setModalMetaAberto] = useState(false);
  const [formMeta, setFormMeta] = useState(FORM_META_INICIAL);

  const [modalAporteAberto, setModalAporteAberto] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState(null);
  const [valorAporte, setValorAporte] = useState('');

  const [modalAutoAberto, setModalAutoAberto] = useState(false);
  const [textoNotificacao, setTextoNotificacao] = useState('');

  const [modalRecorrenteAberto, setModalRecorrenteAberto] = useState(false);
  const [formRecorrente, setFormRecorrente] = useState(FORM_RECORRENTE_INICIAL);

  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);
  const [formOrcamento, setFormOrcamento] = useState(FORM_ORCAMENTO_INICIAL);

  const [modalContaAberto, setModalContaAberto] = useState(false);
  const [formConta, setFormConta] = useState(FORM_CONTA_INICIAL);

  const [modalExportarAberto, setModalExportarAberto] = useState(false);
  const [textoExportacao, setTextoExportacao] = useState('');

  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [novoNomePerfil, setNovoNomePerfil] = useState('');
  const [senhaAtualPerfil, setSenhaAtualPerfil] = useState('');
  const [novaSenhaPerfil, setNovaSenhaPerfil] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [verCadastro, setVerCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [nomeConta, setNomeConta] = useState('');
  const [mensagemAuth, setMensagemAuth] = useState('');

  const [menuNovoAberto, setMenuNovoAberto] = useState(false);
  const rolagemRef = useRef(null);
  const animTela = useRef(new Animated.Value(1)).current;
  const carteiraHomeRef = useRef(null);
  const carteiraAbaRef = useRef(null);

  const mesRef = useRef(mesSelecionado);
  mesRef.current = mesSelecionado;

  useEffect(() => {
    if (rolagemRef.current)
      rolagemRef.current.scrollTo({ y: 0, animated: false });
    animTela.setValue(0);
    Animated.timing(animTela, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [tela]);

  function abrirDoMenu(acao) {
    setMenuNovoAberto(false);
    setTimeout(acao, Platform.OS === 'ios' ? 360 : 60);
  }

  useEffect(() => {
    const indice = cartoes.findIndex(
      (cartao) => cartao.id === cartaoSelecionado
    );
    if (indice >= 0) {
      carteiraHomeRef.current?.scrollTo({
        x: indice * INTERVALO_CARTAO,
        animated: true,
      });
      carteiraAbaRef.current?.scrollTo({
        x: indice * INTERVALO_CARTAO,
        animated: true,
      });
    }
  }, [cartaoSelecionado, cartoes.length]);

  const deslizar = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 30 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < 50) return;
        const novo = somarMes(mesRef.current, g.dx < 0 ? 1 : -1);
        if (novo <= mesAtual()) {
          setMesSelecionado(novo);
          if (usuario && usuario.id) {
            banco.processarRecorrentes(usuario.id, novo).then(() => {
              carregarTodosDados(usuario.id);
            });
          }
        }
      },
    })
  ).current;

  function mudarMes(quantidade) {
    const novo = somarMes(mesSelecionado, quantidade);
    if (novo <= mesAtual()) {
      setMesSelecionado(novo);
      if (usuario && usuario.id) {
        banco.processarRecorrentes(usuario.id, novo).then(() => {
          carregarTodosDados(usuario.id);
        });
      }
    }
  }

  async function carregarTodosDados(usuarioId) {
    if (!usuarioId) {
      setMovimentacoes([]);
      setCartoes([]);
      setMetas([]);
      setRecorrentes([]);
      setOrcamentos([]);
      setContas([]);
      return;
    }
    try {
      await banco.processarRecorrentes(usuarioId, mesSelecionado);

      const [
        listaMov,
        listaCartoes,
        listaMetas,
        listaRec,
        listaContas,
        listaOrc,
      ] = await Promise.all([
        banco.listarMovimentacoes(usuarioId),
        banco.listarCartoes(usuarioId),
        banco.listarMetas(usuarioId),
        banco.listarRecorrentes(usuarioId),
        banco.listarContas(usuarioId),
        banco.listarOrcamentos(usuarioId, mesSelecionado),
      ]);
      setMovimentacoes(listaMov);
      setCartoes(listaCartoes);
      setMetas(listaMetas);
      setRecorrentes(listaRec);
      setContas(listaContas);
      setOrcamentos(listaOrc);

      if (listaCartoes.length > 0 && !cartaoSelecionado) {
        setCartaoSelecionado(listaCartoes[0].id);
      }
    } catch (e) {
      console.log('Erro ao carregar dados do banco:', e);
    }
  }

  useEffect(() => {
    async function restaurar() {
      try {
        const salvo = await banco.obterSessao();
        if (salvo && salvo.id) {
          setUsuario(salvo);
          await carregarTodosDados(salvo.id);
        }
      } catch (e) {
        setUsuario(null);
      }
    }
    restaurar();
  }, []);

  async function autenticar() {
    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = nomeConta.trim();

    if (!emailLimpo || !senha || (verCadastro && !nomeLimpo)) {
      setMensagemAuth(
        verCadastro
          ? 'Preencha seu nome, e-mail e senha.'
          : 'Digite seu e-mail e sua senha.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setMensagemAuth('Digite um e-mail válido (ex.: usuario@dominio.com).');
      return;
    }

    if (verCadastro) {
      if (senha.length < 8) {
        setMensagemAuth(
          'Sua senha precisa ter pelo menos 8 caracteres para proteção.'
        );
        return;
      }
      if (senha !== confirmarSenha) {
        setMensagemAuth(
          'As senhas não coincidem. Digite a mesma senha nos dois campos.'
        );
        return;
      }
    }

    try {
      let user;
      if (verCadastro) {
        user = await banco.cadastrarUsuario(nomeLimpo, emailLimpo, senha);
      } else {
        user = await banco.loginUsuario(emailLimpo, senha);
      }
      setUsuario(user);
      await carregarTodosDados(user.id);
      setSenha('');
      setConfirmarSenha('');
      setMostrarSenha(false);
      setMostrarConfirmarSenha(false);
      setMensagemAuth('');
    } catch (e) {
      setMensagemAuth(e.message || 'Erro ao realizar login.');
    }
  }

  async function sair() {
    try {
      await banco.encerrarSessao();
    } finally {
      setUsuario(null);
      setMovimentacoes([]);
      setCartoes([]);
      setMetas([]);
      setRecorrentes([]);
      setContas([]);
      setOrcamentos([]);
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      setNomeConta('');
      setMensagemAuth('');
      setTela('Início');
      setModalPerfilAberto(false);
    }
  }

  async function atualizarNomeUsuario() {
    if (!novoNomePerfil.trim()) {
      Alert.alert('Aviso', 'Digite seu novo nome.');
      return;
    }
    try {
      const res = await banco.alterarNome(usuario.id, novoNomePerfil.trim());
      setUsuario((u) => ({ ...u, nome: res.nome, nm_usuario: res.nome }));
      setNovoNomePerfil('');
      Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function alterarSenhaUsuario() {
    if (!senhaAtualPerfil || !novaSenhaPerfil) {
      Alert.alert('Aviso', 'Preencha a senha atual e a nova senha.');
      return;
    }
    if (novaSenhaPerfil.length < 8) {
      Alert.alert('Aviso', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenhaPerfil !== confirmarNovaSenha) {
      Alert.alert('Aviso', 'A confirmação de senha não confere.');
      return;
    }
    try {
      await banco.alterarSenha(usuario.id, senhaAtualPerfil, novaSenhaPerfil);
      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
      setSenhaAtualPerfil('');
      setNovaSenhaPerfil('');
      setConfirmarNovaSenha('');
      setModalPerfilAberto(false);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  function confirmarExclusaoConta() {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza absoluta? Todos os seus dados financeiros, cartões e lançamentos serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Minha Conta',
          style: 'destructive',
          onPress: async () => {
            await banco.excluirConta(usuario.id);
            sair();
          },
        },
      ]
    );
  }

  function abrirNovaMovimentacao(tipo, forma = 'Pix', cartaoId = null) {
    setFormMov({
      id: null,
      tipo,
      descricao: '',
      valor: '',
      categoria: tipo === 'Entrada' ? ENTRADAS[0] : SAIDAS[0],
      categoriaPersonalizada: '',
      forma_pagamento: forma,
      cartao_id: cartaoId || (cartoes.length > 0 ? cartoes[0].id : null),
      parcelas: 1,
      data: dataExibida(dataHoje()),
    });
    setModalMovAberto(true);
  }

  function abrirEdicaoMovimentacao(item) {
    const lista = item.tipo === 'Entrada' ? ENTRADAS : SAIDAS;
    const conhecida = lista.includes(item.categoria);
    setFormMov({
      id: item.id,
      tipo: item.tipo,
      descricao: item.descricao,
      valor: String(item.valor).replace('.', ','),
      categoria: conhecida ? item.categoria : 'Outros',
      categoriaPersonalizada: conhecida ? '' : item.categoria,
      forma_pagamento: item.forma_pagamento || 'Pix',
      cartao_id: item.cartao_id || null,
      parcelas: 1,
      data: dataExibida(item.data),
    });
    setModalMovAberto(true);
  }

  async function salvarMovimentacao() {
    try {
      const num = valorNumerico(formMov.valor);
      const resultadoData = validarEConverterData(
        formMov.data || dataExibida(dataHoje())
      );

      if (!formMov.descricao.trim()) {
        Alert.alert('Aviso', 'Digite a descrição da movimentação.');
        return;
      }
      if (!num || isNaN(num) || num <= 0) {
        Alert.alert('Aviso', 'Digite um valor válido maior que zero.');
        return;
      }
      if (!resultadoData.valido) {
        Alert.alert(
          'Data Inválida',
          'Por favor, digite uma data válida no formato DD/MM/AAAA (ex: 15/11/2026).'
        );
        return;
      }

      const categoriaFinal =
        formMov.categoria === 'Outros' && formMov.categoriaPersonalizada.trim()
          ? formMov.categoriaPersonalizada.trim()
          : formMov.categoria;

      const payload = {
        usuario_id: usuario.id,
        descricao: formMov.descricao.trim(),
        valor: Math.round(num * 100) / 100,
        tipo: formMov.tipo,
        categoria: categoriaFinal,
        forma_pagamento: formMov.forma_pagamento,
        cartao_id:
          formMov.forma_pagamento === 'Cartão de Crédito'
            ? formMov.cartao_id
            : null,
        data: resultadoData.iso,
      };

      if (formMov.id) {
        await banco.atualizarMovimentacao({ ...payload, id: formMov.id });
      } else if (
        formMov.forma_pagamento === 'Cartão de Crédito' &&
        Number(formMov.parcelas) > 1
      ) {
        await banco.adicionarMovimentacaoParcelada(payload, formMov.parcelas);
        Alert.alert(
          'Compra Parcelada',
          `Compra parcelada em ${formMov.parcelas}x de ${moeda(
            payload.valor / formMov.parcelas
          )} registrada com sucesso!`
        );
      } else {
        await banco.adicionarMovimentacao(payload);
      }

      await carregarTodosDados(usuario.id);
      setModalMovAberto(false);
      setMesSelecionado(resultadoData.iso.slice(0, 7));
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar o lançamento.');
    }
  }

  function excluirMovimentacao(item) {
    const confirmar = async () => {
      try {
        await banco.excluirMovimentacao(item.id, usuario.id);
        await carregarTodosDados(usuario.id);
      } catch (e) {
        Alert.alert('Erro', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${item.descricao}"?`)) confirmar();
    } else {
      Alert.alert('Excluir Registro', `Deseja excluir "${item.descricao}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar },
      ]);
    }
  }

  async function processarTextoNotificacao() {
    const dados = extrairDadosTextoBancario(textoNotificacao);
    if (!dados || !dados.valor || dados.valor <= 0) {
      Alert.alert(
        'Aviso',
        'Não foi possível identificar o valor no texto. Utilize um dos exemplos rápidos abaixo.'
      );
      return;
    }

    try {
      await banco.adicionarMovimentacao({
        usuario_id: usuario.id,
        descricao: dados.descricao,
        valor: dados.valor,
        tipo: dados.tipo,
        categoria: dados.categoria,
        forma_pagamento: dados.forma,
        cartao_id:
          dados.forma === 'Cartão de Crédito' && cartoes.length > 0
            ? cartoes[0].id
            : null,
        data: dataHoje(),
      });

      await carregarTodosDados(usuario.id);
      setModalAutoAberto(false);
      setTextoNotificacao('');
      Alert.alert(
        'Sucesso',
        `Movimentação de ${moeda(dados.valor)} (${
          dados.forma
        }) salva automaticamente!`
      );
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function salvarCartao() {
    try {
      const limiteNum = valorNumerico(formCartao.limite);
      if (!formCartao.nome.trim()) {
        Alert.alert('Aviso', 'Digite o nome do cartão.');
        return;
      }
      if (!limiteNum || limiteNum <= 0) {
        Alert.alert(
          'Aviso',
          'Digite um limite de crédito válido maior que zero.'
        );
        return;
      }
      const fechamento = Number(formCartao.dia_fechamento);
      const vencimento = Number(formCartao.dia_vencimento);
      if (!Number.isInteger(fechamento) || fechamento < 1 || fechamento > 31) {
        Alert.alert('Aviso', 'O dia de fechamento deve estar entre 1 e 31.');
        return;
      }
      if (!Number.isInteger(vencimento) || vencimento < 1 || vencimento > 31) {
        Alert.alert('Aviso', 'O dia de vencimento deve estar entre 1 e 31.');
        return;
      }

      const bancoEscolhido =
        BANCOS_BRASIL.find(
          (b) => b.id === formCartao.banco || b.nome === formCartao.banco
        ) || BANCOS_BRASIL[0];

      const dadosCartao = {
        id: formCartao.id,
        usuario_id: usuario.id,
        nome: formCartao.nome.trim(),
        banco: bancoEscolhido.nome,
        bandeira: formCartao.bandeira || bancoEscolhido.bandeiraPadrao,
        final_cartao:
          formCartao.final_cartao.replace(/\D/g, '').slice(0, 4) || '4821',
        limite: limiteNum,
        dia_fechamento: fechamento,
        dia_vencimento: vencimento,
        cor: formCartao.cor || bancoEscolhido.cor,
      };

      if (formCartao.id) {
        await banco.atualizarCartao(dadosCartao);
      } else {
        const novo = await banco.adicionarCartao(dadosCartao);
        setCartaoSelecionado(novo.id);
      }

      await carregarTodosDados(usuario.id);
      setModalCartaoAberto(false);
      setFormCartao(FORM_CARTAO_INICIAL);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  function editarCartao(cartao) {
    setFormCartao({
      id: cartao.id,
      nome: cartao.nome || '',
      banco: cartao.banco || 'Nubank',
      bandeira: cartao.bandeira || 'Mastercard',
      final_cartao: cartao.final_cartao || '',
      limite: String(cartao.limite || '').replace('.', ','),
      dia_fechamento: String(cartao.dia_fechamento || 5),
      dia_vencimento: String(cartao.dia_vencimento || 15),
      cor: cartao.cor || '#820AD1',
    });
    setModalCartaoAberto(true);
  }

  function excluirCartao(cartao) {
    const confirmar = async () => {
      await banco.excluirCartao(cartao.id, usuario.id);
      if (cartaoSelecionado === cartao.id) {
        const proximo = cartoes.find((item) => item.id !== cartao.id);
        setCartaoSelecionado(proximo ? proximo.id : null);
      }
      await carregarTodosDados(usuario.id);
    };

    Alert.alert(
      'Excluir Cartão',
      `Excluir o cartão "${cartao.nome}"? Suas compras permanecerão salvas sem o vínculo do cartão.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar },
      ]
    );
  }

  async function salvarMeta() {
    try {
      const alvo = valorNumerico(formMeta.valor_alvo);
      const atual = valorNumerico(formMeta.valor_atual) || 0;

      if (!formMeta.titulo.trim()) {
        Alert.alert('Aviso', 'Digite o título da sua meta.');
        return;
      }
      if (!alvo || alvo <= 0) {
        Alert.alert('Aviso', 'Digite um valor alvo maior que zero.');
        return;
      }

      let dataFinal = '';
      if (formMeta.data_limite) {
        const resData = validarEConverterData(formMeta.data_limite);
        if (resData.valido) dataFinal = resData.iso;
      }

      await banco.adicionarMeta({
        usuario_id: usuario.id,
        titulo: formMeta.titulo.trim(),
        valor_alvo: alvo,
        valor_atual: atual,
        data_limite: dataFinal,
        cor: formMeta.cor,
      });

      await carregarTodosDados(usuario.id);
      setModalMetaAberto(false);
      setFormMeta(FORM_META_INICIAL);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function realizarAporte() {
    try {
      const valor = valorNumerico(valorAporte);
      if (!valor || valor <= 0) {
        Alert.alert('Aviso', 'Digite um valor válido para guardar.');
        return;
      }
      const novoTotal = (metaSelecionada.valor_atual || 0) + valor;
      await banco.atualizarValorMeta(metaSelecionada.id, usuario.id, novoTotal);

      await banco.adicionarMovimentacao({
        usuario_id: usuario.id,
        descricao: `Aporte: ${metaSelecionada.titulo}`,
        valor: valor,
        tipo: 'Saída',
        categoria: 'Investimentos',
        forma_pagamento: 'Pix',
        data: dataHoje(),
      });

      await carregarTodosDados(usuario.id);
      setModalAporteAberto(false);
      setValorAporte('');
      setMetaSelecionada(null);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function salvarRecorrente() {
    try {
      const valor = valorNumerico(formRecorrente.valor);
      const dia = Number(formRecorrente.dia_mes);

      if (!formRecorrente.descricao.trim()) {
        Alert.alert('Aviso', 'Digite a descrição da conta automática.');
        return;
      }
      if (!valor || valor <= 0) {
        Alert.alert('Aviso', 'Digite um valor válido.');
        return;
      }
      if (!dia || dia < 1 || dia > 31) {
        Alert.alert('Aviso', 'Digite um dia válido entre 1 e 31.');
        return;
      }

      await banco.adicionarRecorrente({
        usuario_id: usuario.id,
        descricao: formRecorrente.descricao.trim(),
        valor,
        tipo: formRecorrente.tipo,
        categoria: formRecorrente.categoria,
        forma_pagamento: formRecorrente.forma_pagamento,
        cartao_id:
          formRecorrente.forma_pagamento === 'Cartão de Crédito'
            ? formRecorrente.cartao_id
            : null,
        dia_mes: dia,
      });

      await carregarTodosDados(usuario.id);
      setModalRecorrenteAberto(false);
      setFormRecorrente(FORM_RECORRENTE_INICIAL);
      Alert.alert('Sucesso', 'Conta automática cadastrada com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function salvarConta() {
    try {
      const valor = valorNumerico(formConta.valor);
      const resData = validarEConverterData(
        formConta.data_vencimento || dataExibida(dataHoje())
      );

      if (!formConta.descricao.trim()) {
        Alert.alert('Aviso', 'Digite a descrição da conta.');
        return;
      }
      if (!valor || valor <= 0) {
        Alert.alert('Aviso', 'Digite um valor válido.');
        return;
      }
      if (!resData.valido) {
        Alert.alert(
          'Data Inválida',
          'Digite uma data de vencimento válida no formato DD/MM/AAAA.'
        );
        return;
      }

      await banco.adicionarConta({
        usuario_id: usuario.id,
        descricao: formConta.descricao.trim(),
        valor,
        tipo: formConta.tipo,
        categoria: formConta.categoria,
        data_vencimento: resData.iso,
      });

      await carregarTodosDados(usuario.id);
      setModalContaAberto(false);
      setFormConta(FORM_CONTA_INICIAL);
      Alert.alert('Sucesso', 'Conta cadastrada com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function liquidarConta(itemConta) {
    Alert.alert(
      'Baixar Conta',
      `Deseja marcar "${itemConta.descricao}" de ${moeda(
        itemConta.valor
      )} como ${
        itemConta.tipo === 'Pagar' ? 'Paga' : 'Recebida'
      } e registrar a movimentação no extrato?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await banco.marcarContaComoPagaEGerarMovimentacao(
                itemConta.id,
                usuario.id,
                'Pix'
              );
              await carregarTodosDados(usuario.id);
              Alert.alert(
                'Sucesso',
                'Conta liquidada e registrada no extrato!'
              );
            } catch (e) {
              Alert.alert('Erro', e.message);
            }
          },
        },
      ]
    );
  }

  async function removerConta(itemConta) {
    Alert.alert('Excluir Conta', `Deseja excluir "${itemConta.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await banco.excluirConta(itemConta.id, usuario.id);
          await carregarTodosDados(usuario.id);
        },
      },
    ]);
  }

  async function salvarOrcamento() {
    try {
      const valor = valorNumerico(formOrcamento.limite_mensal);
      if (!valor || valor <= 0) {
        Alert.alert('Aviso', 'Digite um teto mensal válido.');
        return;
      }

      await banco.salvarOrcamento({
        usuario_id: usuario.id,
        categoria: formOrcamento.categoria,
        limite_mensal: valor,
        mes_ano: mesSelecionado,
      });

      await carregarTodosDados(usuario.id);
      setModalOrcamentoAberto(false);
      setFormOrcamento(FORM_ORCAMENTO_INICIAL);
      Alert.alert('Sucesso', 'Orçamento definido com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  async function removerOrcamento(itemOrc) {
    Alert.alert(
      'Excluir Orçamento',
      `Deseja remover o teto da categoria "${itemOrc.categoria}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await banco.excluirOrcamento(itemOrc.id, usuario.id);
            await carregarTodosDados(usuario.id);
          },
        },
      ]
    );
  }

  function gerarRelatorioExportacao() {
    const receitas = somar(doMes, 'Entrada');
    const despesas = somar(doMes, 'Saída');
    const saldo = receitas - despesas;
    const mesFormatado = nomeDoMes(mesSelecionado);

    let texto = `=====================================\n`;
    texto += `  NOVAX FINANCE · RELATÓRIO MENSAL\n`;
    texto += `  Usuário: ${usuario?.nome || 'Titular'}\n`;
    texto += `  Período: ${mesFormatado}\n`;
    texto += `=====================================\n\n`;
    texto += `RESUMO FINANCEIRO:\n`;
    texto += `(+) Total de Receitas: ${moeda(receitas)}\n`;
    texto += `(-) Total de Despesas: ${moeda(despesas)}\n`;
    texto += `(=) Saldo Líquido:     ${moeda(saldo)}\n\n`;
    texto += `-------------------------------------\n`;
    texto += `LANÇAMENTOS DO MÊS (${doMes.length} registros):\n`;
    texto += `-------------------------------------\n`;

    doMes.forEach((item, idx) => {
      const sinal = item.tipo === 'Entrada' ? '[+]' : '[-]';
      texto += `${idx + 1}. ${dataExibida(item.data)} | ${sinal} ${
        item.descricao
      } - ${moeda(item.valor)} (${item.categoria} / ${item.forma_pagamento})\n`;
    });

    texto += `\n=====================================\n`;
    texto += `Gerado pelo Novax Finance\n`;
    return texto;
  }

  function exportarRelatorio() {
    const texto = gerarRelatorioExportacao();
    setTextoExportacao(texto);
    setModalExportarAberto(true);
  }

  const ordenadas = useMemo(
    () =>
      [...movimentacoes].sort((a, b) => {
        if (a.data !== b.data)
          return (b.data || '').localeCompare(a.data || '');
        return Number(b.criada_em || 0) - Number(a.criada_em || 0);
      }),
    [movimentacoes]
  );

  const entradasTotal = somar(movimentacoes, 'Entrada');
  const saidasTotal = somar(movimentacoes, 'Saída');
  const saldoTotal = entradasTotal - saidasTotal;

  const doMes = useMemo(() => {
    return ordenadas.filter(
      (item) => item.data && item.data.startsWith(mesSelecionado)
    );
  }, [ordenadas, mesSelecionado]);

  const entradasMes = somar(doMes, 'Entrada');
  const saidasMes = somar(doMes, 'Saída');
  const saldoMes = entradasMes - saidasMes;

  const faturasCartoes = useMemo(() => {
    const mapa = {};
    cartoes.forEach((c) => {
      mapa[c.id] = 0;
    });

    doMes.forEach((m) => {
      if (
        m.tipo === 'Saída' &&
        m.cartao_id &&
        mapa[m.cartao_id] !== undefined
      ) {
        mapa[m.cartao_id] += Number(m.valor || 0);
      }
    });

    return mapa;
  }, [doMes, cartoes]);

  const historico = useMemo(() => {
    return [5, 4, 3, 2, 1, 0].map((i) => {
      const chave = somarMes(mesAtual(), -i);
      const itens = movimentacoes.filter((x) => x.data?.startsWith(chave));
      return {
        chave,
        nome: MESES[Number(chave.slice(5, 7)) - 1].slice(0, 3),
        entradas: somar(itens, 'Entrada'),
        saidas: somar(itens, 'Saída'),
      };
    });
  }, [movimentacoes]);

  function renderInicio() {
    const recentes = ordenadas.slice(0, 5);
    const chaveAtual = mesAtual();
    const siglaMesAtual = MESES[Number(chaveAtual.slice(5, 7)) - 1].slice(0, 3);
    const doMesAtual = movimentacoes.filter((x) =>
      x.data?.startsWith(chaveAtual)
    );
    const entradasAtual = somar(doMesAtual, 'Entrada');
    const saidasAtual = somar(doMesAtual, 'Saída');

    const cartaoAtivoObj =
      cartoes.find((c) => c.id === cartaoSelecionado) || cartoes[0];
    const faturaAtiva = cartaoAtivoObj
      ? faturasCartoes[cartaoAtivoObj.id] || 0
      : 0;
    const limiteAtivo = cartaoAtivoObj ? cartaoAtivoObj.limite : 0;
    const percLimiteAtivo =
      limiteAtivo > 0
        ? Math.min(100, Math.round((faturaAtiva / limiteAtivo) * 100))
        : 0;
    const disponivelAtivo = Math.max(0, limiteAtivo - faturaAtiva);

    return (
      <>
        <View style={[s.cartaoSaldo, saldoTotal < 0 && s.cartaoSaldoNegativo]}>
          <View style={s.linhaEntre}>
            <Text style={s.rotuloSaldo}>PATRIMÔNIO LÍQUIDO</Text>
            <TouchableOpacity
              style={s.iconeSaldo}
              onPress={() => setOcultarValores((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icone
                nome={ocultarValores ? 'eye-off' : 'eye'}
                tamanho={18}
                cor={C.texto}
              />
            </TouchableOpacity>
          </View>
          <Text style={s.valorSaldo} numberOfLines={1} adjustsFontSizeToFit>
            {formatarValor(saldoTotal, ocultarValores)}
          </Text>
          <Text style={s.ajudaSaldo}>
            Saldo consolidado de todas as contas e movimentações
          </Text>

          <View style={s.divisor} />

          <View style={s.resumoMes}>
            <View style={s.blocoResumo}>
              <View style={s.iconeResumo}>
                <Icone nome="arrow-down-left" tamanho={16} cor={C.branco} />
              </View>
              <View>
                <Text style={s.rotuloMiniClaro}>
                  RECEITAS ({siglaMesAtual})
                </Text>
                <Text style={s.valorMini}>
                  +{formatarValor(entradasAtual, ocultarValores)}
                </Text>
              </View>
            </View>
            <View style={s.blocoResumo}>
              <View style={s.iconeResumo}>
                <Icone
                  nome="arrow-up-right"
                  tamanho={16}
                  cor={C.textoSecundario}
                />
              </View>
              <View>
                <Text style={s.rotuloMiniClaro}>
                  DESPESAS ({siglaMesAtual})
                </Text>
                <Text style={s.valorMini}>
                  −{formatarValor(saidasAtual, ocultarValores)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        }<Text style={s.rotuloBloco}>REGISTRAR LANÇAMENTO</Text>
        <View style={s.botoesRapidos2}>
          <TouchableOpacity
            style={s.botaoRapido2}
            activeOpacity={0.7}
            onPress={() => abrirNovaMovimentacao('Saída', 'Pix')}>
            <View style={s.iconeRapido2}>
              <Icone nome="arrow-up-right" tamanho={22} cor={C.texto} />
            </View>
            <View>
              <Text style={s.textoRapido2Titulo}>Saída</Text>
              <Text style={s.textoRapido2Sub}>Despesa ou compra</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.botaoRapido2, s.botaoRapidoEntrada]}
            activeOpacity={0.7}
            onPress={() => abrirNovaMovimentacao('Entrada', 'Pix')}>
            <View style={s.iconeRapido2}>
              <Icone nome="arrow-down-left" tamanho={22} cor={C.branco} />
            </View>
            <View>
              <Text style={s.textoRapido2Titulo}>Entrada</Text>
              <Text style={s.textoRapido2Sub}>Receita ou salário</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* CARTEIRA DE CARTÕES ESTILO GOOGLE WALLET (COM ARRASTAR / DESLIZAR) */}
        <View style={s.carteiraHomeBox}>
          <View style={s.linhaEntre}>
            <View>
              <Text style={s.rotuloBloco}>SUA CARTEIRA DE CARTÕES</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setFormCartao(FORM_CARTAO_INICIAL);
                setModalCartaoAberto(true);
              }}>
              <Text style={s.link}>+ Novo Cartão</Text>
            </TouchableOpacity>
          </View>

          {cartoes.length > 0 ? (
            <>
              <ScrollView
                ref={carteiraHomeRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={INTERVALO_CARTAO}
                decelerationRate="fast"
                disableIntervalMomentum
                contentContainerStyle={s.carteiraLista}
                onMomentumScrollEnd={(event) => {
                  const x = event.nativeEvent.contentOffset.x;
                  const idx = Math.max(
                    0,
                    Math.min(
                      cartoes.length - 1,
                      Math.round(x / INTERVALO_CARTAO)
                    )
                  );
                  if (cartoes[idx]) setCartaoSelecionado(cartoes[idx].id);
                }}>
                {cartoes.map((cartao, index) => {
                  const ativo = cartaoSelecionado
                    ? cartaoSelecionado === cartao.id
                    : index === 0;
                  return (
                    <TouchableOpacity
                      key={cartao.id}
                      activeOpacity={0.9}
                      onPress={() => {
                        setCartaoSelecionado(cartao.id);
                        carteiraHomeRef.current?.scrollTo({
                          x: index * INTERVALO_CARTAO,
                          animated: true,
                        });
                      }}>
                      <CartaoFisicoView
                        cartao={cartao}
                        ativo={ativo}
                        largura={LARGURA_CARTAO}
                        nomeUsuario={usuario.nome}
                        fatura={faturasCartoes[cartao.id] || 0}
                        ocultarValores={ocultarValores}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Indicadores estilo Google Wallet */}
              <View style={s.walletIndicadores}>
                {cartoes.map((cartao) => (
                  <TouchableOpacity
                    key={cartao.id}
                    onPress={() => {
                      setCartaoSelecionado(cartao.id);
                      const idx = cartoes.findIndex(
                        (item) => item.id === cartao.id
                      );
                      carteiraHomeRef.current?.scrollTo({
                        x: idx * INTERVALO_CARTAO,
                        animated: true,
                      });
                    }}
                    style={[
                      s.walletPonto,
                      (cartaoSelecionado
                        ? cartaoSelecionado === cartao.id
                        : cartoes[0].id === cartao.id) && s.walletPontoAtivo,
                    ]}
                  />
                ))}
              </View>

              {/* Detalhe rápido do cartão em foco */}
              {cartaoAtivoObj && (
                <View style={s.secao}>
                  <View style={s.linhaEntre}>
                    <View>
                      <Text style={s.tituloSecao}>{cartaoAtivoObj.nome}</Text>
                      <Text style={s.subtituloSecao}>
                        {cartaoAtivoObj.banco} · Final ••••{' '}
                        {String(cartaoAtivoObj.final_cartao || '4821').slice(
                          -4
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={s.botaoIcone}
                      onPress={() => editarCartao(cartaoAtivoObj)}>
                      <Icone
                        nome="settings"
                        tamanho={16}
                        cor={C.textoSecundario}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={[s.walletResumoLinha, { marginTop: 14 }]}>
                    <View>
                      <Text style={s.rotuloMini}>FATURA ({siglaMesAtual})</Text>
                      <Text style={s.walletFaturaValor}>
                        {formatarValor(faturaAtiva, ocultarValores)}
                      </Text>
                    </View>
                    <View style={s.walletLimiteTexto}>
                      <Text style={s.rotuloMini}>LIMITE DISPONÍVEL</Text>
                      <Text style={s.walletDisponivel}>
                        {formatarValor(disponivelAtivo, ocultarValores)}
                      </Text>
                    </View>
                  </View>

                  <View style={s.barraProgressoLimite}>
                    <View
                      style={[
                        s.preenchimentoLimite,
                        { width: `${percLimiteAtivo}%` },
                      ]}
                    />
                  </View>

                  <View style={s.dadosRodapeCartao}>
                    <Text style={s.textoRodapeCartao}>
                      {percLimiteAtivo}% usado de{' '}
                      {formatarValor(limiteAtivo, ocultarValores)}
                    </Text>
                    <Text style={s.textoRodapeCartao}>
                      Fecha dia {cartaoAtivoObj.dia_fechamento} · Vence dia{' '}
                      {cartaoAtivoObj.dia_vencimento}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[s.botaoLogin, s.botaoLoginSuave]}
                    onPress={() =>
                      abrirNovaMovimentacao(
                        'Saída',
                        'Cartão de Crédito',
                        cartaoAtivoObj.id
                      )
                    }>
                    <Icone nome="plus" tamanho={16} cor={C.texto} />
                    <Text style={[s.textoBotaoLogin, s.textoBotaoLoginSuave]}>
                      Registrar compra neste cartão
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={s.secao}>
              <View style={s.vazio}>
                <View style={s.iconeVazio}>
                  <Icone nome="credit-card" tamanho={22} cor={C.branco} />
                </View>
                <Text style={s.textoVazioTitulo}>Nenhum cartão cadastrado</Text>
                <Text style={s.textoVazio}>
                  Cadastre seu Nubank, Inter, Itaú, Bradesco ou outro banco para
                  ver seus cartões aqui.
                </Text>
                <TouchableOpacity
                  style={[
                    s.botaoLogin,
                    { paddingHorizontal: 22, marginTop: 14 },
                  ]}
                  onPress={() => setModalCartaoAberto(true)}>
                  <Text style={s.textoBotaoLogin}>
                    + Adicionar primeiro cartão
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        {/* CONTAS A PAGAR & RECEBER */}
        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.tituloSecao}>Contas a Pagar & Receber</Text>
              <Text style={s.subtituloSecao}>
                Controle de vencimentos e pendências
              </Text>
            </View>
            <TouchableOpacity
              style={s.botaoAporte}
              onPress={() => {
                setFormConta({
                  id: null,
                  tipo: 'Pagar',
                  descricao: '',
                  valor: '',
                  categoria: 'Contas',
                  data_vencimento: dataExibida(dataHoje()),
                });
                setModalContaAberto(true);
              }}>
              <Icone nome="plus" tamanho={13} cor={C.preto} />
              <Text style={s.textoBotaoAporte}>Nova</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            {contas.length > 0 ? (
              contas.map((c) => {
                const ehPagar = c.tipo === 'Pagar';
                return (
                  <View key={c.id} style={s.itemConta}>
                    <View style={s.topoConta}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={s.nomeMov} numberOfLines={1}>
                          {c.descricao}
                        </Text>
                        <Text style={s.detalheMov}>
                          {c.categoria} · Vence em{' '}
                          {dataExibida(c.data_vencimento)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={s.valorMov}>
                          {formatarValor(c.valor, ocultarValores)}
                        </Text>
                        <View
                          style={[s.badgeConta, c.pago && s.badgeContaPaga]}>
                          <Text style={s.textoBadgeConta}>
                            {c.pago
                              ? 'PAGO ✓'
                              : ehPagar
                              ? 'A PAGAR'
                              : 'A RECEBER'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={s.rodapeConta}>
                      {!c.pago ? (
                        <TouchableOpacity
                          style={s.botaoPagarConta}
                          onPress={() => liquidarConta(c)}>
                          <Icone nome="check" tamanho={12} cor={C.preto} />
                          <Text style={s.textoBotaoPagarConta}>
                            {ehPagar
                              ? 'Marcar como Paga'
                              : 'Confirmar Recebimento'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text
                          style={{ fontSize: 11, color: C.textoSecundario }}>
                          Liquidado
                        </Text>
                      )}
                      <TouchableOpacity
                        style={s.botaoIcone}
                        onPress={() => removerConta(c)}>
                        <Icone
                          nome="trash-2"
                          tamanho={13}
                          cor={C.textoSecundario}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={s.textoVazio}>
                Nenhuma conta a pagar ou receber cadastrada.
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={s.bannerAuto}
          activeOpacity={0.8}
          onPress={() => setModalAutoAberto(true)}>
          <View style={s.iconeBanner}>
            <Icone nome="zap" tamanho={18} cor={C.branco} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.textoBannerTitulo}>Registro Inteligente</Text>
            <Text style={s.textoBannerSub}>
              Cole notificações bancárias ou comprovantes Pix para salvar
              sozinho.
            </Text>
          </View>
          <Icone nome="chevron-right" tamanho={18} cor={C.textoSecundario} />
        </TouchableOpacity>
        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <Text style={s.tituloSecao}>Últimas Movimentações</Text>
            <TouchableOpacity onPress={() => setTela('Extrato')}>
              <Text style={s.link}>Ver extrato</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 8 }}>
            {recentes.length ? (
              recentes.map((item, i) => (
                <ItemMovimentacao
                  key={item.id}
                  item={item}
                  editar={abrirEdicaoMovimentacao}
                  excluir={excluirMovimentacao}
                  ultimo={i === recentes.length - 1}
                  ocultar={ocultarValores}
                />
              ))
            ) : (
              <View style={s.vazio}>
                <View style={s.iconeVazio}>
                  <Icone nome="inbox" tamanho={22} cor={C.textoSecundario} />
                </View>
                <Text style={s.textoVazioTitulo}>Nenhum registro ainda</Text>
                <Text style={s.textoVazio}>
                  Toque nos botões Saída ou Entrada para registrar seus
                  lançamentos.
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.tituloSecao}>Contas Recorrentes</Text>
              <Text style={s.subtituloSecao}>
                Assinaturas e contas fixas automáticas
              </Text>
            </View>
            <TouchableOpacity
              style={s.botaoAporte}
              onPress={() => setModalRecorrenteAberto(true)}>
              <Icone nome="plus" tamanho={13} cor={C.preto} />
              <Text style={s.textoBotaoAporte}>Nova</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 8 }}>
            {recorrentes.length > 0 ? (
              recorrentes.map((rec, i) => (
                <View
                  key={rec.id}
                  style={[
                    s.linhaRecorrente,
                    i === recorrentes.length - 1 && s.semBorda,
                  ]}>
                  <View style={s.iconeRecorrente}>
                    <Icone
                      nome="repeat"
                      tamanho={16}
                      cor={
                        rec.tipo === 'Entrada' ? C.branco : C.textoSecundario
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.recDescricao}>{rec.descricao}</Text>
                    <Text style={s.recDetalhe}>
                      Todo dia {rec.dia_mes} · {rec.forma_pagamento}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.recValor}>
                      {rec.tipo === 'Entrada' ? '+ ' : '− '}
                      {formatarValor(rec.valor, ocultarValores)}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        await banco.excluirRecorrente(rec.id, usuario.id);
                        await carregarTodosDados(usuario.id);
                      }}>
                      <Text style={s.recRemover}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={s.textoVazio}>
                Nenhuma conta automática configurada.
              </Text>
            )}
          </View>
        </View>
      </>
    );
  }

  function renderExtrato() {
    const textoBusca = busca.trim().toLowerCase();
    const lista = doMes.filter((item) => {
      let formaCombina = true;
      if (filtro === 'Pix') formaCombina = item.forma_pagamento === 'Pix';
      else if (filtro === 'Dinheiro')
        formaCombina = item.forma_pagamento === 'Dinheiro';
      else if (filtro === 'Cartão')
        formaCombina = item.forma_pagamento.includes('Cartão');
      else if (filtro === 'Entrada') formaCombina = item.tipo === 'Entrada';
      else if (filtro === 'Saída') formaCombina = item.tipo === 'Saída';

      const textoItem = `${item.descricao} ${item.categoria} ${
        item.nome_cartao || ''
      } ${item.forma_pagamento}`.toLowerCase();
      const textoCombina = textoItem.includes(textoBusca);
      return formaCombina && textoCombina;
    });

    return (
      <>
        <View style={s.pesquisa}>
          <Icone nome="search" tamanho={16} cor={C.textoSecundario} />
          <TextInput
            style={s.inputPesquisa}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por descrição ou categoria..."
            placeholderTextColor={C.textoSecundario}
          />
          {!!busca && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Icone nome="x" tamanho={16} cor={C.textoSecundario} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtros}
          keyboardShouldPersistTaps="always">
          {[
            ['Todas', 'Todas'],
            ['Entrada', 'Receitas'],
            ['Saída', 'Despesas'],
            ['Pix', 'Pix'],
            ['Cartão', 'Cartões'],
            ['Dinheiro', 'Dinheiro'],
          ].map(([op, rotulo]) => (
            <TouchableOpacity
              key={op}
              onPress={() => setFiltro(op)}
              style={[s.filtro, filtro === op && s.filtroAtivo]}>
              <Text
                style={[s.textoFiltro, filtro === op && s.textoFiltroAtivo]}>
                {rotulo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.secao}>
          <CabecalhoMes mes={mesSelecionado} mudar={mudarMes} />
          <View style={s.gradeCartoesSemTopo}>
            <CartaoNumero
              titulo="Receitas do mês"
              valor={entradasMes}
              icone="trending-up"
              cor={C.branco}
              ocultar={ocultarValores}
            />
            <CartaoNumero
              titulo="Gastos do mês"
              valor={saidasMes}
              icone="trending-down"
              cor={C.textoSecundario}
              ocultar={ocultarValores}
            />
          </View>
          <View style={[s.linhaRelatorio, s.semBorda]}>
            <Text style={s.rotuloRelatorio}>
              Resultado Líquido ({nomeDoMes(mesSelecionado)})
            </Text>
            <Text style={s.valorRelatorio}>
              {formatarValor(saldoMes, ocultarValores)}
            </Text>
          </View>
        </View>

        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.tituloSecao}>Orçamentos do Mês</Text>
              <Text style={s.subtituloSecao}>
                Teto de gastos planejado por categoria
              </Text>
            </View>
            <TouchableOpacity
              style={s.botaoAporte}
              onPress={() => {
                setFormOrcamento(FORM_ORCAMENTO_INICIAL);
                setModalOrcamentoAberto(true);
              }}>
              <Icone nome="plus" tamanho={13} cor={C.preto} />
              <Text style={s.textoBotaoAporte}>Definir Teto</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            {orcamentos.length > 0 ? (
              orcamentos.map((orc) => {
                const totalGastoCat = doMes
                  .filter(
                    (m) => m.tipo === 'Saída' && m.categoria === orc.categoria
                  )
                  .reduce((acc, m) => acc + Number(m.valor || 0), 0);
                const perc =
                  orc.limite_mensal > 0
                    ? Math.round((totalGastoCat / orc.limite_mensal) * 100)
                    : 0;
                const excedido = totalGastoCat > orc.limite_mensal;

                return (
                  <View key={orc.id} style={s.itemOrcamento}>
                    <View style={s.topoOrcamento}>
                      <Text style={s.categoriaOrcamento}>{orc.categoria}</Text>
                      <TouchableOpacity onPress={() => removerOrcamento(orc)}>
                        <Icone
                          nome="trash-2"
                          tamanho={13}
                          cor={C.textoSecundario}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={s.barraProgressoOrcamento}>
                      <View
                        style={[
                          s.preenchimentoOrcamento,
                          excedido && s.preenchimentoOrcamentoExcedido,
                          { width: `${Math.min(100, perc)}%` },
                        ]}
                      />
                    </View>
                    <View style={s.rodapeOrcamento}>
                      <Text style={s.valoresOrcamento}>
                        Gasto: {formatarValor(totalGastoCat, ocultarValores)} de{' '}
                        {formatarValor(orc.limite_mensal, ocultarValores)} (
                        {perc}%)
                      </Text>
                      {excedido && (
                        <Text
                          style={{
                            fontSize: 10,
                            color: '#E5484D',
                            fontWeight: '800',
                          }}>
                          Excedido em{' '}
                          {formatarValor(
                            totalGastoCat - orc.limite_mensal,
                            ocultarValores
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={s.textoVazio}>
                Nenhum teto de gastos definido para este mês.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={s.botaoExportar}
            activeOpacity={0.8}
            onPress={exportarRelatorio}>
            <Icone nome="download" tamanho={16} cor={C.texto} />
            <Text style={s.textoBotaoExportar}>
              Exportar Relatório deste Mês
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <Text style={s.tituloSecao}>Lançamentos</Text>
            <Text style={s.contagem}>{lista.length} registro(s)</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            {lista.length ? (
              lista.map((item, i) => (
                <View key={item.id}>
                  {(i === 0 || lista[i - 1].data !== item.data) && (
                    <Text style={s.cabecalhoDia}>{dataExibida(item.data)}</Text>
                  )}
                  <ItemMovimentacao
                    item={item}
                    editar={abrirEdicaoMovimentacao}
                    excluir={excluirMovimentacao}
                    ultimo={i === lista.length - 1}
                    ocultar={ocultarValores}
                  />
                </View>
              ))
            ) : (
              <View style={s.vazio}>
                <Text style={s.textoVazioTitulo}>
                  Nenhum registro encontrado
                </Text>
                <Text style={s.textoVazio}>
                  Altere o mês ou utilize os botões para cadastrar.
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  }

  function renderCartoes() {
    const atual = cartoes.find((c) => c.id === cartaoSelecionado) || cartoes[0];
    const fatura = atual ? faturasCartoes[atual.id] || 0 : 0;
    const percentual = atual
      ? Math.min(100, Math.round((fatura / (atual.limite || 1)) * 100))
      : 0;
    const compras = atual ? doMes.filter((m) => m.cartao_id === atual.id) : [];

    return (
      <>
        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <View>
              <Text style={s.tituloSecao}>Sua Carteira</Text>
              <Text style={s.subtituloSecao}>
                Deslize e alterne entre seus cartões
              </Text>
            </View>
            <TouchableOpacity
              style={s.botaoAporte}
              onPress={() => {
                setFormCartao(FORM_CARTAO_INICIAL);
                setModalCartaoAberto(true);
              }}>
              <Icone nome="plus" tamanho={14} cor={C.preto} />
              <Text style={s.textoBotaoAporte}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {cartoes.length > 0 ? (
          <>
            <ScrollView
              ref={carteiraAbaRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={INTERVALO_CARTAO}
              decelerationRate="fast"
              disableIntervalMomentum
              contentContainerStyle={s.carteiraLista}
              onMomentumScrollEnd={(event) => {
                const deslocamento = event.nativeEvent.contentOffset.x;
                const indice = Math.max(
                  0,
                  Math.min(
                    cartoes.length - 1,
                    Math.round(deslocamento / INTERVALO_CARTAO)
                  )
                );
                if (cartoes[indice]) setCartaoSelecionado(cartoes[indice].id);
              }}>
              {cartoes.map((cartao, index) => {
                const ativo = atual && atual.id === cartao.id;
                return (
                  <TouchableOpacity
                    key={cartao.id}
                    activeOpacity={0.9}
                    onPress={() => {
                      setCartaoSelecionado(cartao.id);
                      carteiraAbaRef.current?.scrollTo({
                        x: index * INTERVALO_CARTAO,
                        animated: true,
                      });
                    }}>
                    <CartaoFisicoView
                      cartao={cartao}
                      ativo={ativo}
                      largura={LARGURA_CARTAO}
                      nomeUsuario={usuario.nome}
                      fatura={faturasCartoes[cartao.id] || 0}
                      ocultarValores={ocultarValores}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={s.walletIndicadores}>
              {cartoes.map((cartao) => (
                <TouchableOpacity
                  key={cartao.id}
                  onPress={() => {
                    setCartaoSelecionado(cartao.id);
                    const indice = cartoes.findIndex(
                      (item) => item.id === cartao.id
                    );
                    carteiraAbaRef.current?.scrollTo({
                      x: indice * INTERVALO_CARTAO,
                      animated: true,
                    });
                  }}
                  style={[
                    s.walletPonto,
                    atual && atual.id === cartao.id && s.walletPontoAtivo,
                  ]}
                />
              ))}
            </View>

            {atual && (
              <View style={s.secao}>
                <View style={s.walletDetalheTopo}>
                  <View>
                    <Text style={s.tituloSecao}>{atual.nome}</Text>
                    <Text style={s.subtituloSecao}>
                      {atual.banco} · {atual.bandeira}
                    </Text>
                  </View>
                  <View style={s.walletAcoes}>
                    <TouchableOpacity
                      style={s.walletAcao}
                      onPress={() => editarCartao(atual)}>
                      <Icone nome="edit-2" tamanho={16} cor={C.texto} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.walletAcao}
                      onPress={() => excluirCartao(atual)}>
                      <Icone
                        nome="trash-2"
                        tamanho={16}
                        cor={C.textoSecundario}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.walletResumo}>
                  <View style={s.walletResumoLinha}>
                    <View>
                      <Text style={s.rotuloMini}>
                        FATURA DE {nomeDoMes(mesSelecionado).toUpperCase()}
                      </Text>
                      <Text style={s.walletFaturaValor}>
                        {formatarValor(fatura, ocultarValores)}
                      </Text>
                    </View>
                    <View style={s.walletLimiteTexto}>
                      <Text style={s.rotuloMini}>LIMITE DISPONÍVEL</Text>
                      <Text style={s.walletDisponivel}>
                        {formatarValor(
                          Math.max(0, atual.limite - fatura),
                          ocultarValores
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={s.barraProgressoLimite}>
                    <View
                      style={[
                        s.preenchimentoLimite,
                        { width: `${percentual}%` },
                      ]}
                    />
                  </View>
                  <View style={s.dadosRodapeCartao}>
                    <Text style={s.textoRodapeCartao}>
                      {percentual}% utilizado
                    </Text>
                    <Text style={s.textoRodapeCartao}>
                      Limite: {formatarValor(atual.limite, ocultarValores)}
                    </Text>
                  </View>
                  <View style={[s.dadosRodapeCartao, { marginTop: 12 }]}>
                    <Text style={s.textoRodapeCartao}>
                      Fecha dia {atual.dia_fechamento}
                    </Text>
                    <Text style={s.textoRodapeCartao}>
                      Vence dia {atual.dia_vencimento}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.botaoLogin, s.botaoLoginSuave]}
                  onPress={() =>
                    abrirNovaMovimentacao(
                      'Saída',
                      'Cartão de Crédito',
                      atual.id
                    )
                  }>
                  <Icone nome="plus" tamanho={16} cor={C.texto} />
                  <Text style={[s.textoBotaoLogin, s.textoBotaoLoginSuave]}>
                    Registrar compra neste cartão
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 20 }}>
                  <Text style={s.rotuloMini}>
                    COMPRAS NO MÊS ({compras.length})
                  </Text>
                  {compras.length ? (
                    compras.map((item, index) => (
                      <ItemMovimentacao
                        key={item.id}
                        item={item}
                        editar={abrirEdicaoMovimentacao}
                        excluir={excluirMovimentacao}
                        ultimo={index === compras.length - 1}
                        ocultar={ocultarValores}
                      />
                    ))
                  ) : (
                    <Text
                      style={[
                        s.textoVazio,
                        { textAlign: 'left', marginTop: 8 },
                      ]}>
                      Nenhuma compra registrada neste cartão neste mês.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={s.secao}>
            <View style={s.vazio}>
              <View style={s.iconeVazio}>
                <Icone
                  nome="credit-card"
                  tamanho={22}
                  cor={C.textoSecundario}
                />
              </View>
              <Text style={s.textoVazioTitulo}>Sua carteira está vazia</Text>
              <Text style={s.textoVazio}>
                Adicione um cartão para acompanhar limites, faturas e compras.
              </Text>
              <TouchableOpacity
                style={[s.botaoLogin, { paddingHorizontal: 20, marginTop: 16 }]}
                onPress={() => setModalCartaoAberto(true)}>
                <Text style={s.textoBotaoLogin}>Adicionar primeiro cartão</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  }

  function renderMetas() {
    const totalAlvos = metas.reduce((acc, m) => acc + (m.valor_alvo || 0), 0);
    const totalGuardado = metas.reduce(
      (acc, m) => acc + (m.valor_atual || 0),
      0
    );
    const percGeral =
      totalAlvos > 0 ? Math.round((totalGuardado / totalAlvos) * 100) : 0;

    return (
      <>
        <View style={s.cartaoSaldo}>
          <View style={s.linhaEntre}>
            <Text style={s.rotuloSaldo}>TOTAL POUPADO EM METAS</Text>
            <View style={s.iconeSaldo}>
              <Icone nome="target" tamanho={18} cor={C.texto} />
            </View>
          </View>
          <Text style={s.valorSaldo}>
            {formatarValor(totalGuardado, ocultarValores)}
          </Text>
          <Text style={s.ajudaSaldo}>
            De um total planejado de {formatarValor(totalAlvos, ocultarValores)}
          </Text>

          <View
            style={[
              s.barraProgressoLimite,
              s.barraProgressoClara,
              { marginTop: 16 },
            ]}>
            <View
              style={[
                s.preenchimentoLimite,
                s.preenchimentoClaro,
                { width: `${Math.min(100, percGeral)}%` },
              ]}
            />
          </View>

          <View style={s.linhaEntre}>
            <Text style={s.textoRodapeCartaoClaro}>
              {percGeral}% concluído no geral
            </Text>
            <TouchableOpacity
              style={[s.botaoAporte, s.botaoAporteClaro]}
              onPress={() => setModalMetaAberto(true)}>
              <Icone nome="plus" tamanho={13} cor={C.preto} />
              <Text style={[s.textoBotaoAporte, s.textoBotaoAporteClaro]}>
                Nova Meta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.secao}>
          <Text style={s.tituloSecao}>Seus Objetivos Financeiros</Text>
          <Text style={s.subtituloSecao}>
            Acompanhe o progresso e faça aportes regulares
          </Text>

          <View style={{ marginTop: 14 }}>
            {metas.length > 0 ? (
              metas.map((m) => {
                const pct = Math.min(
                  100,
                  Math.round(((m.valor_atual || 0) / m.valor_alvo) * 100)
                );
                const restante = Math.max(
                  0,
                  m.valor_alvo - (m.valor_atual || 0)
                );

                return (
                  <View key={m.id} style={s.itemMeta}>
                    <View style={s.metaTopo}>
                      <View style={s.metaTituloLinha}>
                        <View style={s.iconeMeta}>
                          <Icone nome="target" tamanho={16} cor={C.branco} />
                        </View>
                        <Text style={s.metaTitulo} numberOfLines={1}>
                          {m.titulo}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Excluir Meta',
                            `Deseja excluir "${m.titulo}"?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Excluir',
                                style: 'destructive',
                                onPress: async () => {
                                  await banco.excluirMeta(m.id, usuario.id);
                                  await carregarTodosDados(usuario.id);
                                },
                              },
                            ]
                          );
                        }}>
                        <Icone
                          nome="trash-2"
                          tamanho={14}
                          cor={C.textoSecundario}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={s.metaPrazo}>
                      {m.data_limite
                        ? `Prazo até ${dataExibida(m.data_limite)}`
                        : 'Sem data limite'}
                    </Text>

                    <View style={s.metaValores}>
                      <Text style={s.metaValorAtual}>
                        {formatarValor(m.valor_atual, ocultarValores)}
                      </Text>
                      <Text style={s.metaValorAlvo}>
                        Meta: {formatarValor(m.valor_alvo, ocultarValores)}
                      </Text>
                    </View>

                    <View style={s.barraMetaFundo}>
                      <View
                        style={[s.barraMetaProgresso, { width: `${pct}%` }]}
                      />
                    </View>

                    <View style={s.metaAcoes}>
                      <Text style={s.metaPorcentagem}>
                        {pct}% (
                        {restante === 0
                          ? 'Concluída! 🎉'
                          : `Faltam ${formatarValor(restante, ocultarValores)}`}
                        )
                      </Text>
                      <TouchableOpacity
                        style={s.botaoAporte}
                        onPress={() => {
                          setMetaSelecionada(m);
                          setModalAporteAberto(true);
                        }}>
                        <Icone nome="plus" tamanho={12} cor={C.preto} />
                        <Text style={s.textoBotaoAporte}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={s.vazio}>
                <View style={s.iconeVazio}>
                  <Icone nome="target" tamanho={22} cor={C.textoSecundario} />
                </View>
                <Text style={s.textoVazioTitulo}>Nenhuma meta cadastrada</Text>
                <Text style={s.textoVazio}>
                  Crie metas como reserva de emergência, viagem ou aquisições.
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  }

  function renderGraficos() {
    const categoriasGastos = agruparCategorias(doMes, 'Saída');
    const categoriasEntradas = agruparCategorias(doMes, 'Entrada');
    const taxaPoupanca =
      entradasMes > 0
        ? Math.max(
            0,
            Math.round(((entradasMes - saidasMes) / entradasMes) * 100)
          )
        : 0;

    return (
      <>
        <View style={s.secao}>
          <CabecalhoMes mes={mesSelecionado} mudar={mudarMes} />
          <View style={s.gradeCartoesSemTopo}>
            <CartaoNumero
              titulo="Entradas"
              valor={entradasMes}
              icone="arrow-down-left"
              cor={C.branco}
              ocultar={ocultarValores}
            />
            <CartaoNumero
              titulo="Gastos"
              valor={saidasMes}
              icone="arrow-up-right"
              cor={C.textoSecundario}
              ocultar={ocultarValores}
            />
          </View>
        </View>

        {/* Diagnóstico Financeiro */}
        <View style={s.secao}>
          <Text style={s.tituloSecao}>Saúde Financeira do Mês</Text>
          <View style={[s.linhaRelatorio, { marginTop: 8 }]}>
            <Text style={s.rotuloRelatorio}>Balanço</Text>
            <Text style={s.valorRelatorio}>
              {saldoMes >= 0 ? 'Superávit (Positivo) ↑' : 'Déficit (Atenção) ↓'}
            </Text>
          </View>
          <View style={s.linhaRelatorio}>
            <Text style={s.rotuloRelatorio}>Taxa de Poupança</Text>
            <Text style={s.valorRelatorio}>{taxaPoupanca}%</Text>
          </View>
          <View style={[s.linhaRelatorio, s.semBorda]}>
            <Text style={s.rotuloRelatorio}>Resultado Líquido</Text>
            <Text style={s.valorRelatorio}>
              {formatarValor(saldoMes, ocultarValores)}
            </Text>
          </View>

          <TouchableOpacity
            style={s.botaoExportar}
            activeOpacity={0.8}
            onPress={exportarRelatorio}>
            <Icone nome="download" tamanho={16} cor={C.texto} />
            <Text style={s.textoBotaoExportar}>
              Exportar Relatório Detalhado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gráfico Donut de Despesas por Categoria */}
        <View style={s.secao}>
          <Text style={s.tituloSecao}>Distribuição dos Gastos</Text>
          <Text style={s.textoAuxiliar}>
            Onde seu dinheiro foi gasto em {nomeDoMes(mesSelecionado)}
          </Text>
          <GraficoDonut
            dados={categoriasGastos}
            total={saidasMes}
            ocultar={ocultarValores}
          />
        </View>

        {/* Gráfico de Barras dos 6 Meses */}
        <View style={s.secao}>
          <View style={s.linhaEntre}>
            <View style={{ flex: 1 }}>
              <Text style={s.tituloSecao}>Histórico dos Últimos 6 Meses</Text>
              <Text style={s.textoAuxiliar}>
                Comparativo de receitas e despesas
              </Text>
            </View>
            <View style={s.legendaMini}>
              <View style={s.linhaMini}>
                <View style={[s.ponto, { backgroundColor: C.branco }]} />
                <Text style={s.textoMini}>Receitas</Text>
              </View>
              <View style={s.linhaMini}>
                <View style={[s.ponto, { backgroundColor: C.cinza }]} />
                <Text style={s.textoMini}>Gastos</Text>
              </View>
            </View>
          </View>
          <GraficoMeses
            historico={historico}
            selecionado={mesSelecionado}
            escolher={setMesSelecionado}
          />
        </View>

        <View style={s.secao}>
          <Text style={s.tituloSecao}>Fontes de Renda</Text>
          <Text style={s.textoAuxiliar}>
            Origem das receitas em {nomeDoMes(mesSelecionado)}
          </Text>
          <GraficoDonut
            dados={categoriasEntradas}
            total={entradasMes}
            ocultar={ocultarValores}
          />
        </View>
      </>
    );
  }

  if (!usuario) {
    const forca = calcularForcaSenha(senha);

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: C.fundo }]}>
        <StatusBar barStyle="light-content" backgroundColor={C.fundo} />
        <KeyboardAvoidingView
          style={s.loginArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={s.loginConteudo}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}>
            <View style={s.loginMarca}>
              <View style={s.loginLogo}>
                <Image source={require('./assets/logo.png')} style={{ width: 68, height: 68 }} resizeMode="contain" />
              </View>
              <Text style={s.loginNome}>NOVAX</Text>
              <Text style={s.loginNomeClaro}>FINANCE</Text>
              <Text style={s.loginFrase}>
                Gestão financeira de alta precisão e segurança.
              </Text>
            </View>

            <View style={s.cartaoLogin}>
              <View style={s.abas}>
                {[
                  ['Entrar', false],
                  ['Criar conta', true],
                ].map(([nome, cadastro]) => (
                  <TouchableOpacity
                    key={nome}
                    style={[s.aba, verCadastro === cadastro && s.abaAtiva]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setVerCadastro(cadastro);
                      setMensagemAuth('');
                    }}>
                    <Text
                      style={[
                        s.textoAba,
                        verCadastro === cadastro && s.textoAbaAtiva,
                      ]}>
                      {nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {verCadastro && (
                <View style={s.campoLogin}>
                  <Icone nome="user" cor={C.textoSecundario} />
                  <TextInput
                    style={s.inputLogin}
                    value={nomeConta}
                    onChangeText={setNomeConta}
                    placeholder="Seu nome completo"
                    placeholderTextColor={C.textoSecundario}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={s.campoLogin}>
                <Icone nome="mail" cor={C.textoSecundario} />
                <TextInput
                  style={s.inputLogin}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Seu e-mail"
                  placeholderTextColor={C.textoSecundario}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={s.campoLogin}>
                <Icone nome="lock" cor={C.textoSecundario} />
                <TextInput
                  style={s.inputLogin}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder={
                    verCadastro
                      ? 'Crie uma senha (mínimo 8 dígitos)'
                      : 'Sua senha'
                  }
                  placeholderTextColor={C.textoSecundario}
                  secureTextEntry={!mostrarSenha}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icone
                    nome={mostrarSenha ? 'eye-off' : 'eye'}
                    cor={C.textoSecundario}
                    tamanho={18}
                  />
                </TouchableOpacity>
              </View>

              {/* MEDIDOR DE FORÇA DA SENHA */}
              {verCadastro && senha.length > 0 && (
                <View style={s.forcaSenhaContainer}>
                  <View style={s.forcaSenhaBarraFundo}>
                    <View
                      style={[
                        s.forcaSenhaBarra,
                        {
                          width: forca.largura,
                          backgroundColor: forca.cor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.forcaSenhaTexto, { color: forca.cor }]}>
                    {forca.nivel}
                  </Text>
                </View>
              )}

              {verCadastro && (
                <View style={s.campoLogin}>
                  <Icone nome="check-circle" cor={C.textoSecundario} />
                  <TextInput
                    style={s.inputLogin}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={C.textoSecundario}
                    secureTextEntry={!mostrarConfirmarSenha}
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarConfirmarSenha((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icone
                      nome={mostrarConfirmarSenha ? 'eye-off' : 'eye'}
                      cor={C.textoSecundario}
                      tamanho={18}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {!!mensagemAuth && (
                <View style={s.caixaErro}>
                  <Icone nome="alert-circle" tamanho={16} cor={C.texto} />
                  <Text style={s.textoErro}>{mensagemAuth}</Text>
                </View>
              )}

              <TouchableOpacity
                style={s.botaoLogin}
                activeOpacity={0.8}
                onPress={autenticar}>
                <Text style={s.textoBotaoLogin}>
                  {verCadastro ? 'Criar minha conta' : 'Acessar Conta'}
                </Text>
                <Icone nome="arrow-right" cor={C.preto} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const subtitulos = {
    Início: 'Visão geral do seu patrimônio e finanças.',
    Extrato: 'Consulte, filtre ou edite suas movimentações.',
    Cartões: 'Controle de limites e faturas de cartão de crédito.',
    Metas: 'Acompanhe seus objetivos e reserve recursos.',
    Gráficos: 'Análise visual detalhada dos seus gastos.',
  };

  const categoriasDisponiveis = formMov.tipo === 'Entrada' ? ENTRADAS : SAIDAS;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.cartao} />
      <View style={s.topoVerde} />

      {/* CABEÇALHO MONOCROMÁTICO */}
      <View style={s.cabecalho}>
        <TouchableOpacity
          style={s.avatar}
          activeOpacity={0.8}
          onPress={() => {
            setNovoNomePerfil(usuario.nome);
            setModalPerfilAberto(true);
          }}>
          <Text style={s.avatarTexto}>
            {usuario.nome.trim().charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
        <View style={s.marca}>
          <Text style={s.subMarca}>Bem-vindo,</Text>
          <Text style={s.nomeApp} numberOfLines={1}>
            {usuario.nome}
          </Text>
        </View>
        <View style={s.acoesCabecalho}>
          <TouchableOpacity
            style={s.botaoIconeCabecalho}
            onPress={() => setOcultarValores((v) => !v)}
            accessibilityLabel="Ocultar valores">
            <Icone
              nome={ocultarValores ? 'eye-off' : 'eye'}
              tamanho={17}
              cor={C.texto}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.botaoIconeCabecalho}
            onPress={() => {
              setNovoNomePerfil(usuario.nome);
              setModalPerfilAberto(true);
            }}
            accessibilityLabel="Perfil">
            <Icone nome="user" tamanho={17} cor={C.texto} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.botaoSair}
            onPress={sair}
            accessibilityLabel="Sair">
            <Icone nome="log-out" tamanho={17} cor={C.texto} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={rolagemRef}
        style={s.conteudo}
        contentContainerStyle={s.conteudoInterno}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            minHeight: 460,
            opacity: animTela,
            transform: [
              {
                translateY: animTela.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
          {...(tela === 'Início' || tela === 'Metas'
            ? {}
            : deslizar.panHandlers)}>
          <View style={s.introducao}>
            <Text style={s.tituloPagina}>{tela}</Text>
            <Text style={s.subtituloPagina}>{subtitulos[tela]}</Text>
          </View>

          {tela === 'Início' && renderInicio()}
          {tela === 'Extrato' && renderExtrato()}
          {tela === 'Cartões' && renderCartoes()}
          {tela === 'Metas' && renderMetas()}
          {tela === 'Gráficos' && renderGraficos()}
        </Animated.View>
      </ScrollView>

      <View style={s.navegacao}>
        {[
          ['Início', 'home'],
          ['Extrato', 'list'],
          ['Cartões', 'credit-card'],
          ['Metas', 'target'],
          ['Gráficos', 'pie-chart'],
        ].map(([nome, ic]) => (
          <TouchableOpacity
            key={nome}
            style={s.itemNavegacao}
            activeOpacity={0.7}
            onPress={() => setTela(nome)}>
            <View
              style={[
                s.iconeNavegacao,
                tela === nome && s.iconeNavegacaoAtivo,
              ]}>
              <Icone
                nome={ic}
                tamanho={20}
                cor={tela === nome ? C.branco : C.textoSecundario}
              />
            </View>
            <Text
              style={[s.textoNavegacao, tela === nome && s.textoNavegacaoAtivo]}
              numberOfLines={1}>
              {nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => setMenuNovoAberto(true)}>
        <Icone nome="plus" tamanho={28} cor={C.preto} />
      </TouchableOpacity>

      {/* MENU DO BOTÃO + */}
      <Modal
        visible={menuNovoAberto}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuNovoAberto(false)}>
        <View style={s.fundoMenu}>
          <TouchableOpacity
            style={s.fundoMenuToque}
            activeOpacity={1}
            onPress={() => setMenuNovoAberto(false)}
          />
          <View style={s.menuNovo}>
            <View style={s.alcaModal} />
            <Text style={[s.tituloModal, { marginBottom: 6 }]}>
              O que deseja registrar?
            </Text>
            {[
              [
                'arrow-down-left',
                'Receita (Entrada)',
                'Salário, vendas e outras entradas',
                () => abrirNovaMovimentacao('Entrada'),
              ],
              [
                'arrow-up-right',
                'Despesa (Saída)',
                'Pix, dinheiro ou débito',
                () => abrirNovaMovimentacao('Saída', 'Pix'),
              ],
              [
                'credit-card',
                'Compra no Cartão de Crédito',
                'Entra na fatura do seu cartão (com parcelamento)',
                () => abrirNovaMovimentacao('Saída', 'Cartão de Crédito'),
              ],
              [
                'file-text',
                'Conta a Pagar / Receber',
                'Contas com vencimento agendado',
                () => setModalContaAberto(true),
              ],
              [
                'sliders',
                'Orçamento (Teto de Gastos)',
                'Defina quanto pode gastar por categoria',
                () => setModalOrcamentoAberto(true),
              ],
              [
                'zap',
                'Registro Inteligente',
                'Cole a notificação do banco ou comprovante Pix',
                () => setModalAutoAberto(true),
              ],
              [
                'repeat',
                'Conta Automática',
                'Assinaturas ou despesas fixas recorrentes',
                () => setModalRecorrenteAberto(true),
              ],
            ].map(([ic, titulo, sub, acao], i, lista) => (
              <TouchableOpacity
                key={titulo}
                style={[s.opcaoMenu, i === lista.length - 1 && s.semBorda]}
                activeOpacity={0.7}
                onPress={() => abrirDoMenu(acao)}>
                <View style={s.iconeOpcaoMenu}>
                  <Icone nome={ic} tamanho={20} cor={C.texto} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.tituloOpcaoMenu}>{titulo}</Text>
                  <Text style={s.subtituloOpcaoMenu}>{sub}</Text>
                </View>
                <Icone
                  nome="chevron-right"
                  tamanho={18}
                  cor={C.textoSecundario}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalMovAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalMovAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View style={{ flex: 1 }}>
                <Text style={s.tituloModal}>
                  {formMov.id ? 'Editar Lançamento' : 'Novo Lançamento'}
                </Text>
                <Text style={s.subtituloModal}>
                  {formMov.tipo === 'Entrada'
                    ? 'Registrar Receita'
                    : 'Registrar Despesa'}
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalMovAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>TIPO DE OPERAÇÃO</Text>
              <View style={s.seletorTipo}>
                {['Entrada', 'Saída'].map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[
                      s.opcaoTipo,
                      formMov.tipo === op &&
                        (op === 'Entrada'
                          ? s.opcaoEntradaAtiva
                          : s.opcaoSaidaAtiva),
                    ]}
                    onPress={() =>
                      setFormMov((f) => ({
                        ...f,
                        tipo: op,
                        categoria: op === 'Entrada' ? ENTRADAS[0] : SAIDAS[0],
                      }))
                    }>
                    <Icone
                      nome={
                        op === 'Entrada' ? 'arrow-down-left' : 'arrow-up-right'
                      }
                      tamanho={16}
                      cor={
                        formMov.tipo === op
                          ? op === 'Entrada'
                            ? C.preto
                            : C.branco
                          : C.textoSecundario
                      }
                    />
                    <Text
                      style={[
                        s.textoOpcaoTipo,
                        formMov.tipo === op &&
                          (op === 'Entrada'
                            ? s.textoOpcaoEntradaAtiva
                            : s.textoOpcaoAtiva),
                      ]}>
                      {op === 'Entrada' ? 'Receita' : 'Gasto'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.rotuloCampo}>DESCRIÇÃO</Text>
              <TextInput
                style={s.campo}
                value={formMov.descricao}
                onChangeText={(t) =>
                  setFormMov((f) => ({ ...f, descricao: t }))
                }
                placeholder="Ex.: Supermercado, Salário, Farmácia..."
                placeholderTextColor={C.textoSecundario}
              />

              <Text style={s.rotuloCampo}>VALOR (R$)</Text>
              <TextInput
                style={s.campoValor}
                value={formMov.valor}
                onChangeText={(t) => setFormMov((f) => ({ ...f, valor: t }))}
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <Text style={s.rotuloCampo}>FORMA DE PAGAMENTO</Text>
              <View style={s.categorias}>
                {FORMAS_PAGAMENTO.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      s.categoria,
                      formMov.forma_pagamento === f && s.categoriaAtiva,
                    ]}
                    onPress={() =>
                      setFormMov((ant) => ({ ...ant, forma_pagamento: f }))
                    }>
                    <Text
                      style={[
                        s.textoCategoria,
                        formMov.forma_pagamento === f && s.textoCategoriaAtiva,
                      ]}>
                      {f === 'Cartão de Débito'
                        ? 'Débito'
                        : f === 'Cartão de Crédito'
                        ? 'Crédito'
                        : f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formMov.forma_pagamento === 'Cartão de Crédito' && (
                <>
                  <Text style={s.rotuloCampo}>QUAL CARTÃO DE CRÉDITO?</Text>
                  {cartoes.length > 0 ? (
                    <View style={s.categorias}>
                      {cartoes.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            s.categoria,
                            formMov.cartao_id === c.id && s.categoriaAtiva,
                          ]}
                          onPress={() =>
                            setFormMov((ant) => ({ ...ant, cartao_id: c.id }))
                          }>
                          <Text
                            style={[
                              s.textoCategoria,
                              formMov.cartao_id === c.id &&
                                s.textoCategoriaAtiva,
                            ]}>
                            {c.nome} ({c.banco})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={s.dicaData}>
                      Nenhum cartão cadastrado. Cadastre um na aba "Cartões".
                    </Text>
                  )}

                  {!formMov.id && (
                    <>
                      <Text style={s.rotuloCampo}>PARCELAMENTO</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.gradeParcelas}>
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map((p) => {
                          const ativo = Number(formMov.parcelas || 1) === p;
                          const num = valorNumerico(formMov.valor);
                          const valorParc = num > 0 ? num / p : 0;
                          return (
                            <TouchableOpacity
                              key={p}
                              style={[
                                s.itemParcela,
                                ativo && s.itemParcelaAtiva,
                              ]}
                              onPress={() =>
                                setFormMov((f) => ({ ...f, parcelas: p }))
                              }>
                              <Text
                                style={[
                                  s.textoParcela,
                                  ativo && s.textoParcelaAtiva,
                                ]}>
                                {p === 1
                                  ? 'À vista'
                                  : `${p}x de ${moeda(valorParc)}`}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </>
              )}

              <Text style={s.rotuloCampo}>CATEGORIA</Text>
              <View style={s.categorias}>
                {categoriasDisponiveis.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      s.categoria,
                      formMov.categoria === item && s.categoriaAtiva,
                    ]}
                    onPress={() =>
                      setFormMov((f) => ({ ...f, categoria: item }))
                    }>
                    <Text
                      style={[
                        s.textoCategoria,
                        formMov.categoria === item && s.textoCategoriaAtiva,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ABA PARA ESCREVER QUANDO A CATEGORIA FOR 'OUTROS' */}
              {formMov.categoria === 'Outros' && (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.rotuloCampoPrimeiro}>
                    ESPECIFIQUE A CATEGORIA
                  </Text>
                  <TextInput
                    style={s.campo}
                    value={formMov.categoriaPersonalizada}
                    onChangeText={(t) =>
                      setFormMov((f) => ({ ...f, categoriaPersonalizada: t }))
                    }
                    placeholder="Ex.: Manutenção, Frete, Presente..."
                    placeholderTextColor={C.textoSecundario}
                    autoFocus
                  />
                  <Text style={s.dicaData}>
                    Esta descrição será usada como o nome da sua categoria.
                  </Text>
                </View>
              )}

              {/* CAMPO DE DATA COM FILTRO NUMÉRICO E PADRONIZAÇÃO AUTOMÁTICA DD/MM/AAAA */}
              <Text style={s.rotuloCampo}>DATA DO LANÇAMENTO</Text>
              <TextInput
                style={s.campo}
                value={formMov.data}
                onChangeText={(t) =>
                  tratarDigitacaoData(t, (formatado) =>
                    setFormMov((f) => ({ ...f, data: formatado }))
                  )
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor={C.textoSecundario}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={s.dicaData}>
                Apenas números: digite por exemplo 15112026 para 15/11/2026.
              </Text>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalMovAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.botaoSalvar}
                  onPress={salvarMovimentacao}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2: NOVO CARTÃO DE CRÉDITO COM SELEÇÃO DE AGÊNCIAS E PREVIEW REAL */}
      <Modal
        visible={modalCartaoAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCartaoAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>
                  {formCartao.id ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
                </Text>
                <Text style={s.subtituloModal}>
                  Escolha sua agência e acompanhe faturas e limites
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalCartaoAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <View style={s.previewCartaoContainer}>
                <CartaoFisicoView
                  cartao={{
                    nome: formCartao.nome || 'MEU CARTÃO',
                    banco: formCartao.banco,
                    bandeira: formCartao.bandeira,
                    final_cartao: formCartao.final_cartao,
                    cor: formCartao.cor,
                  }}
                  ativo={true}
                  largura={Math.min(320, LARGURA_TELA - 48)}
                  nomeUsuario={usuario.nome}
                  fatura={0}
                  ocultarValores={false}
                />
              </View>

              <Text style={s.rotuloCampoPrimeiro}>
                ESCOLHA A AGÊNCIA BANCÁRIA
              </Text>
              <View style={s.gradeBancos}>
                {BANCOS_BRASIL.map((b) => {
                  const ativo =
                    formCartao.banco === b.id || formCartao.banco === b.nome;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[s.itemBanco, ativo && s.itemBancoAtivo]}
                      onPress={() =>
                        setFormCartao((f) => ({
                          ...f,
                          banco: b.nome,
                          cor: b.cor,
                          bandeira: f.bandeira || b.bandeiraPadrao,
                          nome: f.nome ? f.nome : `${b.nome}`,
                        }))
                      }>
                      <View
                        style={[s.badgeBancoCor, { backgroundColor: b.cor }]}>
                        <Text style={s.textoBadgeBanco}>
                          {b.sigla.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={s.nomeBancoItem} numberOfLines={1}>
                        {b.nome}
                      </Text>
                      {ativo && (
                        <Icone nome="check" tamanho={14} cor={C.branco} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.rotuloCampo}>NOME DO CARTÃO</Text>
              <TextInput
                style={s.campo}
                value={formCartao.nome}
                onChangeText={(t) => setFormCartao((f) => ({ ...f, nome: t }))}
                placeholder="Ex.: Nubank Ultravioleta, Inter Black..."
                placeholderTextColor={C.textoSecundario}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1.2 }}>
                  <Text style={s.rotuloCampo}>4 ÚLTIMOS DÍGITOS</Text>
                  <TextInput
                    style={s.campo}
                    value={formCartao.final_cartao}
                    onChangeText={(t) =>
                      setFormCartao((f) => ({
                        ...f,
                        final_cartao: t.replace(/\D/g, '').slice(0, 4),
                      }))
                    }
                    placeholder="Ex: 4821"
                    placeholderTextColor={C.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={{ flex: 1.8 }}>
                  <Text style={s.rotuloCampo}>BANDEIRA</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 6, paddingTop: 2 }}>
                    {BANDEIRAS_CARTAO.map((band) => (
                      <TouchableOpacity
                        key={band}
                        style={[
                          s.categoria,
                          formCartao.bandeira === band && s.categoriaAtiva,
                          { paddingVertical: 8, paddingHorizontal: 10 },
                        ]}
                        onPress={() =>
                          setFormCartao((f) => ({ ...f, bandeira: band }))
                        }>
                        <Text
                          style={[
                            s.textoCategoria,
                            formCartao.bandeira === band &&
                              s.textoCategoriaAtiva,
                            { fontSize: 11 },
                          ]}>
                          {band}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Text style={s.rotuloCampo}>LIMITE TOTAL DE CRÉDITO (R$)</Text>
              <TextInput
                style={s.campoValor}
                value={formCartao.limite}
                onChangeText={(t) =>
                  setFormCartao((f) => ({ ...f, limite: t }))
                }
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rotuloCampo}>DIA FECHAMENTO</Text>
                  <TextInput
                    style={s.campo}
                    value={formCartao.dia_fechamento}
                    onChangeText={(t) =>
                      setFormCartao((f) => ({
                        ...f,
                        dia_fechamento: t.replace(/\D/g, '').slice(0, 2),
                      }))
                    }
                    placeholder="Ex: 5"
                    placeholderTextColor={C.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rotuloCampo}>DIA VENCIMENTO</Text>
                  <TextInput
                    style={s.campo}
                    value={formCartao.dia_vencimento}
                    onChangeText={(t) =>
                      setFormCartao((f) => ({
                        ...f,
                        dia_vencimento: t.replace(/\D/g, '').slice(0, 2),
                      }))
                    }
                    placeholder="Ex: 15"
                    placeholderTextColor={C.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => {
                    setModalCartaoAberto(false);
                    setFormCartao(FORM_CARTAO_INICIAL);
                  }}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.botaoSalvar} onPress={salvarCartao}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>
                    {formCartao.id ? 'Salvar Alterações' : 'Cadastrar Cartão'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 3: REGISTRO INTELIGENTE */}
      <Modal
        visible={modalAutoAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalAutoAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View style={{ flex: 1 }}>
                <Text style={s.tituloModal}>Registro Inteligente</Text>
                <Text style={s.subtituloModal}>
                  Cole o texto de uma notificação bancária ou comprovante Pix
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalAutoAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>
                COLE O TEXTO DO SEU BANCO
              </Text>
              <TextInput
                style={s.campoGrande}
                value={textoNotificacao}
                onChangeText={setTextoNotificacao}
                placeholder="Exemplo: Compra aprovada no seu Cartão de R$ 42,50 no Supermercado Pão de Açúcar..."
                placeholderTextColor={C.textoSecundario}
                multiline
              />

              <Text style={s.rotuloCampo}>OU TESTE COM 1 CLIQUE:</Text>
              <View style={{ gap: 8 }}>
                {[
                  'Você transferiu R$ 65,00 via Pix para Restaurante Fogão de Minas',
                  'Compra aprovada de R$ 139,90 no seu Cartão de Crédito na Amazon',
                  'Você recebeu uma transferência Pix de R$ 1.200,00 de Vendas Online',
                  'Pagamento no Cartão de Débito de R$ 50,00 no Posto Ipiranga',
                ].map((ex) => (
                  <TouchableOpacity
                    key={ex}
                    style={s.exemploRapido}
                    onPress={() => setTextoNotificacao(ex)}>
                    <Text style={s.textoExemploRapido}>"{ex}"</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalAutoAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.botaoSalvar}
                  onPress={processarTextoNotificacao}>
                  <Icone nome="zap" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Identificar e Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalRecorrenteAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalRecorrenteAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Nova Conta Automática</Text>
                <Text style={s.subtituloModal}>
                  O app registrará este valor todo mês automaticamente
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalRecorrenteAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>TIPO DE OPERAÇÃO</Text>
              <View style={s.seletorTipo}>
                {['Entrada', 'Saída'].map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[
                      s.opcaoTipo,
                      formRecorrente.tipo === op &&
                        (op === 'Entrada'
                          ? s.opcaoEntradaAtiva
                          : s.opcaoSaidaAtiva),
                    ]}
                    onPress={() =>
                      setFormRecorrente((f) => ({ ...f, tipo: op }))
                    }>
                    <Text
                      style={[
                        s.textoOpcaoTipo,
                        formRecorrente.tipo === op &&
                          (op === 'Entrada'
                            ? s.textoOpcaoEntradaAtiva
                            : s.textoOpcaoAtiva),
                      ]}>
                      {op === 'Entrada'
                        ? 'Receita Fixa (Salário)'
                        : 'Despesa Fixa (Assinatura)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.rotuloCampo}>DESCRIÇÃO</Text>
              <TextInput
                style={s.campo}
                value={formRecorrente.descricao}
                onChangeText={(t) =>
                  setFormRecorrente((f) => ({ ...f, descricao: t }))
                }
                placeholder="Ex.: Aluguel, Netflix, Internet..."
                placeholderTextColor={C.textoSecundario}
              />

              <Text style={s.rotuloCampo}>VALOR MENSAL (R$)</Text>
              <TextInput
                style={s.campoValor}
                value={formRecorrente.valor}
                onChangeText={(t) =>
                  setFormRecorrente((f) => ({ ...f, valor: t }))
                }
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rotuloCampo}>DIA DO MÊS (1 A 31)</Text>
                  <TextInput
                    style={s.campo}
                    value={formRecorrente.dia_mes}
                    onChangeText={(t) =>
                      setFormRecorrente((f) => ({
                        ...f,
                        dia_mes: t.replace(/\D/g, '').slice(0, 2),
                      }))
                    }
                    placeholder="Ex: 5"
                    placeholderTextColor={C.textoSecundario}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={s.rotuloCampo}>FORMA</Text>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[
                          s.categoria,
                          formRecorrente.forma_pagamento === f &&
                            s.categoriaAtiva,
                          { paddingVertical: 5, paddingHorizontal: 9 },
                        ]}
                        onPress={() =>
                          setFormRecorrente((ant) => ({
                            ...ant,
                            forma_pagamento: f,
                          }))
                        }>
                        <Text
                          style={{
                            fontSize: 11,
                            color:
                              formRecorrente.forma_pagamento === f
                                ? C.preto
                                : C.textoSecundario,
                            fontWeight: '700',
                          }}>
                          {f === 'Cartão de Crédito'
                            ? 'Crédito'
                            : f === 'Cartão de Débito'
                            ? 'Débito'
                            : f}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalRecorrenteAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.botaoSalvar}
                  onPress={salvarRecorrente}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Ativar Automação</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalMetaAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalMetaAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Nova Meta Financeira</Text>
                <Text style={s.subtituloModal}>
                  Defina um objetivo para poupar recursos
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalMetaAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>TÍTULO DO OBJETIVO</Text>
              <TextInput
                style={s.campo}
                value={formMeta.titulo}
                onChangeText={(t) => setFormMeta((f) => ({ ...f, titulo: t }))}
                placeholder="Ex.: Reserva de Emergência, Viagem..."
                placeholderTextColor={C.textoSecundario}
              />

              <Text style={s.rotuloCampo}>
                VALOR ALVO QUE DESEJA ATINGIR (R$)
              </Text>
              <TextInput
                style={s.campoValor}
                value={formMeta.valor_alvo}
                onChangeText={(t) =>
                  setFormMeta((f) => ({ ...f, valor_alvo: t }))
                }
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <Text style={s.rotuloCampo}>
                VALOR INICIAL JÁ GUARDADO (Opcional)
              </Text>
              <TextInput
                style={s.campo}
                value={formMeta.valor_atual}
                onChangeText={(t) =>
                  setFormMeta((f) => ({ ...f, valor_atual: t }))
                }
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <Text style={s.rotuloCampo}>DATA LIMITE PREVISTA (Opcional)</Text>
              <TextInput
                style={s.campo}
                value={formMeta.data_limite}
                onChangeText={(t) =>
                  tratarDigitacaoData(t, (formatado) =>
                    setFormMeta((f) => ({ ...f, data_limite: formatado }))
                  )
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor={C.textoSecundario}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={s.dicaData}>
                Digite apenas números para preencher a data.
              </Text>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalMetaAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.botaoSalvar} onPress={salvarMeta}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Criar Meta</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 6: APORTE EM META */}
      <Modal
        visible={modalAporteAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalAporteAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Guardar Dinheiro</Text>
                <Text style={s.subtituloModal}>
                  Meta: {metaSelecionada ? metaSelecionada.titulo : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalAporteAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <Text style={s.rotuloCampoPrimeiro}>VALOR DO APORTE (R$)</Text>
            <TextInput
              style={s.campoValor}
              value={valorAporte}
              onChangeText={setValorAporte}
              placeholder="0,00"
              placeholderTextColor={C.textoSecundario}
              keyboardType="decimal-pad"
              autoFocus
            />

            <View style={s.botoesModal}>
              <TouchableOpacity
                style={s.botaoCancelar}
                onPress={() => setModalAporteAberto(false)}>
                <Text style={s.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.botaoSalvar} onPress={realizarAporte}>
                <Icone nome="check" tamanho={16} cor={C.preto} />
                <Text style={s.textoSalvar}>Confirmar Aporte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalPerfilAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalPerfilAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Meu Perfil & Segurança</Text>
                <Text style={s.subtituloModal}>
                  Gerencie suas credenciais e proteção
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalPerfilAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <View style={s.linhaPerfil}>
                <Text style={s.rotuloPerfil}>Nome</Text>
                <Text style={s.valorPerfil}>{usuario.nome}</Text>
              </View>
              <View style={s.linhaPerfil}>
                <Text style={s.rotuloPerfil}>E-mail</Text>
                <Text style={s.valorPerfil}>{usuario.email}</Text>
              </View>
              <View style={s.linhaPerfil}>
                <Text style={s.rotuloPerfil}>Criptografia de Senha</Text>
                <Text style={s.valorPerfil}>Bcrypt (Hash Ativo ✓)</Text>
              </View>

              <Text style={[s.rotuloCampo, { marginTop: 16 }]}>
                ALTERAR NOME DE EXIBIÇÃO
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[s.campo, { flex: 1 }]}
                  value={novoNomePerfil}
                  onChangeText={setNovoNomePerfil}
                  placeholder={`Atual: ${usuario.nome}`}
                  placeholderTextColor={C.textoSecundario}
                />
                <TouchableOpacity
                  style={[
                    s.botaoLogin,
                    { height: 50, paddingHorizontal: 16, marginTop: 0 },
                  ]}
                  onPress={atualizarNomeUsuario}>
                  <Text style={s.textoBotaoLogin}>Salvar</Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.rotuloCampo, { marginTop: 22 }]}>
                ALTERAR SENHA DE ACESSO
              </Text>
              <TextInput
                style={[s.campo, { marginBottom: 10 }]}
                value={senhaAtualPerfil}
                onChangeText={setSenhaAtualPerfil}
                placeholder="Senha atual"
                placeholderTextColor={C.textoSecundario}
                secureTextEntry
              />
              <TextInput
                style={[s.campo, { marginBottom: 10 }]}
                value={novaSenhaPerfil}
                onChangeText={setNovaSenhaPerfil}
                placeholder="Nova senha (mínimo 8 caracteres)"
                placeholderTextColor={C.textoSecundario}
                secureTextEntry
              />
              <TextInput
                style={s.campo}
                value={confirmarNovaSenha}
                onChangeText={setConfirmarNovaSenha}
                placeholder="Confirme a nova senha"
                placeholderTextColor={C.textoSecundario}
                secureTextEntry
              />

              <TouchableOpacity
                style={[s.botaoLogin, { marginTop: 14 }]}
                onPress={alterarSenhaUsuario}>
                <Icone nome="lock" tamanho={16} cor={C.preto} />
                <Text style={s.textoBotaoLogin}>Atualizar Senha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.botaoPerigo}
                onPress={confirmarExclusaoConta}>
                <Icone nome="trash-2" tamanho={16} cor={C.textoSecundario} />
                <Text style={s.textoBotaoPerigo}>
                  Excluir Minha Conta Definitivamente
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalContaAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalContaAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Nova Conta</Text>
                <Text style={s.subtituloModal}>
                  Agende uma despesa a pagar ou receita a receber
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalContaAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>TIPO DE CONTA</Text>
              <View style={s.seletorTipo}>
                {['Pagar', 'Receber'].map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[
                      s.opcaoTipo,
                      formConta.tipo === op &&
                        (op === 'Receber'
                          ? s.opcaoEntradaAtiva
                          : s.opcaoSaidaAtiva),
                    ]}
                    onPress={() => setFormConta((f) => ({ ...f, tipo: op }))}>
                    <Text
                      style={[
                        s.textoOpcaoTipo,
                        formConta.tipo === op &&
                          (op === 'Receber'
                            ? s.textoOpcaoEntradaAtiva
                            : s.textoOpcaoAtiva),
                      ]}>
                      {op === 'Pagar' ? 'Conta a Pagar' : 'Conta a Receber'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.rotuloCampo}>DESCRIÇÃO</Text>
              <TextInput
                style={s.campo}
                value={formConta.descricao}
                onChangeText={(t) =>
                  setFormConta((f) => ({ ...f, descricao: t }))
                }
                placeholder="Ex.: Conta de Luz, Aluguel, IPTU..."
                placeholderTextColor={C.textoSecundario}
              />

              <Text style={s.rotuloCampo}>VALOR (R$)</Text>
              <TextInput
                style={s.campoValor}
                value={formConta.valor}
                onChangeText={(t) => setFormConta((f) => ({ ...f, valor: t }))}
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />

              <Text style={s.rotuloCampo}>CATEGORIA</Text>
              <View style={s.categorias}>
                {SAIDAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      s.categoria,
                      formConta.categoria === cat && s.categoriaAtiva,
                    ]}
                    onPress={() =>
                      setFormConta((f) => ({ ...f, categoria: cat }))
                    }>
                    <Text
                      style={[
                        s.textoCategoria,
                        formConta.categoria === cat && s.textoCategoriaAtiva,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.rotuloCampo}>DATA DE VENCIMENTO</Text>
              <TextInput
                style={s.campo}
                value={formConta.data_vencimento}
                onChangeText={(t) =>
                  tratarDigitacaoData(t, (formatado) =>
                    setFormConta((f) => ({ ...f, data_vencimento: formatado }))
                  )
                }
                placeholder="DD/MM/AAAA"
                placeholderTextColor={C.textoSecundario}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={s.dicaData}>
                Digite apenas os números da data de vencimento.
              </Text>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalContaAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.botaoSalvar} onPress={salvarConta}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Cadastrar Conta</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalOrcamentoAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOrcamentoAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Teto de Gastos</Text>
                <Text style={s.subtituloModal}>
                  Defina o limite mensal para uma categoria
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalOrcamentoAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <Text style={s.rotuloCampoPrimeiro}>CATEGORIA</Text>
              <View style={s.categorias}>
                {SAIDAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      s.categoria,
                      formOrcamento.categoria === cat && s.categoriaAtiva,
                    ]}
                    onPress={() =>
                      setFormOrcamento((f) => ({ ...f, categoria: cat }))
                    }>
                    <Text
                      style={[
                        s.textoCategoria,
                        formOrcamento.categoria === cat &&
                          s.textoCategoriaAtiva,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.rotuloCampo}>LIMITE MENSAL MÁXIMO (R$)</Text>
              <TextInput
                style={s.campoValor}
                value={formOrcamento.limite_mensal}
                onChangeText={(t) =>
                  setFormOrcamento((f) => ({ ...f, limite_mensal: t }))
                }
                placeholder="0,00"
                placeholderTextColor={C.textoSecundario}
                keyboardType="decimal-pad"
              />
              <Text style={s.dicaData}>
                Você receberá alertas visuais no extrato se os gastos
                ultrapassarem esse teto em {nomeDoMes(mesSelecionado)}.
              </Text>

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalOrcamentoAberto(false)}>
                  <Text style={s.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.botaoSalvar}
                  onPress={salvarOrcamento}>
                  <Icone nome="check" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Definir Teto</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalExportarAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalExportarAberto(false)}>
        <KeyboardAvoidingView
          style={s.fundoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modal}>
            <View style={s.alcaModal} />
            <View style={s.cabecalhoModal}>
              <View>
                <Text style={s.tituloModal}>Relatório Mensal</Text>
                <Text style={s.subtituloModal}>
                  Demonstrativo formatado para visualização e cópia
                </Text>
              </View>
              <TouchableOpacity
                style={s.fecharModal}
                onPress={() => setModalExportarAberto(false)}>
                <Icone nome="x" tamanho={18} cor={C.texto} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always">
              <TextInput
                style={[
                  s.campoGrande,
                  {
                    minHeight: 280,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    fontSize: 11,
                  },
                ]}
                value={textoExportacao}
                editable={false}
                multiline
              />

              <View style={s.botoesModal}>
                <TouchableOpacity
                  style={s.botaoCancelar}
                  onPress={() => setModalExportarAberto(false)}>
                  <Text style={s.textoCancelar}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.botaoSalvar}
                  onPress={() => {
                    Alert.alert(
                      'Relatório Pronto',
                      'O texto do relatório pode ser selecionado e copiado diretamente do campo acima!'
                    );
                  }}>
                  <Icone nome="copy" tamanho={16} cor={C.preto} />
                  <Text style={s.textoSalvar}>Concluído</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
