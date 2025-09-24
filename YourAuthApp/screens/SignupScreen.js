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
// const API_URL = 'http://192.168.1.34:3000'; // e.g., 'http://192.168.1.5:3000'

const SignupScreen = ({ navigation }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!employeeId.trim() || !name.trim() || !password.trim()) {
            Alert.alert('Signup Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, name, password }),
            });

            const data = await response.json();

            if (response.status === 201) {
                Alert.alert('Success!', 'Registration complete. You can now log in.');
                navigation.goBack();
            } else {
                Alert.alert('Registration Failed', data.message || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Connection Error', 'Unable to connect to the server. Check your network and firewall settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Text style={styles.title}>Create Account</Text>

            <TextInput style={styles.input} placeholder="Employee ID (e.g., EMP-002)" placeholderTextColor="#888" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888" value={name} onChangeText={setName} />

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

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f0f4f7' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1a2a44', textAlign: 'center', marginBottom: 40 },
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
    button: { width: '100%', height: 50, backgroundColor: '#218838', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 3 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#0052cc', fontSize: 16 },
});

export default SignupScreen;

