import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiCreateBooking } from '../../services/api';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../config/theme';

export default function ConfirmBookingScreen({ route, navigation }) {
  const { room, date, startTime, endTime } = route.params;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a booking title.');
      return;
    }
    setLoading(true);
    try {
      await apiCreateBooking({
        roomId: room.id,
        date,
        startTime,
        endTime,
        title: title.trim(),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Your booking has been submitted for approval.', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'My Bookings' }) },
      ]);
    } catch (err) {
      Alert.alert('Booking Failed', err.message);
    }
    setLoading(false);
  };

  // Format date for display
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Confirm Your Booking</Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Ionicons name="business-outline" size={20} color={Colors.primary} />
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryLabel}>Room</Text>
            <Text style={styles.summaryValue}>{room.name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{displayDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{startTime} – {endTime}</Text>
          </View>
        </View>
      </View>

      {/* Title Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Booking Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Youth Group Meeting"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {/* Notes Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Notes <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional details..."
          placeholderTextColor={Colors.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Status notice */}
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={styles.noticeText}>
          Your booking will be pending until approved by an admin.
        </Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmBtn, (loading || !title.trim()) && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        disabled={loading || !title.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  heading: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxl,
    ...Shadow.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  optional: {
    color: Colors.textLight,
    fontWeight: '400',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    gap: Spacing.sm,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
