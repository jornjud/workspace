import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../../shared/utils/firebase';
import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { COLORS } from '../../shared/constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }

    setLoading(true);
    try {
      // Format phone number to +66
      const formattedPhone = '+66' + phone.substring(1);
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone);
      setVerificationId(confirmation.verificationId);
      Alert.alert('Success', 'OTP ส่งไปยังเบอร์ของคุณแล้ว');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp || !verificationId) return;

    setLoading(true);
    try {
      // TODO: Implement OTP verification
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Maopay</Text>
      <Text style={styles.slogan}>อาหารส่งถึงมือ ทุกมื้อสะดวก</Text>

      {!verificationId ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="เบอร์โทรศัพท์"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={sendOTP} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="รหัส OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={verifyOTP} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>ยังไม่มีบัญชี? สมัครสมาชิก</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    color: COLORS.primary,
    fontSize: 14,
  },
});
