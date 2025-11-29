import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonMenu,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {
  homeOutline,
  cashOutline,
  cardOutline,
  peopleOutline,
  personOutline,
  logOutOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  const history = useHistory();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    history.push('/login');
  };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem button onClick={() => history.push('/dashboard')}>
              <IonIcon icon={homeOutline} slot="start" />
              <IonLabel>Dashboard</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/incomes')}>
              <IonIcon icon={cashOutline} slot="start" />
              <IonLabel>Incomes</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/expenses')}>
              <IonIcon icon={cardOutline} slot="start" />
              <IonLabel>Expenses</IonLabel>
            </IonItem>
            <IonItem button onClick={() => history.push('/family')}>
              <IonIcon icon={peopleOutline} slot="start" />
              <IonLabel>Family</IonLabel>
            </IonItem>
            {user?.role === 'ADMIN' && (
              <IonItem button onClick={() => history.push('/member-reports')}>
                <IonIcon icon={statsChartOutline} slot="start" />
                <IonLabel>Member Reports</IonLabel>
              </IonItem>
            )}
            <IonItem button onClick={() => history.push('/profile')}>
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel>Profile</IonLabel>
            </IonItem>
            <IonItem button onClick={handleLogout} color="danger">
              <IonIcon icon={logOutOutline} slot="start" />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          </IonList>

          <div style={{ padding: '16px', marginTop: '20px' }}>
            <p style={{ fontSize: '12px', color: '#666' }}>
              <strong>{user?.name}</strong>
              <br />
              {user?.email}
              <br />
              Role: {user?.role}
            </p>
          </div>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>{title}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>{children}</IonContent>
      </IonPage>
    </>
  );
};

export default Layout;

