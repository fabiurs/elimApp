import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiGetApprovedBookings } from '../../services/api';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../config/theme';

// Generate next 7 days
function getNext7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return days;
}

// Generate 30-min time slots from 06:00 to 22:00
function generateSlots() {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push(label);
    }
  }
  return slots;
}

export default function BookRoomScreen({ route, navigation }) {
  const { room } = route.params;
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(getNext7Days, []);
  const slots = useMemo(generateSlots, []);

  // Fetch approved bookings for room + date
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiGetApprovedBookings();
        if (!Array.isArray(data)) {
          setBookedSlots([]);
          setLoading(false);
          return;
        }
        const roomId = String(room.id);
        const dayBookings = data.filter(
          (b) => String(b.roomId) === roomId && b.date === selectedDate
        );
        const blocked = [];
        for (const b of dayBookings) {
          const [sh, sm] = b.startTime.split(':').map(Number);
          const [eh, em] = b.endTime.split(':').map(Number);
          let mins = sh * 60 + sm;
          const endMins = eh * 60 + em;
          while (mins < endMins) {
            const hh = Math.floor(mins / 60).toString().padStart(2, '0');
            const mm = (mins % 60).toString().padStart(2, '0');
            blocked.push(`${hh}:${mm}`);
            mins += 30;
          }
        }
        setBookedSlots(blocked);
      } catch {
        setBookedSlots([]);
      }
      setLoading(false);
    })();
  }, [selectedDate, room.id, token]);

  // Reset selection on date change
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedDate]);

  const toggleSlot = (slot) => {
    if (bookedSlots.includes(slot)) return;

    setSelectedSlots((prev) => {
      if (prev.includes(slot)) {
        return prev.filter((s) => s !== slot);
      }
      const next = [...prev, slot].sort();
      // Ensure contiguous
      for (let i = 1; i < next.length; i++) {
        const prevIdx = slots.indexOf(next[i - 1]);
        const currIdx = slots.indexOf(next[i]);
        if (currIdx !== prevIdx + 1) {
          Alert.alert('Invalid Selection', 'Please select contiguous time slots.');
          return prev;
        }
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Selection', 'Please select at least one time slot.');
      return;
    }
    const sorted = [...selectedSlots].sort();
    const start = sorted[0];
    // End time is 30 min after the last selected slot
    const lastSlot = sorted[sorted.length - 1];
    const [lh, lm] = lastSlot.split(':').map(Number);
    const endMins = lh * 60 + lm + 30;
    const end = `${Math.floor(endMins / 60).toString().padStart(2, '0')}:${(endMins % 60).toString().padStart(2, '0')}`;

    navigation.navigate('ConfirmBooking', {
      room,
      date: selectedDate,
      startTime: start,
      endTime: end,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Room info header */}
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>Capacity: {room.capacity}</Text>
          </View>
        </View>

        {/* Date picker */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.date}
              style={[styles.dateCard, selectedDate === day.date && styles.dateCardActive]}
              onPress={() => setSelectedDate(day.date)}
            >
              <Text style={[styles.dateDayName, selectedDate === day.date && styles.dateTextActive]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dateDayNum, selectedDate === day.date && styles.dateTextActive]}>
                {day.dayNum}
              </Text>
              <Text style={[styles.dateMonth, selectedDate === day.date && styles.dateTextActive]}>
                {day.month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time slots */}
        <Text style={styles.sectionTitle}>Select Time</Text>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map((slot) => {
              const booked = bookedSlots.includes(slot);
              const selected = selectedSlots.includes(slot);
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slot,
                    booked && styles.slotBooked,
                    selected && styles.slotSelected,
                  ]}
                  onPress={() => toggleSlot(slot)}
                  disabled={booked}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.slotText,
                      booked && styles.slotTextBooked,
                      selected && styles.slotTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      {selectedSlots.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>
              {selectedSlots[0]} – {(() => {
                const last = selectedSlots[selectedSlots.length - 1];
                const [lh, lm] = last.split(':').map(Number);
                const em = lh * 60 + lm + 30;
                return `${Math.floor(em / 60).toString().padStart(2, '0')}:${(em % 60).toString().padStart(2, '0')}`;
              })()}
            </Text>
            <Text style={styles.bottomSub}>
              {selectedSlots.length * 30} min · {selectedDate}
            </Text>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  roomHeader: {
    marginBottom: Spacing.xl,
  },
  roomName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  dateScroll: {
    marginBottom: Spacing.sm,
  },
  dateCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
    minWidth: 70,
    ...Shadow.sm,
  },
  dateCardActive: {
    backgroundColor: Colors.primary,
  },
  dateDayName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateDayNum: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.text,
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  dateTextActive: {
    color: '#FFF',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 72,
    alignItems: 'center',
  },
  slotBooked: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  slotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  slotTextBooked: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  slotTextSelected: {
    color: '#FFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  bottomSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  continueBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
