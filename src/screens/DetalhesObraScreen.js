import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { useObras } from '../contexts/ObrasContext';
import {
  formatDate,
  formatDateTime,
  getObraStatus,
  getStatusColor,
  getDiasRestantes
} from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

const DetalhesObraScreen = ({ navigation, route }) => {
  const { obra } = route.params;
  const { getFiscalizacoesPorObra, excluirObra } = useObras();
  const [fiscalizacoes, setFiscalizacoes] = useState([]);

  useEffect(() => {
    const fiscalizacoesObra = getFiscalizacoesPorObra(obra.id);
    setFiscalizacoes(fiscalizacoesObra.sort((a, b) =>
      new Date(b.dataFiscalizacao) - new Date(a.dataFiscalizacao)
    ));
  }, [obra.id, getFiscalizacoesPorObra]);

  const status = getObraStatus(obra.dataInicio, obra.previsaoTermino);
  const statusColor = getStatusColor(status);
  const diasRestantes = getDiasRestantes(obra.previsaoTermino);

  const handleEditObra = () => {
    navigation.navigate('CadastroObra', { obra });
  };

  const handleNovaFiscalizacao = () => {
    navigation.navigate('CadastroFiscalizacao', { obraId: obra.id });
  };

  const handleDeleteObra = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a obra "${obra.nome}"?\n\nEsta ação também excluirá todas as fiscalizações relacionadas e não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            excluirObra(obra.id);
            Alert.alert('Sucesso', 'Obra excluída com sucesso!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          },
        },
      ]
    );
  };

  const generateEmailContent = () => {
    let content = `=== DADOS DA OBRA ===\n\n`;
    content += `Nome: ${obra.nome}\n`;
    content += `Responsável: ${obra.responsavel}\n`;
    content += `Data de Início: ${formatDate(obra.dataInicio)}\n`;
    content += `Previsão de Término: ${formatDate(obra.previsaoTermino)}\n`;
    content += `Status Atual: ${status}\n`;

    if (diasRestantes >= 0) {
      content += `Dias Restantes: ${diasRestantes}\n`;
    }

    if (obra.descricao) {
      content += `Descrição: ${obra.descricao}\n`;
    }

    if (obra.localizacao && obra.localizacao.endereco) {
      content += `Localização: ${obra.localizacao.endereco}\n`;
    }

    if (fiscalizacoes.length > 0) {
      content += `\n=== FISCALIZAÇÕES (${fiscalizacoes.length}) ===\n\n`;

      fiscalizacoes.forEach((fisc, index) => {
        content += `${index + 1}. Data: ${formatDateTime(fisc.dataFiscalizacao)}\n`;
        content += `   Status: ${fisc.status}\n`;
        content += `   Observações: ${fisc.observacoes}\n`;
        if (fisc.localizacao && fisc.localizacao.endereco) {
          content += `   Local: ${fisc.localizacao.endereco}\n`;
        }
        content += `\n`;
      });
    } else {
      content += `\n=== FISCALIZAÇÕES ===\n\nNenhuma fiscalização registrada.\n`;
    }

    content += `\n---\nRelatório gerado pelo App Cadastro de Obras em ${formatDateTime(new Date())}`;

    return content;
  };

  const handleSendEmail = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          'Email não disponível',
          'O dispositivo não possui um cliente de email configurado.',
          [
            { text: 'Compartilhar', onPress: handleShare },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return;
      }

      const emailContent = generateEmailContent();

      await MailComposer.composeAsync({
        recipients: [''],
        subject: `Relatório da Obra: ${obra.nome}`,
        body: emailContent,
        isHtml: false,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
    }
  };

  const handleShare = async () => {
    try {
      const content = generateEmailContent();
      await Share.share({
        message: content,
        title: `Relatório da Obra: ${obra.nome}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o relatório.');
    }
  };

  const handleOpenLocation = () => {
    if (obra.localizacao) {
      const { latitude, longitude } = obra.localizacao;
      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const renderFiscalizacaoItem = (fiscalizacao, index, navigation) => {
    const fiscStatusColor = getStatusColor(fiscalizacao.status);

    return (
      <TouchableOpacity
        key={fiscalizacao.id}
        style={styles.fiscalizacaoCard}
        onPress={() => navigation.navigate('DetalhesFiscalizacaoScreen', { fiscalizacao })}
      >
        <View style={styles.fiscalizacaoHeader}>
          <Text style={styles.fiscalizacaoData}>
            {formatDateTime(fiscalizacao.dataFiscalizacao)}
          </Text>
          <View style={[styles.fiscStatusBadge, { backgroundColor: fiscStatusColor }]}>
            <Text style={styles.fiscStatusText}>{fiscalizacao.status}</Text>
          </View>
        </View>

        <Text style={styles.fiscalizacaoObservacoes}>
          {fiscalizacao.observacoes}
        </Text>

        {fiscalizacao.foto && (
          <Image source={{ uri: fiscalizacao.foto }} style={styles.fiscalizacaoFoto} />
        )}

        {fiscalizacao.localizacao && fiscalizacao.localizacao.endereco && (
          <View style={styles.fiscalizacaoLocation}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.fiscalizacaoLocationText}>
              {fiscalizacao.localizacao.endereco}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header da Obra */}
        <View style={styles.header}>
          <Text style={styles.obraNome}>{obra.nome}</Text>
          <Text style={styles.obraResponsavel}>
            <Ionicons name="person" size={16} color="#666" /> {obra.responsavel}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>

            {diasRestantes >= 0 && (
              <Text style={[
                styles.diasRestantes,
                { color: diasRestantes <= 7 ? '#f44336' : '#666' }
              ]}>
                {diasRestantes === 0
                  ? 'Prazo vence hoje!'
                  : diasRestantes === 1
                    ? '1 dia restante'
                    : `${diasRestantes} dias restantes`
                }
              </Text>
            )}
          </View>
        </View>

        {/* Foto da Obra */}
        {obra.foto && (
          <Image source={{ uri: obra.foto }} style={styles.obraFoto} />
        )}

        {/* Informações da Obra */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações da Obra</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Data de Início:</Text>
            <Text style={styles.infoValue}>{formatDate(obra.dataInicio)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.infoLabel}>Previsão de Término:</Text>
            <Text style={styles.infoValue}>{formatDate(obra.previsaoTermino)}</Text>
          </View>

          {obra.descricao && (
            <View style={styles.descricaoContainer}>
              <Text style={styles.descricaoLabel}>Descrição:</Text>
              <Text style={styles.descricaoText}>{obra.descricao}</Text>
            </View>
          )}

          {obra.localizacao && (
            <TouchableOpacity style={styles.locationRow} onPress={handleOpenLocation}>
              <Ionicons name="location" size={20} color="#2196F3" />
              <Text style={styles.locationLabel}>Localização:</Text>
              <Text style={styles.locationValue}>
                {obra.localizacao.endereco || 'Ver no mapa'}
              </Text>
              <Ionicons name="external-link-outline" size={16} color="#2196F3" />
            </TouchableOpacity>
          )}
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditObra}>
            <Ionicons name="create-outline" size={20} color="#2196F3" />
            <Text style={styles.actionButtonText}>Editar Obra</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSendEmail}>
            <Ionicons name="mail-outline" size={20} color="#2196F3" />
            <Text style={styles.actionButtonText}>Enviar por Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteObra}
          >
            <Ionicons name="trash-outline" size={20} color="#f44336" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Excluir Obra
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Fiscalizações */}
        <View style={styles.fiscalizacoesSection}>
          <View style={styles.fiscalizacoesHeader}>
            <Text style={styles.sectionTitle}>
              Fiscalizações ({fiscalizacoes.length})
            </Text>
            <TouchableOpacity
              style={styles.novaFiscalizacaoButton}
              onPress={handleNovaFiscalizacao}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.novaFiscalizacaoText}>Nova</Text>
            </TouchableOpacity>
          </View>

          {fiscalizacoes.length > 0 ? (
            fiscalizacoes.map((fiscalizacao, index) =>
              renderFiscalizacaoItem(fiscalizacao, index, navigation)
            )
          ) : (
            <View style={styles.emptyFiscalizacoes}>
              <Ionicons name="clipboard-outline" size={60} color="#ccc" />
              <Text style={styles.emptyFiscalizacoesText}>
                Nenhuma fiscalização registrada
              </Text>
              <Text style={styles.emptyFiscalizacoesSubtext}>
                Toque em "Nova" para adicionar a primeira fiscalização
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  obraNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  obraResponsavel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diasRestantes: {
    fontSize: 14,
    fontWeight: '600',
  },
  obraFoto: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  descricaoContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descricaoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descricaoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  locationValue: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 8,
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  fiscalizacoesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fiscalizacoesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  novaFiscalizacaoButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  novaFiscalizacaoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  fiscalizacaoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  fiscalizacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fiscalizacaoData: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  fiscStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fiscStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fiscalizacaoObservacoes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  fiscalizacaoFoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  fiscalizacaoLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fiscalizacaoLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  emptyFiscalizacoes: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFiscalizacoesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '600',
  },
  emptyFiscalizacoesSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DetalhesObraScreen;