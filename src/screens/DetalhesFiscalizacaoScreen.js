import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useObras } from '../contexts/ObrasContext';
import { getCurrentLocation, getAddressFromCoordinates } from '../services/location';
import { takePhoto, selectFromGallery } from '../services/camera';
import { formatDate } from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetalhesFiscalizacaoScreen({ route, navigation }) {
  const { fiscalizacao } = route.params;
  const { atualizarFiscalizacao } = useObras();

  const [formData, setFormData] = useState({
    dataFiscalizacao: new Date(fiscalizacao.dataFiscalizacao),
    status: fiscalizacao.status,
    observacoes: fiscalizacao.observacoes,
    localizacao: fiscalizacao.localizacao,
    endereco: fiscalizacao.endereco,
    foto: fiscalizacao.foto,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const obterLocalizacao = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      const endereco = await getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );

      setFormData(prev => ({
        ...prev,
        localizacao: location,
        endereco: endereco
      }));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização atual');
    } finally {
      setLoadingLocation(false);
    }
  };

  const mostrarOpcoesFoto = () => {
    Alert.alert(
      'Alterar Foto',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: tirarFoto },
        { text: 'Galeria', onPress: selecionarDaGaleria },
        { text: 'Remover Foto', onPress: removerFoto, style: 'destructive' },
      ]
    );
  };

  const tirarFoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        setFormData(prev => ({ ...prev, foto: photo }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const selecionarDaGaleria = async () => {
    try {
      const photo = await selectFromGallery();
      if (photo) {
        setFormData(prev => ({ ...prev, foto: photo }));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a foto');
    }
  };

  const removerFoto = () => {
    setFormData(prev => ({ ...prev, foto: null }));
  };

  const validarFormulario = () => {
    if (!formData.observacoes.trim()) {
      Alert.alert('Erro', 'Por favor, adicione observações sobre a fiscalização');
      return false;
    }

    if (!formData.localizacao) {
      Alert.alert('Erro', 'Localização é obrigatória. Tente obter a localização novamente.');
      return false;
    }

    return true;
  };

  const salvarFiscalizacao = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const fiscalizacaoAtualizada = {
        ...fiscalizacao,
        ...formData,
        dataFiscalizacao: formData.dataFiscalizacao.toISOString(),
      };

      await atualizarFiscalizacao(fiscalizacaoAtualizada);

      Alert.alert(
        'Sucesso!',
        'Fiscalização atualizada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a fiscalização');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dataFiscalizacao: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Formulário */}
          <View style={styles.form}>
            {/* Data da Fiscalização */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data da Fiscalização *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {formatDate(formData.dataFiscalizacao)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Status da Obra */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status da Obra *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Em dia" value="Em dia" />
                  <Picker.Item label="Atrasada" value="Atrasada" />
                  <Picker.Item label="Parada" value="Parada" />
                </Picker>
              </View>
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.observacoes}
                onChangeText={(text) =>
                  setFormData(prev => ({ ...prev, observacoes: text }))
                }
                placeholder="Descreva as observações da fiscalização..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Localização */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Localização *</Text>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={obterLocalizacao}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="location-outline" size={20} color="#007AFF" />
                )}
                <Text style={styles.locationText}>
                  {loadingLocation
                    ? 'Obtendo localização...'
                    : formData.endereco || 'Obter localização atual'
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Foto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Foto da Fiscalização</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={mostrarOpcoesFoto}
              >
                {formData.foto ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: formData.foto }} style={styles.photo} />
                    <View style={styles.photoOverlay}>
                      <Ionicons name="camera-outline" size={24} color="white" />
                      <Text style={styles.photoOverlayText}>Alterar Foto</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#666" />
                    <Text style={styles.photoPlaceholderText}>
                      Adicionar Foto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close-outline" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={salvarFiscalizacao}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dataFiscalizacao}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  },
  photoPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    gap: 15,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});