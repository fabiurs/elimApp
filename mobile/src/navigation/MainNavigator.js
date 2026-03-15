import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSize } from '../config/theme';

import RoomsScreen from '../screens/rooms/RoomsScreen';
import BookRoomScreen from '../screens/booking/BookRoomScreen';
import ConfirmBookingScreen from '../screens/booking/ConfirmBookingScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: '700', fontSize: FontSize.lg },
  headerShadowVisible: false,
};

// Rooms stack (rooms list -> book -> confirm)
function RoomsStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="RoomsList"
        component={RoomsScreen}
        options={{ title: 'Rooms' }}
      />
      <Stack.Screen
        name="BookRoom"
        component={BookRoomScreen}
        options={({ route }) => ({ title: `Book: ${route.params.room.name}` })}
      />
      <Stack.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{ title: 'Confirm Booking' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Rooms':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'My Bookings':
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Admin':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Rooms" component={RoomsStack} />
      <Tab.Screen
        name="My Bookings"
        component={MyBookingsScreen}
        options={{
          ...headerOptions,
          headerShown: true,
          title: 'My Bookings',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          ...headerOptions,
          headerShown: true,
          title: 'Calendar',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{
            ...headerOptions,
            headerShown: true,
            title: 'Admin Dashboard',
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          ...headerOptions,
          headerShown: true,
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
