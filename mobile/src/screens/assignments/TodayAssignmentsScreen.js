import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiGetTodayAssignments, apiRespondToAssignment } from '../../services/api';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../config/theme';

function statusColors(status) {
  if (status === 'confirmed') return { bg: Colors.successBg, text: Colors.success };
  if (status === 'declined') return { bg: Colors.errorBg, text: Colors.error };
  return { bg: Colors.warningBg, text: Colors.warning };
}

function AssignmentCard({ item, onRespond }) {
  const status = statusColors(item.responseStatus);

  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.role}>{item.role.toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{item.responseStatus || 'pending'}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.event?.title}</Text>
      <Text style={styles.time}>
        {item.event?.date} | {item.event?.startTime?.slice(0, 5)} - {item.event?.endTime?.slice(0, 5)}
      </Text>
      {item.event?.location ? <Text style={styles.location}>{item.event.location}</Text> : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryBtn, item.responseStatus === 'confirmed' && styles.disabledBtn]}
          onPress={() => onRespond(item.id, 'confirmed')}
          disabled={item.responseStatus === 'confirmed'}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
          <Text style={[styles.secondaryBtnText, { color: Colors.success }]}>Confirm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, item.responseStatus === 'declined' && styles.disabledBtn]}
          onPress={() => onRespond(item.id, 'declined')}
          disabled={item.responseStatus === 'declined'}
        >
          <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
          <Text style={[styles.secondaryBtnText, { color: Colors.error }]}>Decline</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => item.event?.directionsUrl && Linking.openURL(item.event.directionsUrl)}
          disabled={!item.event?.directionsUrl}
        >
          <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
          <Text style={styles.linkBtnText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => item.event?.googleCalendarUrl && Linking.openURL(item.event.googleCalendarUrl)}
          disabled={!item.event?.googleCalendarUrl}
        >
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.linkBtnText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TodayAssignmentsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiGetTodayAssignments();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load assignments');
    }

    if (silent) setRefreshing(false);
    else setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRespond = async (assignmentId, responseStatus) => {
    try {
      const updated = await apiRespondToAssignment(assignmentId, responseStatus);
      setItems((prev) => prev.map((item) => (item.id === assignmentId ? updated : item)));
    } catch (err) {
      Alert.alert('Unable to update', err.message || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.infoText}>Loading today's assignments...</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={items.length ? styles.listContent : styles.emptyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.primary} />}
          renderItem={({ item }) => <AssignmentCard item={item} onRespond={handleRespond} />}
          ListEmptyComponent={<Text style={styles.infoText}>No assignments for today.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  role: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.4,
  },
  badge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '800',
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  location: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    backgroundColor: Colors.primaryBg,
  },
  linkBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
