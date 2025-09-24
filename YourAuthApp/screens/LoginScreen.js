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
} from 'react-native';

// ❗ IMPORTANT: This MUST be your computer's local IPv4 address.
// const API_URL = '192.168.1.34'; // e.g., 'http://192.168.1.5:3000'

const LoginScreen = ({ navigation }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!employeeId.trim() || !password.trim()) {
            Alert.alert('Login Error', 'Please enter both Employee ID and Password.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                navigation.replace('Home', { employee: data.employee });
            } else {
                Alert.alert('Login Failed', data.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert(
                'Connection Error',
                'Unable to connect to the server. Check your network, IP address, and firewall settings.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Text style={styles.title}>Hybrid QR Attendance</Text>
            <Text style={styles.subtitle}>Employee Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Employee ID (e.g., EMP-001)"
                placeholderTextColor="#888"
                value={employeeId}
                onChangeText={setEmployeeId}
                autoCapitalize="characters"
            />
            {/* New Password Input Group */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible} // Toggle based on state
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                    <Text style={styles.eyeText}>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Signup')}
            >
                <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f0f4f7' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1a2a44', textAlign: 'center' },
    subtitle: { fontSize: 18, color: '#555', textAlign: 'center', marginBottom: 40 },
    input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    // Styles for the new password input with show/hide button
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 16,
    },
    eyeButton: {
        paddingHorizontal: 15,
        height: '100%',
        justifyContent: 'center',
    },
    eyeText: {
        color: '#0052cc',
        fontWeight: '600',
    },
    // End new styles
    button: { width: '100%', height: 50, backgroundColor: '#0052cc', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#0052cc', fontSize: 16 },
});

export default LoginScreen;

