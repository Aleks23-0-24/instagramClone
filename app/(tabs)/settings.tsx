import ThemedButton from '@/components/ThemedButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, TextInput, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

import { getApiBase, initRuntimeConfig, safeGetItem, safeSetItem } from '@/app/utils/runtimeConfig';

export default function SettingsScreen() {
  const ctx = useContext(ThemeContext)!;
  const isDark = ctx.theme === 'dark';
  const [apiHost, setApiHost] = useState('');

  useEffect(() => {
    (async () => {
      const host = await safeGetItem('API_HOST');
      if (host) setApiHost(host);
      else setApiHost(getApiBase());
    })();
  }, []);

  const saveHost = async () => {
    try {
      await safeSetItem('API_HOST', apiHost);
      await initRuntimeConfig();
      Alert.alert('Saved', 'API host saved. Restart app or reload to apply.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save host');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        <ThemedText>Dark theme</ThemedText>
        <Switch value={isDark} onValueChange={(val) => ctx.setTheme(val ? 'dark' : 'light')} />
      </View>

      <View style={{ marginTop: 16 }}>
        <ThemedText>API Host (e.g. http://192.168.1.92:3000/api)</ThemedText>
        <TextInput value={apiHost} onChangeText={setApiHost} style={{ borderWidth:1, borderColor:'#444', padding:8, marginVertical:20, borderRadius:6, color:'white' }} />
        <ThemedButton title="Save API Host" style={{color:'#fff'}} onPress={saveHost} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingTop:44, paddingHorizontal:16 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12 },
});
