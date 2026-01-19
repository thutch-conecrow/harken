import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import {
  HarkenProvider,
  createSecureStoreAdapter,
} from '@harken/sdk-react-native';

import { FeedbackSheet } from '@harken/sdk-react-native/attachments';

// Create storage adapter for persisting anonymous ID
const storage = createSecureStoreAdapter(SecureStore);

export default function App() {
  return (
    <HarkenProvider
      config={{
        publishableKey: 'pk_test_example',
        debug: true,
      }}
      storage={storage}
    >
      <FeedbackSheet
        title="Harken SDK Example"
        enableAttachments
        maxAttachments={5}
        // Configure which attachment sources are available
        // With only one enabled, the picker modal is skipped
        attachmentSources={{
          camera: true,
          library: true,
          files: false, // Disable document picker
        }}
        onSuccess={(result) => {
          // In a real app, you might navigate back or close a modal
          console.log('Feedback submitted:', result.id);
        }}
      />
      <StatusBar style="auto" />
    </HarkenProvider>
  );
}
