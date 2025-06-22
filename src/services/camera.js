import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'É necessário permitir o acesso à câmera para tirar fotos.',
        [
          { text: 'OK' }
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão da câmera:', error);
    return false;
  }
};

export const requestGalleryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'É necessário permitir o acesso à galeria para selecionar fotos.',
        [
          { text: 'OK' }
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão da galeria:', error);
    return false;
  }
};

export const takePicture = async (options = {}) => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      ...options,
    };

    const result = await ImagePicker.launchCameraAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    Alert.alert('Erro', 'Não foi possível acessar a câmera.');
    return null;
  }
};

export const pickFromGallery = async (options = {}) => {
  try {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return null;

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      ...options,
    };

    const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  } catch (error) {
    console.error('Erro ao selecionar da galeria:', error);
    Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    return null;
  }
};

export const showImagePickerOptions = (onImageSelected) => {
  Alert.alert(
    'Adicionar Foto',
    'Como você gostaria de adicionar uma foto?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Câmera', 
        onPress: async () => {
          const image = await takePicture();
          if (image && onImageSelected) {
            onImageSelected(image);
          }
        }
      },
      { 
        text: 'Galeria', 
        onPress: async () => {
          const image = await pickFromGallery();
          if (image && onImageSelected) {
            onImageSelected(image);
          }
        }
      },
    ]
  );
};

export const checkPermissions = async () => {
  try {
    const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.getMediaLibraryPermissionsAsync();

    return {
      camera: cameraPermission.status === 'granted',
      gallery: galleryPermission.status === 'granted',
    };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return {
      camera: false,
      gallery: false,
    };
  }
};