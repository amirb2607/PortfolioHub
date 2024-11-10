import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Link, router, useRouter } from 'expo-router';
import { app, auth, firestore } from '@/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendEmailVerification } from '@firebase/auth';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ResizeMode, Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import { doc, setDoc } from 'firebase/firestore';

const AuthScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('USA');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignup = async () => {
    if (!displayName) {
      Alert.alert('No Display Name Provided', 'Please enter a display name.');
      return;
    }
    if (!email) {
        Alert.alert('No Email Provided', 'Please enter your email address.');
        return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
    }
    if (!password) {
        Alert.alert('No Password Provided', 'Please enter your password.');
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Update profile with display name 
      await updateProfile(user, { displayName });
      // Store user info in Firestore 
      await setDoc(doc(firestore, 'users', user.uid), { 
        displayName, 
        email: user.email, 
        country,
        emailVerified: false, 
      });
      // Send email verification 
      await sendEmailVerification(user);
      console.log('Verification email sent!');
      // Sign out the user immediately after sign-up 
      await auth.signOut();
      Alert.alert('Sign Up Successful', 'Please verify your email before logging in.');
    } catch (error) {
        console.error(error.message);
        if (error.code === 'auth/wrong-password') {
            Alert.alert('Signup Failed', 'The password is invalid. Please try again.');
        } else if (error.code === 'auth/invalid-credential') {
            Alert.alert('Invalid Credentials', 'The email or password you entered is invalid. Please check your email and password and try again.');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Invalid Password', 'Your password should be at least 6 characters long!');
        }
        else {
            Alert.alert('Login Failed', 'An unknown error occurred. Please try again later.');
        }
    }
  };

  return (
    <View style={styles.container}>
      <Video
            source={require('@/assets/videos/intro.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
        />
        <BlurView intensity={50} style={styles.absolute}>
            <KeyboardAvoidingView
                style={styles.innerContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <Image source={require('@/assets/images/adaptive-icon.png')} style={styles.image} />

                    {/* Display Name Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Display Name</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="person-outline" size={20} color="#4d4d4d" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Display Name"
                                placeholderTextColor="#7a7a7a"
                            />
                        </View>
                    </View>
                    
                    {/* Email Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="mail-outline" size={20} color="#4d4d4d" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="example@domain.com"
                                placeholderTextColor="#7a7a7a"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>
                    
                    {/* Password Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="lock-closed-outline" size={20} color="#4d4d4d" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••••"
                                placeholderTextColor="#7a7a7a"
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <Icon
                                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#4d4d4d"
                                    style={styles.iconRight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Country Field in Centered Row */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapperCountry}>
                            <Icon name="globe-outline" size={20} color="#4d4d4d" style={styles.icon} />
                            <RNPickerSelect
                                onValueChange={(value) => setCountry(value)}
                                items={[
                                    { label: 'United States', value: 'USA' },
                                    { label: 'Other', value: 'Other' },
                                ]}
                                style={{
                                    inputIOS: pickerSelectStyles.input,
                                    inputAndroid: pickerSelectStyles.input,
                                }}
                                placeholder={{}}
                                value={country}
                                useNativeAndroidPickerStyle={false} // Use custom styling on Android
                            />
                        </View>
                    </View>
                    <Text></Text>              
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <View style={styles.footer}>
                      <View style={{ flexDirection: 'row' }}>
                          <Text style={styles.footerText}>Already have an Account? </Text>
                          <Text 
                              onPress={() => router.push('/login')}
                              style={styles.linkText}>
                              Log In
                          </Text>
                      </View>
                      <Text 
                          onPress={() => router.push('/ResetPasswordScreen')}
                          style={styles.linkText}
                      >
                          Forgot Password?
                      </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'space-between',
  },
  video: {
      width: '100%',
      height: '100%',
      position: 'absolute',
  },
  absolute: {
      flex: 1,
      justifyContent: 'center',
  },
  innerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  scrollView: {
      flexGrow: 1,
      alignItems: 'center',
      padding: 16,
      width: '100%',
  },
  image: {
      marginTop: 60,
      marginBottom: 40,
      borderRadius: 5,
      height: 150,
      width: 150,
  },
  inputContainer: {
      width: '100%', 
      paddingHorizontal: 24,
      marginVertical: 6, 
  },
  label: {
      fontSize: 18,
      marginBottom: 8,
      color: '#ccc',
  },
  icon: {
    marginTop: 2, 
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingHorizontal: 16,
      height: 55,
      shadowColor: '#e6e9f9',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 5,
      width: '100%',
  },
  inputWrapperCountry: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 25,
      paddingHorizontal: 8,
      height: 48,
      shadowColor: '#e6e9f9',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 5,
      width: '100%',
  },
  input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 8,
      marginLeft: 10,
      width: '100%',
  },
  button: {
    backgroundColor: '#2545bd',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  footer: {
      alignItems: 'center',
      marginBottom: 45,
  },
  footerText: {
    marginVertical: 8,
    color: '#ccc',
  },
  linkText: {
    textDecorationLine: 'underline', 
    marginVertical: 8,
    color: '#ccc',
  },
  iconRight: {
    marginLeft: 10,
    marginTop: 2,
  },
});

const pickerSelectStyles = StyleSheet.create({
  input: {
    fontSize: 16,
    paddingVertical: 21,
    paddingHorizontal: 10,
    color: 'black',
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowOpacity: 0,
  },
});

export default AuthScreen;