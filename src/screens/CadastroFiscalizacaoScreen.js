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
import { formatDate } from '../utils/helpers';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroFiscalizacaoScreen({ route, navigation }) {
  const { obraId } = route.params;
  const { obras, adicionarFiscalizacao } = useObras();

  const [formData, setFormData] = useState({
    dataFiscalizacao: new Date(),
    status: 'Em dia',
    observacoes: '',
    localizacao: null,
    endereco: '',
    foto: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const obra = obras.find(o => o.id === obraId);

  console.log(obra)

  useEffect(() => {
    obterLocalizacao();
  }, []);

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

 const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permissão necessária',
      'É necessário permitir o acesso à câmera para tirar fotos das obras.'
    );
    return false;
  }
  return true;
};

const openCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, foto: result.assets[0].uri }));
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível acessar a câmera.');
  }
};

const openGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, foto: result.assets[0].uri }));
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível acessar a galeria.');
  }
};

const mostrarOpcoesFoto = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return;

  Alert.alert(
    'Adicionar Foto',
    'Como você gostaria de adicionar uma foto?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => openCamera() },
      { text: 'Galeria', onPress: () => openGallery() },
    ]
  );
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
      const novaFiscalizacao = {
        ...formData,
        obraId: obraId,
        dataFiscalizacao: formData.dataFiscalizacao.toISOString(),
      };

      await adicionarFiscalizacao(novaFiscalizacao);

      Alert.alert(
        'Sucesso!',
        'Fiscalização cadastrada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a fiscalização');
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

  if (!obra) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Obra não encontrada</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header da Obra */}
          <View style={styles.obraHeader}>
            <Text style={styles.obraTitle}>Fiscalização da Obra:</Text>
            <Text style={styles.obraNome}>{obra.nome}</Text>
          </View>

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

          {/* Botão Salvar */}
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
                <Text style={styles.saveButtonText}>Salvar Fiscalização</Text>
              </>
            )}
          </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  obraHeader: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  obraTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  obraNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    margin: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});