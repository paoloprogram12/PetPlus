import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import PetListScreen from "./src/screens/PetListScreen";
import AddPetScreen from "./src/screens/AddPetScreen";
import LogCareScreen from "./src/screens/LogCareScreen";
import TodayScreen from "./src/screens/TodayScreen";

type PetStackParamList = {
  PetList: undefined;
  AddPet: undefined;
};

const Tab = createBottomTabNavigator();
const PetStack = createNativeStackNavigator<PetStackParamList>();

function PetStackScreen() {
  return (
    <PetStack.Navigator id="PetStack">
      <PetStack.Screen
        name="PetList"
        component={PetListScreen}
        options={{ title: "My Pets" }}
      />
      <PetStack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ title: "Add Pet" }}
      />
    </PetStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        id="MainTabs"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "paw";
            if (route.name === "Pets") iconName = "paw";
            else if (route.name === "Log Care") iconName = "add-circle";
            else if (route.name === "Today") iconName = "checkmark-done";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007aff",
        })}
      >
        <Tab.Screen
          name="Pets"
          component={PetStackScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Log Care" component={LogCareScreen} />
        <Tab.Screen name="Today" component={TodayScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
