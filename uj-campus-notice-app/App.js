import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoticeCard from './src/components/NoticeCard';

const CACHE_KEY = '@uj/notices/cache';
const TIME_KEY = '@uj/notices/lastUpdated';
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export default function App() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadNotices = async () => {
    setLoading(true);
    setError(null);
    let cacheExists = false;

    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const cachedTime = await AsyncStorage.getItem(TIME_KEY);
      if (cachedData) {
        setNotices(JSON.parse(cachedData));
        setLastUpdated(cachedTime);
        cacheExists = true;
      }
    } catch (e) {
      console.error("Cache read failed");
    }

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response failed');
      const data = await response.json();
      const firstTen = data.slice(0, 10);
      
      setNotices(firstTen);
      setLastUpdated(null); 
      
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeString = `Saved copy Last updated ${timeNow}`;
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(firstTen));
      await AsyncStorage.setItem(TIME_KEY, timeString);

    } catch (err) {
      if (!cacheExists) {
        setError("Unable to load notices. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const clearCache = async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(TIME_KEY);
    setNotices([]);
    setLastUpdated(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>UJ Campus Notices</Text>
      {lastUpdated && !loading && !error && <Text style={styles.offlineText}>{lastUpdated}</Text>}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={loadNotices}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && (
        <FlatList
          data={notices}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <NoticeCard notice={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={loadNotices}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCache}>
          <Text style={styles.buttonText}>Clear Saved Notices</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 15, backgroundColor: '#fff' },
  offlineText: { textAlign: 'center', color: '#ff8c00', padding: 5, fontWeight: '600' },
  errorContainer: { padding: 20, alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff' },
  button: { backgroundColor: '#007bff', padding: 12, borderRadius: 6 },
  clearButton: { backgroundColor: '#dc3545' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});