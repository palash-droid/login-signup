import React, { useState } from 'react';
import { API_URL } from '../config';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';

// ❗ IMPORTANT: This MUST be your computer's local IPv4 address.
// const API_URL = 'http://192.168.1.34:3000';

const ForgotPasswordScreen = ({ navigation }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenSent, setTokenSent] = useState(false);

    const handleSendResetToken = async () => {
        if (!employeeId.trim()) {
            Alert.alert('Error', 'Please enter your Employee ID.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId.toUpperCase() }),
            });
            const data = await response.json();
            if (response.ok) {
                setTokenSent(true);
                Alert.alert('Token Sent', 'A reset token has been generated. Check your server console for the token.');
            } else {
                Alert.alert('Error', data.message || 'Could not process request.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Connection Error', 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetToken.trim() || !newPassword.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId.toUpperCase(),
                    token: resetToken,
                    newPassword: newPassword,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Your password has been reset. Please log in.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', data.message || 'Could not reset password.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Connection Error', 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Forgot Password</Text>
                {!tokenSent ? (
                    <>
                        <Text style={styles.instructions}>Enter your Employee ID to receive a reset token.</Text>
                        <TextInput style={styles.input} placeholder="Employee ID" placeholderTextColor="#888" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />
                        <TouchableOpacity style={styles.button} onPress={handleSendResetToken} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Token</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.instructions}>A token was generated on the server. Enter it below along with your new password.</Text>
                        <TextInput style={styles.input} placeholder="Reset Token" placeholderTextColor="#888" value={resetToken} onChangeText={setResetToken} />
                        <TextInput style={styles.input} placeholder="New Password (min. 6 characters)" placeholderTextColor="#888" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f7' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24, },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1a2a44', textAlign: 'center', marginBottom: 20 },
    instructions: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30 },
    input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    button: { width: '100%', height: 50, backgroundColor: '#0052cc', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ForgotPasswordScreen;
