import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const PDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Customer Name: {data.customerName}</Text>
        <Text>Customer Address: {data.customerAddress}</Text>
        <Text>Order Date: {data.date}</Text>
      </View>
    </Page>
  </Document>
);

export default PDFDocument;
