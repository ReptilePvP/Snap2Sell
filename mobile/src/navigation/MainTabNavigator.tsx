import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { adaptiveValue, spacing } from '../utils/responsive';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalysisSelectionScreen from '../screens/AnalysisSelectionScreen';
import AnalyzeGeminiScreen from '../screens/analysis/AnalyzeGeminiScreen';
import AnalyzeSerpAPIScreen from '../screens/analysis/AnalyzeSerpAPIScreen';
import AnalyzeSearchAPIScreen from '../screens/analysis/AnalyzeSearchAPIScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const AnalysisStack = createStackNavigator();

// Define the stack navigator for analysis screens
const AnalysisStackNavigator: React.FC = () => {
  const { colors } = useTheme();
  return (
    <AnalysisStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          height: adaptiveValue({
            'small-phone': 80,
            phone: 90,
            tablet: 100,
          }),
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: adaptiveValue({
            'small-phone': 16,
            phone: 18,
            tablet: 20,
          }),
        },
      }}
    >
      <AnalysisStack.Screen
        name="AnalysisSelection"
        component={AnalysisSelectionScreen}
        options={{ title: 'Analyze' }}
      />
      <AnalysisStack.Screen
        name="AnalyzeGemini"
        component={AnalyzeGeminiScreen}
        options={{ title: 'Gemini Analysis' }}
      />
      <AnalysisStack.Screen
        name="AnalyzeSerpAPI"
        component={AnalyzeSerpAPIScreen}
        options={{ title: 'SerpAPI Analysis' }}
      />
      <AnalysisStack.Screen
        name="AnalyzeSearchAPI"
        component={AnalyzeSearchAPIScreen}
        options={{ title: 'SearchAPI Analysis' }}
      />
    </AnalysisStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  const tabBarHeight = adaptiveValue({
    'small-phone': 60,
    phone: 70,
    'large-phone': 75,
    tablet: 80,
  });

  const iconSize = adaptiveValue({
    'small-phone': 20,
    phone: 24,
    'large-phone': 26,
    tablet: 28,
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Analyze') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          }
          else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: adaptiveValue({
            'small-phone': spacing.sm,
            phone: spacing.md,
            tablet: spacing.lg,
          }),
          paddingTop: spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: adaptiveValue({
            'small-phone': 10,
            phone: 12,
            tablet: 14,
          }),
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          height: adaptiveValue({
            'small-phone': 80,
            phone: 90,
            tablet: 100,
          }),
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: adaptiveValue({
            'small-phone': 16,
            phone: 18,
            tablet: 20,
          }),
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Analyze" component={AnalysisStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
