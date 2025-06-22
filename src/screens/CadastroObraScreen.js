import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useObras } from '../contexts/ObrasContext';
import { getCompleteLocation } from '../services/location';
import { validateObra } from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';


const CadastroObraScreen = ({ navigation, route }) => {
  const { adicionarObra, atualizarObra, excluirObra } = useObras();
  const isEdit = route.params?.obra !== undefined;
  const obraToEdit = route.params?.obra || {};

  const [formData, setFormData] = useState({
    nome: obraToEdit.nome || '',
    responsavel: obraToEdit.responsavel || '',
    dataInicio: obraToEdit.dataInicio ? new Date(obraToEdit.dataInicio) : new Date(),
    previsaoTermino: obraToEdit.previsaoTermino ? new Date(obraToEdit.previsaoTermino) : new Date(),
    descricao: obraToEdit.descricao || '',
    foto: obraToEdit.foto || null,
    localizacao: obraToEdit.localizacao || null,
  });

  const [showDatePicker, setShowDatePicker] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker(null);
    if (selectedDate) {
      handleInputChange(field, selectedDate);
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

  const handleTakePhoto = async () => {
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

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        handleInputChange('foto', result.assets[0].uri);
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
        handleInputChange('foto', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    }
  };

  const handleGetLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCompleteLocation();
      handleInputChange('localizacao', location);
      Alert.alert('Sucesso', 'Localização obtida com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro de Localização',
        'Não foi possível obter sua localização. Verifique se o GPS está ativo e as permissões foram concedidas.'
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    const validation = validateObra(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Dados inválidos', 'Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      const obraData = {
        ...formData,
        dataInicio: formData.dataInicio.toISOString(),
        previsaoTermino: formData.previsaoTermino.toISOString(),
      };

      if (isEdit) {
        await atualizarObra({ ...obraToEdit, ...obraData });
        Alert.alert('Sucesso', 'Obra atualizada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await adicionarObra(obraData);
        Alert.alert('Sucesso', 'Obra cadastrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a obra. Tente novamente.');
      console.error('Erro ao salvar obra:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Nome da Obra */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Obra *</Text>
              <TextInput
                style={[styles.input, errors.nome && styles.inputError]}
                value={formData.nome}
                onChangeText={(text) => handleInputChange('nome', text)}
                placeholder="Digite o nome da obra"
                maxLength={100}
              />
              {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
            </View>

            {/* Responsável */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsável *</Text>
              <TextInput
                style={[styles.input, errors.responsavel && styles.inputError]}
                value={formData.responsavel}
                onChangeText={(text) => handleInputChange('responsavel', text)}
                placeholder="Nome do responsável pela obra"
                maxLength={100}
              />
              {errors.responsavel && <Text style={styles.errorText}>{errors.responsavel}</Text>}
            </View>

            {/* Data de Início */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data de Início *</Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.dataInicio && styles.inputError]}
                onPress={() => setShowDatePicker('inicio')}
              >
                <Text style={styles.dateText}>
                  {formatDateForDisplay(formData.dataInicio)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {errors.dataInicio && <Text style={styles.errorText}>{errors.dataInicio}</Text>}
            </View>

            {/* Previsão de Término */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Previsão de Término *</Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.previsaoTermino && styles.inputError]}
                onPress={() => setShowDatePicker('termino')}
              >
                <Text style={styles.dateText}>
                  {formatDateForDisplay(formData.previsaoTermino)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {errors.previsaoTermino && <Text style={styles.errorText}>{errors.previsaoTermino}</Text>}
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.textArea, errors.descricao && styles.inputError]}
                value={formData.descricao}
                onChangeText={(text) => handleInputChange('descricao', text)}
                placeholder="Descreva os detalhes da obra"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
            </View>

            {/* Foto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Foto da Obra</Text>
              {formData.foto ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: formData.foto }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handleTakePhoto}
                  >
                    <Text style={styles.changePhotoText}>Alterar Foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                  <Ionicons name="camera-outline" size={30} color="#666" />
                  <Text style={styles.photoButtonText}>Adicionar Foto</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Localização */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Localização</Text>
              {formData.localizacao ? (
                <View style={styles.locationContainer}>
                  <View style={styles.locationInfo}>
                    <Ionicons name="location" size={20} color="#4CAF50" />
                    <Text style={styles.locationText}>
                      {formData.localizacao.endereco || 'Localização registrada'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.updateLocationButton}
                    onPress={handleGetLocation}
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? (
                      <ActivityIndicator size="small" color="#2196F3" />
                    ) : (
                      <Text style={styles.updateLocationText}>Atualizar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleGetLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color="#666" />
                  ) : (
                    <Ionicons name="location-outline" size={24} color="#666" />
                  )}
                  <Text style={styles.locationButtonText}>
                    {loadingLocation ? 'Obtendo localização...' : 'Obter Localização Atual'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Botão de Salvar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Atualizar Obra' : 'Cadastrar Obra'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showDatePicker === 'inicio' && (
          <DateTimePicker
            value={formData.dataInicio}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, 'dataInicio')}
          />
        )}
        {showDatePicker === 'termino' && (
          <DateTimePicker
            value={formData.previsaoTermino}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, 'previsaoTermino')}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changePhotoButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 8,
  },
  locationContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  updateLocationButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  updateLocationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CadastroObraScreen;