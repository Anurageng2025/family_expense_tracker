import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonRadioGroup,
  IonRadio,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [familyType, setFamilyType] = useState<'new' | 'existing'>('new');
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();
  const { setAuth } = useAuthStore();

  const handleSendOtp = async () => {
    if (!email) {
      present({
        message: 'Please enter your email',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.sendOtp(email);

      if (response.data.success) {
        present({
          message: 'OTP sent to your email!',
          duration: 2000,
          color: 'success',
        });
        setStep(2);
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to send OTP',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      present({
        message: 'Please enter the OTP',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyOtp(email, otp);

      if (response.data.success) {
        present({
          message: 'OTP verified successfully!',
          duration: 2000,
          color: 'success',
        });
        setStep(3);
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Invalid OTP',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !password) {
      present({
        message: 'Please fill in all fields',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (familyType === 'new' && !familyName) {
      present({
        message: 'Please enter family name',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (familyType === 'existing' && !familyCode) {
      present({
        message: 'Please enter family code',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register({
        email,
        password,
        name,
        ...(familyType === 'new' ? { familyName } : { familyCode }),
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken, familyCode: newFamilyCode } = response.data.data;
        setAuth(user, accessToken, refreshToken);

        if (newFamilyCode) {
          present({
            message: `Registration successful! Your family code is: ${newFamilyCode}`,
            duration: 5000,
            color: 'success',
          });
        } else {
          present({
            message: 'Registration successful!',
            duration: 2000,
            color: 'success',
          });
        }

        history.push('/dashboard');
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Registration failed',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100%',
          }}
        >
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ textAlign: 'center', fontSize: '24px' }}>
                Register
              </IonCardTitle>
              <IonText color="medium">
                <p style={{ textAlign: 'center', marginTop: '8px' }}>
                  Step {step} of 3
                </p>
              </IonText>
            </IonCardHeader>

            <IonCardContent>
              {step === 1 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                    />
                  </IonItem>

                  <IonButton
                    expand="block"
                    style={{ marginTop: '20px' }}
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Send OTP
                  </IonButton>
                </>
              )}

              {step === 2 && (
                <>
                  <IonText color="medium">
                    <p>We sent a 6-digit OTP to {email}</p>
                  </IonText>

                  <IonItem>
                    <IonLabel position="stacked">OTP</IonLabel>
                    <IonInput
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onIonChange={(e) => setOtp(e.detail.value!)}
                    />
                  </IonItem>

                  <IonButton
                    expand="block"
                    style={{ marginTop: '20px' }}
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    Verify OTP
                  </IonButton>

                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </IonButton>
                </>
              )}

              {step === 3 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Full Name</IonLabel>
                    <IonInput
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onIonChange={(e) => setName(e.detail.value!)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                    />
                  </IonItem>

                  <IonRadioGroup
                    value={familyType}
                    onIonChange={(e) => setFamilyType(e.detail.value)}
                  >
                    <IonItem>
                      <IonLabel>Create New Family</IonLabel>
                      <IonRadio slot="start" value="new" />
                    </IonItem>
                    <IonItem>
                      <IonLabel>Join Existing Family</IonLabel>
                      <IonRadio slot="start" value="existing" />
                    </IonItem>
                  </IonRadioGroup>

                  {familyType === 'new' && (
                    <IonItem>
                      <IonLabel position="stacked">Family Name</IonLabel>
                      <IonInput
                        type="text"
                        placeholder="Enter family name"
                        value={familyName}
                        onIonChange={(e) => setFamilyName(e.detail.value!)}
                      />
                    </IonItem>
                  )}

                  {familyType === 'existing' && (
                    <IonItem>
                      <IonLabel position="stacked">Family Code</IonLabel>
                      <IonInput
                        type="text"
                        placeholder="Enter family code"
                        value={familyCode}
                        onIonChange={(e) => setFamilyCode(e.detail.value!)}
                      />
                    </IonItem>
                  )}

                  <IonButton
                    expand="block"
                    style={{ marginTop: '20px' }}
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    Complete Registration
                  </IonButton>
                </>
              )}

              <IonText color="medium">
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  Already have an account?{' '}
                  <span
                    style={{ color: 'var(--ion-color-primary)', cursor: 'pointer' }}
                    onClick={() => history.push('/login')}
                  >
                    Login
                  </span>
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;

