import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface UploadedImage {
  id: string;
  uri: string;
  name: string;
  size?: number;
}

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload images!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const newImages: UploadedImage[] = result.assets.map((asset) => ({
        id: Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
      }));

      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos!'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const newImage: UploadedImage = {
        id: Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize,
      };

      setImages((prev) => [...prev, newImage]);
    }
  };

  const removeImage = useCallback((id: string) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages((prev) => prev.filter((img) => img.id !== id));
          },
        },
      ]
    );
  }, []);

  const openLightbox = useCallback((image: UploadedImage) => {
    setSelectedImage(image);
    setModalVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    setModalVisible(false);
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <LinearGradient
        colors={['#ff6b35', '#f7931e']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.headerTitle}>ImageVault</Text>
          </View>
          <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Area */}
        <TouchableOpacity style={styles.uploadArea} onPress={showImageOptions}>
          <View style={styles.uploadContent}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={48} color="#ff6b35" />
            </View>
            <Text style={styles.uploadTitle}>Tap to add images</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo or choose from your library
            </Text>
            <Text style={styles.uploadFormats}>
              Supports JPG, PNG, GIF, and WebP formats
            </Text>
          </View>
        </TouchableOpacity>

        {/* Gallery */}
        {images.length > 0 && (
          <View style={styles.gallery}>
            <Text style={styles.galleryTitle}>
              Your Images ({images.length})
            </Text>
            <View style={styles.imageGrid}>
              {images.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  style={styles.imageCard}
                  onPress={() => openLightbox(image)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(image.id)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageName} numberOfLines={1}>
                      {image.name}
                    </Text>
                    <Text style={styles.imageSize}>
                      {formatFileSize(image.size)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>No images uploaded yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button above to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Lightbox Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeLightbox}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closeLightbox}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              {selectedImage && (
                <>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalImageName}>
                      {selectedImage.name}
                    </Text>
                    <Text style={styles.modalImageSize}>
                      {formatFileSize(selectedImage.size)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'white',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadFormats: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  gallery: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfo: {
    padding: 12,
  },
  imageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  imageSize: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: screenWidth - 40,
    height: screenHeight - 200,
    borderRadius: 12,
  },
  modalInfo: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalImageName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalImageSize: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});