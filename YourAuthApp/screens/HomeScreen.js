import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

/**
 * A placeholder screen for after a user successfully logs in.
 */
const HomeScreen = ({ route }) => {
    // Get the employee data passed from the Login screen
    const { employee } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome!</Text>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeeId}>ID: {employee.employee_id}</Text>
                <Text style={styles.infoText}>You have successfully logged in.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1a2a44',
        marginBottom: 16,
    },
    employeeName: {
        fontSize: 24,
        color: '#333',
        marginBottom: 8,
    },
    employeeId: {
        fontSize: 18,
        color: '#555',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default HomeScreen;
