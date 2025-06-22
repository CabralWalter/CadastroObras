import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permissão de localização negada');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de localização:', error);
    throw error;
  }
};

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      await requestLocationPermission();
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 15000,
      maximumAge: 10000,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Erro ao obter localização:', error);
    throw error;
  }
};

export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      
      const formattedAddress = [
        address.street,
        address.streetNumber,
        address.district,
        address.city,
        address.region,
        address.postalCode,
      ]
        .filter(item => item && item.trim() !== '')
        .join(', ');
      
      return formattedAddress || 'Endereço não encontrado';
    }
    
    return 'Endereço não encontrado';
    
  } catch (error) {
    console.error('Erro ao obter endereço:', error);
    return 'Erro ao obter endereço';
  }
};

export const getCompleteLocation = async () => {
  try {
    const coordinates = await getCurrentLocation();
    const address = await getAddressFromCoordinates(
      coordinates.latitude,
      coordinates.longitude
    );
    
    return {
      ...coordinates,
      endereco: address,
    };
  } catch (error) {
    console.error('Erro ao obter localização completa:', error);
    throw error;
  }
};

export const isLocationEnabled = async () => {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Erro ao verificar serviço de localização:', error);
    return false;
  }
};