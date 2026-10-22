git add .AppBlockerScreen// AppBlockerScreen.js
// Real App Blocker for Locked In — Android.
// Requires: npx expo install expo-app-blocker
// Then add "expo-app-blocker" to the "plugins" array in app.json and rebuild
// (npx expo prebuild --clean) since this needs native code — it will NOT
// work in Expo Go or in the web/Snack preview.

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Switch } from 'react-native';
import {
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  getInstalledApps,
  getBlockedApps,
  setBlockedApps,
  startMonitoring,
  stopMonitoring,
} from 'expo-app-blocker';

export default function AppBlockerScreen() {
  const [permissions, setPermissions] = useState(null); // null = checking
  const [apps, setApps] = useState([]);
  const [blocked, setBlocked] = useState([]); // array of package names
  const [search, setSearch] = useState('');
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  async function checkPermissions() {
    const status = await getPermissionStatus();
    setPermissions(status);
    if (status.allGranted) {
      loadApps();
    }
  }

  async function loadApps() {
    const installed = await getInstalledApps(); // [{ packageName, name }]
    const current = getBlockedApps(); // string[]
    // Hide this app itself and common system packages from the pick list
    const filtered = installed.filter(a => !a.packageName.startsWith('android.') && a.name);
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setApps(filtered);
    setBlocked(current || []);
  }

  function toggleApp(packageName) {
    const next = blocked.includes(packageName)
      ? blocked.filter(p => p !== packageName)
      : [...blocked, packageName];
    setBlocked(next);
    setBlockedApps(next);
  }

  function toggleMonitoring() {
    if (monitoring) {
      stopMonitoring();
      setMonitoring(false);
    } else {
      startMonitoring();
      setMonitoring(true);
    }
  }

  const visibleApps = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.trim().toLowerCase();
    return apps.filter(a => a.name.toLowerCase().includes(q));
  }, [apps, search]);

  if (permissions === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.sub}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permissions.allGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>App Blocker</Text>
        <Text style={styles.sub}>
          Blocking apps needs two permissions Android requires you to grant manually — there's no normal popup for these.
        </Text>

        <TouchableOpacity style={styles.btn} onPress={openUsageStatsSettings}>
          <Text style={styles.btnText}>1. Grant Usage Access</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Lets the app see which app is currently open.</Text>

        <TouchableOpacity style={styles.btn} onPress={openOverlaySettings}>
          <Text style={styles.btnText}>2. Grant "Display over other apps"</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Lets the app show the block screen on top of a blocked app.</Text>

        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={checkPermissions}>
          <Text style={styles.btnText}>I granted both — Check again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Blocker</Text>
      <Text style={styles.sub}>{blocked.length} app{blocked.length === 1 ? '' : 's'} blocked</Text>

      <TouchableOpacity style={[styles.btn, monitoring && styles.btnActive]} onPress={toggleMonitoring}>
        <Text style={styles.btnText}>{monitoring ? 'Blocking is ON — tap to pause' : 'Blocking is OFF — tap to start'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search installed apps"
        placeholderTextColor="#9a9ba3"
      />

      <FlatList
        data={visibleApps}
        keyExtractor={(item) => item.packageName}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.appName} numberOfLines={1}>{item.name}</Text>
            <Switch
              value={blocked.includes(item.packageName)}
              onValueChange={() => toggleApp(item.packageName)}
              trackColor={{ false: '#2a2c36', true: '#e3364c' }}
              thumbColor="#fff"
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.sub}>No apps found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0c10', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sub: { color: '#9a9ba3', fontSize: 13, marginTop: 6, marginBottom: 14 },
  hint: { color: '#9a9ba3', fontSize: 11, marginTop: -10, marginBottom: 14 },
  search: {
    backgroundColor: '#15161c',
    borderWidth: 1,
    borderColor: '#2a2c36',
    borderRadius: 10,
    padding: 11,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2c36',
  },
  appName: { color: '#fff', fontSize: 14, flex: 1, marginRight: 12 },
  btn: {
    backgroundColor: '#e3364c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnActive: { backgroundColor: '#1f8a3c' },
  btnOutline: { backgroundColor: '#1c1e26' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
