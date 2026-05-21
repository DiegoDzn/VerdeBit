import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CalendarScreen } from '../../features/calendar/screens/CalendarScreen';
import { CatalogScreen } from '../../features/catalog/screens/CatalogScreen';
import { ClassroomScreen } from '../../features/classroom/screens/ClassroomScreen';
import { CultureScreen } from '../../features/culture/screens/CultureScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { QuizScreen } from '../../features/quiz/screens/QuizScreen';
import { colors } from '../../theme/colors';

export type MainTabParamList = {
  Catalog: undefined;
  Classroom: undefined;
  Quiz: undefined;
  Calendar: undefined;
  Culture: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.surface,
          },
        }}
      >
        <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catálogo' }} />
        <Tab.Screen name="Classroom" component={ClassroomScreen} options={{ title: 'Aula' }} />
        <Tab.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
        <Tab.Screen name="Culture" component={CultureScreen} options={{ title: 'Cultura' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
