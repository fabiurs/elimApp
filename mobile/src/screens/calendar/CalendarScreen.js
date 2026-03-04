import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiGetApprovedBookings } from '../../services/api';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../config/theme';

function getWeekDays(startDate) {
  const days = [];
  const start = new Date(startDate);
  // Adjust to Monday
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
    });
  }
  return days;
}

export default function CalendarScreen() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await apiGetApprovedBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const map = {};
    for (const day of weekDays) {
      map[day.date] = bookings.filter((b) => b.date === day.date);
    }
    return map;
  }, [bookings, weekDays]);

  const weekLabel = `${weekDays[0]?.date} — ${weekDays[6]?.date}`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Week navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekOffset((p) => p - 1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.weekLabelBox}>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          {weekOffset !== 0 && (
            <TouchableOpacity onPress={() => setWeekOffset(0)}>
              <Text style={styles.todayLink}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Days */}
      {weekDays.map((day) => {
        const dayBookings = bookingsByDay[day.date] || [];
        return (
          <View key={day.date} style={styles.daySection}>
            <View style={[styles.dayHeader, day.isToday && styles.dayHeaderToday]}>
              <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
                {day.dayNum}
              </Text>
            </View>

            {dayBookings.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>No bookings</Text>
              </View>
            ) : (
              dayBookings.map((b) => (
                <View key={b.id} style={styles.eventCard}>
                  <View style={styles.eventTime}>
                    <Text style={styles.eventTimeText}>
                      {b.startTime?.slice(0, 5)}
                    </Text>
                    <Text style={styles.eventTimeDash}>–</Text>
                    <Text style={styles.eventTimeText}>
                      {b.endTime?.slice(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {b.title || 'Booking'}
                    </Text>
                    <Text style={styles.eventRoom}>
                      {b.Room?.name || `Room #${b.roomId}`}
                      {b.User ? ` · ${b.User.name}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navBtn: {
    padding: Spacing.sm,
  },
  weekLabelBox: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  todayLink: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  daySection: {
    marginBottom: Spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayHeaderToday: {
    borderBottomColor: Colors.primary,
  },
  dayName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayNameToday: {
    color: Colors.primary,
  },
  dayNum: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  dayNumToday: {
    color: Colors.primary,
  },
  emptyDay: {
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  emptyDayText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  eventTime: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  eventTimeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  eventTimeDash: {
    fontSize: FontSize.xs,
    color: Colors.primaryLight,
  },
  eventDetails: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  eventRoom: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
