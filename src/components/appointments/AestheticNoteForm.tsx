/**
 * AestheticNoteForm — Create/edit aesthetic notes on appointments.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import type { AestheticNote } from '@/types';

interface Props {
  /** Existing note for editing, or null for creating */
  existingNote?: AestheticNote | null;
  /** Callback with form data on save */
  onSave: (data: {
    procedure: string;
    products_used: string | null;
    observations: string | null;
    recommendations: string | null;
  }) => Promise<void>;
  /** Cancel callback */
  onCancel: () => void;
  /** Loading state */
  saving?: boolean;
}

export function AestheticNoteForm({
  existingNote = null,
  onSave,
  onCancel,
  saving = false,
}: Props) {
  const [procedure, setProcedure] = useState(existingNote?.procedure ?? '');
  const [productsUsed, setProductsUsed] = useState(existingNote?.products_used ?? '');
  const [observations, setObservations] = useState(existingNote?.observations ?? '');
  const [recommendations, setRecommendations] = useState(existingNote?.recommendations ?? '');

  const isEditing = !!existingNote;

  const handleSave = useCallback(async () => {
    if (!procedure.trim()) {
      Alert.alert('Error', 'El campo "Procedimiento" es obligatorio.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await onSave({
      procedure: procedure.trim(),
      products_used: productsUsed.trim() || null,
      observations: observations.trim() || null,
      recommendations: recommendations.trim() || null,
    });
  }, [procedure, productsUsed, observations, recommendations, onSave]);

  return (
    <View style={[styles.container, shadows.sm]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="clipboard-text-outline"
          size={20}
          color={colors.walnut}
        />
        <Text style={styles.title}>
          {isEditing ? 'Editar nota estética' : 'Nueva nota estética'}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Procedimiento *</Text>
        <TextInput
          style={styles.input}
          value={procedure}
          onChangeText={setProcedure}
          placeholder="Ej: Corte degradado, barba perfilada"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Productos utilizados</Text>
        <TextInput
          style={styles.input}
          value={productsUsed}
          onChangeText={setProductsUsed}
          placeholder="Ej: Cera mate, aceite para barba"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={styles.input}
          value={observations}
          onChangeText={setObservations}
          placeholder="Ej: Cabello grueso, remolino lado derecho"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Recomendaciones</Text>
        <TextInput
          style={styles.input}
          value={recommendations}
          onChangeText={setRecommendations}
          placeholder="Ej: Próxima cita en 3 semanas, usar shampoo anticaspa"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={18} color={colors.surface} />
              <Text style={styles.saveText}>{isEditing ? 'Actualizar' : 'Guardar'}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/**
 * AestheticNoteCard — Read-only display of a note.
 */
export function AestheticNoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: AestheticNote;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const date = new Date(note.created_at).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <View style={[styles.card, shadows.sm]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="clipboard-text" size={16} color={colors.walnut} />
        <Text style={styles.cardDate}>{date}</Text>
        {(onEdit || onDelete) && (
          <View style={styles.cardActions}>
            {onEdit && (
              <Pressable onPress={onEdit} hitSlop={8}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.icon} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable onPress={onDelete} hitSlop={8}>
                <MaterialCommunityIcons name="delete-outline" size={18} color={colors.danger} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.cardField}>
        <Text style={styles.cardLabel}>Procedimiento</Text>
        <Text style={styles.cardValue}>{note.procedure}</Text>
      </View>

      {note.products_used && (
        <View style={styles.cardField}>
          <Text style={styles.cardLabel}>Productos</Text>
          <Text style={styles.cardValue}>{note.products_used}</Text>
        </View>
      )}

      {note.observations && (
        <View style={styles.cardField}>
          <Text style={styles.cardLabel}>Observaciones</Text>
          <Text style={styles.cardValue}>{note.observations}</Text>
        </View>
      )}

      {note.recommendations && (
        <View style={[styles.cardField, styles.recommendationField]}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={colors.oliveGold} />
          <Text style={[styles.cardValue, { color: colors.oliveGold, flex: 1 }]}>
            {note.recommendations}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.headline,
    color: colors.graphite,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.subheadline,
    color: colors.icon,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.graphite,
    minHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  cancelText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.callout,
    color: colors.graphite,
  },
  saveBtn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.walnut,
  },
  saveText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
  pressed: { opacity: 0.85 },
  btnDisabled: { opacity: 0.5 },
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardDate: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.caption,
    color: colors.icon,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardField: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.caption,
    color: colors.icon,
    marginBottom: 2,
  },
  cardValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.graphite,
    lineHeight: typography.lineHeights.body,
  },
  recommendationField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#FFF9EE',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
});
