/**
 * ProofViewer — Displays a deposit proof image from Supabase Storage
 * via a signed URL. Includes zoom and loading states.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

interface Props {
  /** Path in the Supabase Storage bucket (e.g. `proofs/abc123.jpg`) */
  proofPath: string | null;
  /** Name of the storage bucket */
  bucket?: string;
  /** Signed URL expiration in seconds */
  expiresIn?: number;
}

export function ProofViewer({
  proofPath,
  bucket = 'deposit-proofs',
  expiresIn = 3600,
}: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const fetchSignedUrl = useCallback(async () => {
    if (!proofPath) return;

    setLoadingUrl(true);
    setImageError(false);

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(proofPath, expiresIn);

      if (error) {
        console.warn('[ProofViewer] Signed URL error:', error.message);
        setImageError(true);
      } else {
        setSignedUrl(data?.signedUrl ?? null);
      }
    } catch (err) {
      console.error('[ProofViewer] Failed to get signed URL:', err);
      setImageError(true);
    } finally {
      setLoadingUrl(false);
    }
  }, [proofPath, bucket, expiresIn]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  if (!proofPath) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="image-off-outline" size={40} color={colors.disabled} />
        <Text style={styles.emptyText}>Sin comprobante</Text>
      </View>
    );
  }

  if (loadingUrl) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.walnut} />
        <Text style={styles.loadingText}>Cargando comprobante...</Text>
      </View>
    );
  }

  if (imageError || !signedUrl) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="image-broken-variant" size={40} color={colors.danger} />
        <Text style={styles.errorText}>No se pudo cargar el comprobante</Text>
        <Pressable style={styles.retryBtn} onPress={fetchSignedUrl}>
          <MaterialCommunityIcons name="refresh" size={16} color={colors.surface} />
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth - spacing.xl * 2;
  const imageHeight = imageWidth * 1.4; // Approximate receipt ratio

  return (
    <>
      <Pressable style={styles.container} onPress={() => setFullscreenVisible(true)}>
        <Image
          source={{ uri: signedUrl }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
        <View style={styles.expandHint}>
          <MaterialCommunityIcons name="arrow-expand-all" size={16} color={colors.surface} />
          <Text style={styles.expandHintText}>Toca para ampliar</Text>
        </View>
      </Pressable>

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View style={styles.fullscreenOverlay}>
          <Pressable
            style={styles.closeBtn}
            onPress={() => setFullscreenVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.surface} />
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.fullscreenScrollContent}
            maximumZoomScale={5}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              source={{ uri: signedUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    borderRadius: radii.xl,
  },
  expandHint: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(36, 37, 38, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  expandHintText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
    color: colors.surface,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.placeholder,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xl,
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.subheadline,
    color: colors.icon,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: '#FCEAE8',
    borderRadius: radii.xl,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.body,
    color: colors.danger,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.walnut,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  retryText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.subheadline,
    color: colors.surface,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing['4xl'],
    right: spacing.xl,
    zIndex: 10,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
});
