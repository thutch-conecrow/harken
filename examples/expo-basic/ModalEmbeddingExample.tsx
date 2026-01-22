import React, { useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HarkenProvider, FeedbackSheet } from '@harkenapp/sdk-react-native';
import type { PartialHarkenTheme } from '@harkenapp/sdk-react-native';

/**
 * Minimal dark theme for modal embedding.
 *
 * This recipe shows the essential tokens needed when embedding
 * FeedbackSheet in a dark-themed bottom sheet or modal.
 */
const modalDarkTheme: PartialHarkenTheme = {
  colors: {
    // Base surface - match your modal's background
    surface: '#2d2d2d',

    // Chip tokens - must contrast with surface
    chipBackground: '#3d3d3d',
    chipBorder: '#4d4d4d',
    chipBackgroundSelected: '#0066ff',
    chipBorderSelected: '#0066ff',

    // Form background - set to transparent to inherit modal background
    // (defaults to background color, so must be explicit for modal embedding)
    formBackground: 'transparent',

    // Text colors for dark mode
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textPlaceholder: '#666666',

    // Primary action color
    primary: '#0066ff',

    // Input styling
    inputBackground: '#3d3d3d',
    inputBorder: '#4d4d4d',
    inputBorderFocused: '#0066ff',
  },
};

/**
 * Example demonstrating FeedbackSheet embedded in a modal.
 *
 * Key techniques:
 * - `layout="auto"` - Prevents flex:1 from collapsing in modal context
 * - `title=""` - Hides title when modal has its own header
 * - Dark theme tokens - Ensures chips/inputs are visible on dark surface
 * - `containerStyle` - Optional escape hatch for layout tweaks
 */
export default function ModalEmbeddingExample() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSuccess = () => {
    // Close modal after successful submission
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Modal Embedding Example</Text>
        <Text style={styles.description}>
          This demonstrates embedding FeedbackSheet in a dark-themed modal
          using layout="auto" and minimal theme tokens.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Open Feedback Modal</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <HarkenProvider
          config={{
            publishableKey: 'pk_test_example',
            debug: true,
          }}
          themeMode="dark"
          darkTheme={modalDarkTheme}
        >
          <View style={styles.modalContainer}>
            {/* Custom modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Feedback</Text>
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            {/* FeedbackSheet with modal-friendly settings */}
            <FeedbackSheet
              layout="auto"
              title=""
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              showSuccessAlert={false}
              containerStyle={styles.feedbackContainer}
              contentStyle={styles.feedbackContent}
            />
          </View>
        </HarkenProvider>
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#999',
    lineHeight: 28,
  },
  feedbackContainer: {
    // No flex:1 needed since layout="auto"
  },
  feedbackContent: {
    paddingTop: 16,
  },
});
