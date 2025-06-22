import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';
import { formatDate, formatDatetime } from '../utils/helpers';

export const isMailAvailable = async () => {
  try {
    return await MailComposer.isAvailableAsync();
  } catch (error) {
    console.error('Erro ao verificar disponibilidade do e-mail:', error);
    return false;
  }
};

const gerarConteudoObra = (obra, fiscalizacoes = []) => {
  const fiscalizacoesHtml = fiscalizacoes.map(fisc => `
    <div style="background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #007AFF;">
      <h4 style="color: #333; margin: 0 0 10px 0;">Fiscalização - ${formatDate(new Date(fisc.dataFiscalizacao))}</h4>
      <p><strong>Status:</strong> ${fisc.status}</p>
      <p><strong>Observações:</strong> ${fisc.observacoes}</p>
      <p><strong>Localização:</strong> ${fisc.endereco || 'Não informado'}</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório da Obra</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007AFF; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .obra-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .fiscalizacoes { margin-top: 20px; }
        .fiscalizacao { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #007AFF; }
        .status-em-dia { border-left-color: #28a745; }
        .status-atrasada { border-left-color: #ffc107; }
        .status-parada { border-left-color: #dc3545; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório da Obra</h1>
        <p>Gerado em: ${formatDatetime(new Date())}</p>
      </div>
      
      <div class="obra-info">
        <h2>${obra.nome}</h2>
        <p><strong>Responsável:</strong> ${obra.responsavel}</p>
        <p><strong>Data de Início:</strong> ${formatDate(new Date(obra.dataInicio))}</p>
        <p><strong>Previsão de Término:</strong> ${formatDate(new Date(obra.previsaoTermino))}</p>
        <p><strong>Localização:</strong> ${obra.endereco || 'Não informado'}</p>
        <p><strong>Descrição:</strong> ${obra.descricao}</p>
      </div>
      
      <div class="fiscalizacoes">
        <h3>Fiscalizações (${fiscalizacoes.length})</h3>
        ${fiscalizacoes.length > 0 ? fiscalizacoesHtml : '<p>Nenhuma fiscalização registrada.</p>'}
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 8px;">
        <p><small>Este relatório foi gerado automaticamente pelo aplicativo de Cadastro de Obras em Andamento.</small></p>
      </div>
    </body>
    </html>
  `;
};

export const enviarEmailObra = async (obra, fiscalizacoes = [], emailDestino = '') => {
  try {
    const available = await isMailAvailable();
    if (!available) {
      Alert.alert(
        'E-mail não disponível',
        'Não foi possível encontrar um aplicativo de e-mail configurado neste dispositivo.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const htmlContent = gerarConteudoObra(obra, fiscalizacoes);
    
    const attachments = [];
    
    if (obra.foto) {
      attachments.push({
        uri: obra.foto,
        mimeType: 'image/jpeg',
        filename: `obra_${obra.nome.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
      });
    }
    
    fiscalizacoes.forEach((fisc, index) => {
      if (fisc.foto) {
        attachments.push({
          uri: fisc.foto,
          mimeType: 'image/jpeg',
          filename: `fiscalizacao_${index + 1}_${formatDate(new Date(fisc.dataFiscalizacao)).replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        });
      }
    });

    const emailOptions = {
      subject: `Relatório da Obra: ${obra.nome}`,
      body: htmlContent,
      isHtml: true,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    if (emailDestino && emailDestino.trim()) {
      emailOptions.recipients = [emailDestino.trim()];
    }

    const result = await MailComposer.composeAsync(emailOptions);
    
    if (result.status === 'sent') {
      Alert.alert('Sucesso!', 'E-mail enviado com sucesso.');
      return true;
    } else if (result.status === 'cancelled') {
      return false;
    } else {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail.');
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    Alert.alert('Erro', 'Ocorreu um erro ao tentar enviar o e-mail.');
    return false;
  }
};

export const solicitarEmailDestino = () => {
  return new Promise((resolve) => {
    Alert.prompt(
      'Enviar por E-mail',
      'Digite o endereço de e-mail do destinatário (opcional):',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(null)
        },
        {
          text: 'Enviar',
          onPress: (email) => resolve(email || '')
        }
      ],
      'plain-text',
      '',
      'email-address'
    );
  });
};

export const enviarEmailComPrompt = async (obra, fiscalizacoes = []) => {
  try {
    const emailDestino = await solicitarEmailDestino();
    if (emailDestino === null) {
      return false;
    }
    
    return await enviarEmailObra(obra, fiscalizacoes, emailDestino);
  } catch (error) {
    console.error('Erro no processo de envio de e-mail:', error);
    Alert.alert('Erro', 'Ocorreu um erro no processo de envio de e-mail.');
    return false;
  }
};