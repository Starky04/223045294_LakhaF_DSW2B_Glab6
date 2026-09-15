import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoticeCard = ({ notice }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{notice.title}</Text>
    <Text style={styles.body}>{notice.body}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  body: { fontSize: 14, color: '#444' }
});

export default NoticeCard;