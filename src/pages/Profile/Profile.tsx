import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonBadge,
  useIonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';

const Profile: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const history = useHistory();
  const [presentAlert] = useIonAlert();

  const handleLogout = async () => {
    presentAlert({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: async () => {
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                await authApi.logout(refreshToken);
              }
            } catch (error) {
              // Ignore error, logout anyway
            } finally {
              clearAuth();
              history.push('/login');
            }
          },
        },
      ],
    });
  };

  return (
    <Layout title="Profile">
      <div className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>User Information</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>
                <h3>Name</h3>
                <p>{user?.name}</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h3>Email</h3>
                <p>{user?.email}</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h3>Role</h3>
                <p>{user?.role}</p>
              </IonLabel>
              <IonBadge
                slot="end"
                color={user?.role === 'ADMIN' ? 'primary' : 'medium'}
              >
                {user?.role}
              </IonBadge>
            </IonItem>

            <IonItem>
              <IonLabel>
                <h3>Family Code</h3>
                <p>{user?.familyCode}</p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>About</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                <strong>Family Expense Tracker</strong>
                <br />
                Version 1.0.0
                <br />
                <br />
                Track your family's income and expenses with ease. Collaborate with
                family members and stay on top of your finances.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          color="danger"
          style={{ marginTop: '20px' }}
          onClick={handleLogout}
        >
          Logout
        </IonButton>
      </div>
    </Layout>
  );
};

export default Profile;

