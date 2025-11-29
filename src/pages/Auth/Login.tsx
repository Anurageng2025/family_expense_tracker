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
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  useIonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const Login: React.FC = () => {
  const [familyCode, setFamilyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [present] = useIonToast();
  const history = useHistory();
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!familyCode || !email || !password) {
      present({
        message: 'Please fill in all fields',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.login(familyCode, email, password);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuth(user, accessToken, refreshToken);

        present({
          message: 'Login successful!',
          duration: 2000,
          color: 'success',
        });

        history.push('/dashboard');
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Login failed',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotFamilyCode = async () => {
    if (!forgotEmail) {
      present({
        message: 'Please enter your email',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.forgotFamilyCode(forgotEmail);

      if (response.data.success) {
        present({
          message: 'Family code sent to your email!',
          duration: 3000,
          color: 'success',
        });
        setShowForgotModal(false);
        setForgotEmail('');
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to send family code',
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
                Family Expense Tracker
              </IonCardTitle>
              <IonText color="medium">
                <p style={{ textAlign: 'center', marginTop: '8px' }}>
                  Login to your family account
                </p>
              </IonText>
            </IonCardHeader>

            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Family Code</IonLabel>
                <IonInput
                  type="text"
                  placeholder="Enter family code"
                  value={familyCode}
                  onIonChange={(e) => setFamilyCode(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              <IonButton
                expand="block"
                style={{ marginTop: '20px' }}
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                size="small"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Family Code?
              </IonButton>

              <IonText color="medium">
                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  Don't have an account?{' '}
                  <span
                    style={{ color: 'var(--ion-color-primary)', cursor: 'pointer' }}
                    onClick={() => history.push('/register')}
                  >
                    Register
                  </span>
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Forgot Family Code Modal */}
        <IonModal isOpen={showForgotModal} onDidDismiss={() => setShowForgotModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Forgot Family Code</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowForgotModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonText>
              <p>
                Enter your email address and we'll send your family code to your inbox.
              </p>
            </IonText>

            <IonItem style={{ marginTop: '20px' }}>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onIonChange={(e) => setForgotEmail(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              expand="block"
              style={{ marginTop: '20px' }}
              onClick={handleForgotFamilyCode}
              disabled={loading}
            >
              Send Family Code
            </IonButton>

            <IonText color="medium">
              <p style={{ fontSize: '12px', marginTop: '16px' }}>
                The family code will be sent to your registered email address along
                with your family name.
              </p>
            </IonText>
          </IonContent>
        </IonModal>

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;

