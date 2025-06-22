import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useObras } from '../contexts/ObrasContext';
import { formatDate, getObraStatus, getStatusColor, getDiasRestantes } from '../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';



const HomeScreen = ({ navigation }) => {
  const { obras, excluirObra } = useObras();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();


  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDeleteObra = (obra) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a obra "${obra.nome}"?\n\nEsta ação também excluirá todas as fiscalizações relacionadas.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirObra(obra.id),
        },
      ]
    );
  };

  const renderObraItem = ({ item }) => {
    const status = getObraStatus(item.dataInicio, item.previsaoTermino);
    const statusColor = getStatusColor(status);
    const diasRestantes = getDiasRestantes(item.previsaoTermino);

    return (
      <TouchableOpacity
        style={styles.obraCard}
        onPress={() => navigation.navigate('DetalhesObra', { obra: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.obraInfo}>
            <Text style={styles.obraNome}>{item.nome}</Text>
            <Text style={styles.obraResponsavel}>
              <Ionicons name="person" size={14} color="#666" /> {item.responsavel}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleDeleteObra(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>

        {item.foto && (
          <Image source={{ uri: item.foto }} style={styles.obraImage} />
        )}

        <View style={styles.cardBody}>
          <Text style={styles.obraDescricao} numberOfLines={2}>
            {item.descricao || 'Sem descrição'}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateText}>
                Início: {formatDate(item.dataInicio)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>
                Término: {formatDate(item.previsaoTermino)}
              </Text>
            </View>
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

          {item.localizacao && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.localizacao.endereco || 'Localização registrada'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="hammer-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma obra cadastrada</Text>
      <Text style={styles.emptySubtitle}>
        Toque no botão + para cadastrar sua primeira obra
      </Text>
    </View>
  );

  return (
    <SafeAreaView  style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Obras</Text>
        <Text style={styles.headerSubtitle}>
          {obras.length} {obras.length === 1 ? 'obra cadastrada' : 'obras cadastradas'}
        </Text>
      </View>

      <FlatList
        data={obras}
        keyExtractor={(item) => item.id}
        renderItem={renderObraItem}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={obras.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('CadastroObra')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  obraCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  obraInfo: {
    flex: 1,
  },
  obraNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  obraResponsavel: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  obraImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 16,
    paddingTop: 8,
  },
  obraDescricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  datesContainer: {
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  diasRestantes: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;