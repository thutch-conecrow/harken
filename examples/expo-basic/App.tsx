import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Core SDK imports
import {
  HarkenProvider,
  createSecureStoreAdapter,
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  DEFAULT_CATEGORIES,
  useHarkenTheme,
  useFeedback,
  type FeedbackCategory,
} from '@harken/sdk-react-native';

// Attachment features
import {
  useAttachmentUpload,
  AttachmentPicker,
  AttachmentGrid,
} from '@harken/sdk-react-native/attachments';

// Create storage adapter for persisting anonymous ID
const storage = createSecureStoreAdapter(SecureStore);

function FeedbackForm() {
  const theme = useHarkenTheme();
  const { submitFeedback, isSubmitting, error, clearError, isInitializing } =
    useFeedback();
  const {
    attachments,
    pickImage,
    pickDocument,
    removeAttachment,
    retryAttachment,
    getAttachmentIds,
    hasActiveUploads,
  } = useAttachmentUpload();

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      clearError();
      const result = await submitFeedback({
        message: message.trim(),
        category,
        attachments: getAttachmentIds(),
      });

      const uploadNote = hasActiveUploads
        ? '\n\nAttachments are still uploading in the background.'
        : '';

      Alert.alert(
        'Success',
        `Feedback submitted!\nID: ${result.feedback_id}${uploadNote}`,
        [{ text: 'OK', onPress: () => setMessage('') }]
      );
    } catch (e) {
      Alert.alert(
        'Submission Failed',
        error?.message || 'Failed to submit feedback. Please try again.'
      );
    }
  };

  const handlePickerOption = async (source: 'camera' | 'library' | 'document') => {
    setShowPicker(false);
    try {
      if (source === 'document') {
        await pickDocument();
      } else {
        await pickImage(source);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText variant="title" style={styles.title}>
          Harken SDK Example
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Complete Feedback Form with Attachments
        </ThemedText>

        {isInitializing ? (
          <ThemedText variant="caption" style={styles.loadingText}>
            Initializing...
          </ThemedText>
        ) : (
          <View style={styles.form}>
            <ThemedText variant="label" style={styles.label}>
              Category
            </ThemedText>
            <CategorySelector
              categories={DEFAULT_CATEGORIES}
              value={category}
              onChange={setCategory}
            />

            <ThemedText variant="label" style={styles.label}>
              Message
            </ThemedText>
            <ThemedTextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your feedback..."
              multiline
              numberOfLines={4}
              style={styles.textInput}
            />

            <ThemedText variant="label" style={styles.label}>
              Attachments
            </ThemedText>
            <AttachmentGrid
              attachments={attachments}
              onRemove={removeAttachment}
              onRetry={retryAttachment}
              onAdd={() => setShowPicker(true)}
              maxAttachments={5}
            />

            {error && (
              <ThemedText variant="caption" style={styles.errorText}>
                {error.message}
              </ThemedText>
            )}

            <ThemedButton
              title={isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              onPress={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              variant="primary"
              style={styles.submitButton}
            />

            {hasActiveUploads && (
              <ThemedText variant="caption" style={styles.uploadingText}>
                Uploads in progress - you can still submit now
              </ThemedText>
            )}
          </View>
        )}

        <StatusBar style="auto" />
      </ScrollView>

      <AttachmentPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onTakePhoto={() => handlePickerOption('camera')}
        onPickFromLibrary={() => handlePickerOption('library')}
        onPickDocument={() => handlePickerOption('document')}
      />
    </KeyboardAvoidingView>
  );
}

export default function App() {
  return (
    <HarkenProvider
      config={{
        publishableKey: 'pk_test_example',
        debug: true,
      }}
      storage={storage}
    >
      <FeedbackForm />
    </HarkenProvider>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingText: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
  },
  uploadingText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6366f1',
  },
  submitButton: {
    marginTop: 24,
  },
});
