import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/helpers';

export default function FiscalizacoesList({ 
  fiscalizacoes, 
  onEdit, 
  onDelete, 
  emptyMessage = "Nenhuma fiscalização registrada" 
}) {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Em dia':
        return '#28a745';
      case 'Atrasada':
        return '#ffc107';
      case 'Parada':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Em dia':
        return 'checkmark-circle-outline';
      case 'Atrasada':
        return 'warning-outline';
      case 'Parada':
        return 'stop-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const confirmarExclusao = (fiscalizacao) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a fiscalização de ${formatDate(new Date(fiscalizacao.dataFiscalizacao))}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDelete && onDelete(fiscalizacao.id)
        },
      ]
    );
  };

  const renderFiscalizacao = ({ item: fiscalizacao }) => (
    <View style={styles.fiscalizacaoCard}>
      {/* Header com data e status */}
      <View style={styles.fiscalizacaoHeader}>
        <View style={styles.dataContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dataText}>
            {formatDate(new Date(fiscalizacao.dataFiscalizacao))}
          </Text>
        </View>
        
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(fiscalizacao.status) }
        ]}>
          <Ionicons 
            name={getStatusIcon(fiscalizacao.status)} 
            size={16} 
            color="white" 
          />
          <Text style={styles.statusText}>{fiscalizacao.status}</Text>
        </View>
      </View>

      {/* Foto da fiscalização */}
      {fiscalizacao.foto && (
        <Image source={{ uri: fiscalizacao.foto }} style={styles.fiscalizacaoFoto} />
      )}

      {/* Observações */}
      <View style={styles.observacoesContainer}>
        <Text style={styles.observacoesLabel}>Observações:</Text>
        <Text style={styles.observacoesText} numberOfLines={3}>
          {fiscalizacao.observacoes}
        </Text>
      </View>

      {/* Localização */}
      {fiscalizacao.endereco && (
        <View style={styles.localizacaoContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.localizacaoText} numberOfLines={1}>
            {fiscalizacao.endereco}
          </Text>
        </View>
      )}

      {/* Ações */}
      {(onEdit || onDelete) && (
        <View style={styles.acoesContainer}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.acaoButton, styles.editButton]}
              onPress={() => onEdit(fiscalizacao)}
            >
              <Ionicons name="create-outline" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity
              style={[styles.acaoButton, styles.deleteButton]}
              onPress={() => confirmarExclusao(fiscalizacao)}
            >
              <Ionicons name="trash-outline" size={16} color="#dc3545" />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={fiscalizacoes}
      renderItem={renderFiscalizacao}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={fiscalizacoes.length === 0 ? styles.emptyList : styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fiscalizacaoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fiscalizacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fiscalizacaoFoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  observacoesContainer: {
    marginBottom: 10,
  },
  observacoesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  localizacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  localizacaoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  acoesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  acaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#f0f8ff',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
});