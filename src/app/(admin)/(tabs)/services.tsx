/**
 * Admin — Services Management
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, Switch,
  RefreshControl, Alert, Modal, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';
import { EmptyState, LoadingSkeleton } from '@/components/ui';
import type { Service } from '@/types';

export default function AdminServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name');
    setServices((data as Service[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const openCreate = () => {
    setEditingService(null);
    setName('');
    setDuration('30');
    setPrice('0');
    setModalVisible(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(String(service.duration_minutes));
    setPrice(String(service.price));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del servicio es obligatorio.');
      return;
    }

    const durationNum = parseInt(duration, 10);
    const priceNum = parseFloat(price);

    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'La duración debe ser un número mayor a 0.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido.');
      return;
    }

    setSaving(true);

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update({
          name: name.trim(),
          duration_minutes: durationNum,
          price: priceNum,
        })
        .eq('id', editingService.id);

      if (error) Alert.alert('Error', error.message);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setModalVisible(false);
        await fetch();
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert({
          name: name.trim(),
          duration_minutes: durationNum,
          price: priceNum,
        });

      if (error) Alert.alert('Error', error.message);
      else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setModalVisible(false);
        await fetch();
      }
    }

    setSaving(false);
  };

  const toggleActive = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (error) Alert.alert('Error', error.message);
    else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await fetch();
    }
  };

  const renderItem = ({ item }: { item: Service }) => (
    <Pressable
      style={[styles.serviceCard, shadows.sm, !item.is_active && styles.inactive]}
      onPress={() => openEdit(item)}
    >
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, !item.is_active && styles.inactiveText]}>
          {item.name}
        </Text>
        <View style={styles.serviceDetails}>
          <View style={styles.detail}>
            <MaterialCommunityIcons name="timer-outline" size={14} color={colors.icon} />
            <Text style={styles.detailText}>{item.duration_minutes} min</Text>
          </View>
          <View style={styles.detail}>
            <MaterialCommunityIcons name="cash" size={14} color={colors.success} />
            <Text style={styles.detailText}>
              ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
      <Switch
        value={item.is_active}
        onValueChange={() => toggleActive(item)}
        trackColor={{ false: colors.disabled, true: colors.walnut }}
        thumbColor={colors.surface}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Servicios</Text>
        <Pressable style={styles.addBtn} onPress={openCreate}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} height={80} />)}
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={
            <EmptyState
              icon="content-cut"
              title="Sin servicios"
              message="Agrega servicios para comenzar."
            />
          }
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.lg]}>
            <Text style={styles.modalTitle}>
              {editingService ? 'Editar servicio' : 'Nuevo servicio'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Corte clásico"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Duración (min)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Precio (MXN)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="200"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.85 }]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={styles.saveText}>
                    {editingService ? 'Actualizar' : 'Crear'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.graphite,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: radii.full,
    backgroundColor: colors.walnut, alignItems: 'center', justifyContent: 'center',
  },
  skeletons: { padding: spacing.xl, gap: spacing.md },
  listContent: { padding: spacing.xl, paddingBottom: spacing['3xl'], gap: spacing.md },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.lg, gap: spacing.md,
  },
  inactive: { opacity: 0.6 },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.body, color: colors.graphite,
    marginBottom: spacing.xs,
  },
  inactiveText: { color: colors.disabled },
  serviceDetails: { flexDirection: 'row', gap: spacing.lg },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  detailText: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.subheadline, color: colors.icon,
  },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay,
    alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.xl, width: '100%', maxWidth: 420,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite,
    marginBottom: spacing.xl,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.subheadline,
    color: colors.icon, marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm, fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body, color: colors.graphite, minHeight: 44,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted,
  },
  cancelText: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.graphite,
  },
  saveBtn: {
    flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: radii.lg,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.walnut,
  },
  saveText: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.surface,
  },
});
