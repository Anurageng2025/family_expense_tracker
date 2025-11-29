import React, { useEffect, useState } from 'react';
import {
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonButton,
  IonAlert,
  IonText,
  IonLoading,
  IonIcon,
  IonCheckbox,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent as IonModalContent,
  useIonToast,
} from '@ionic/react';
import { mail, mailOutline } from 'ionicons/icons';
import Layout from '../../components/Layout';
import { familyApi, reminderApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
}

interface FamilyData {
  id: string;
  familyName: string;
  familyCode: string;
  users: FamilyMember[];
}

const Family: React.FC = () => {
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [present] = useIonToast();
  const { user } = useAuthStore();

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const response = await familyApi.getFamily();
      if (response.data.success) {
        setFamily(response.data.data);
      }
    } catch (error: any) {
      present({
        message: 'Failed to load family data',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchFamily().finally(() => {
      event.detail.complete();
    });
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setLoading(true);
      await familyApi.removeMember(memberToDelete);
      present({
        message: 'Member removed successfully',
        duration: 2000,
        color: 'success',
      });
      fetchFamily();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to remove member',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setMemberToDelete(null);
    }
  };

  const handleSendReminder = async (memberId: string) => {
    try {
      setLoading(true);
      const response = await reminderApi.sendToMember(memberId);
      
      if (response.data.success) {
        present({
          message: 'Reminder sent successfully!',
          duration: 2000,
          color: 'success',
        });
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to send reminder',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAll = async () => {
    try {
      setLoading(true);
      const response = await reminderApi.sendToAll();
      
      if (response.data.success) {
        present({
          message: response.data.data.message || 'Reminders sent to all members!',
          duration: 3000,
          color: 'success',
        });
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to send reminders',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async () => {
    if (selectedMembers.length === 0) {
      present({
        message: 'Please select at least one member',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await reminderApi.sendBulk(selectedMembers);
      
      if (response.data.success) {
        present({
          message: response.data.data.message || 'Reminders sent successfully!',
          duration: 3000,
          color: 'success',
        });
        setShowReminderModal(false);
        setSelectedMembers([]);
      }
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to send reminders',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout title="Family">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="ion-padding">
        {family && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{family.familyName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>
                  <p>
                    <strong>Family Code:</strong> {family.familyCode}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Share this code with family members so they can join
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Family Members ({family.users.length})</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                  <IonList>
                    {family.users.map((member) => (
                      <IonItem key={member.id}>
                        <IonLabel>
                          <h2>{member.name}</h2>
                          <p>{member.email}</p>
                          <p style={{ fontSize: '12px' }}>
                            Joined: {formatDate(member.createdAt)}
                          </p>
                        </IonLabel>
                        <IonBadge
                          slot="end"
                          color={member.role === 'ADMIN' ? 'primary' : 'medium'}
                        >
                          {member.role}
                        </IonBadge>
                        {user?.role === 'ADMIN' && (
                          <>
                            <IonButton
                              slot="end"
                              fill="clear"
                              color="tertiary"
                              onClick={() => handleSendReminder(member.id)}
                            >
                              <IonIcon icon={mailOutline} />
                            </IonButton>
                            {member.role !== 'ADMIN' && member.id !== user?.id && (
                              <IonButton
                                slot="end"
                                fill="clear"
                                color="danger"
                                onClick={() => {
                                  setMemberToDelete(member.id);
                                  setShowDeleteAlert(true);
                                }}
                              >
                                Remove
                              </IonButton>
                            )}
                          </>
                        )}
                      </IonItem>
                    ))}
                  </IonList>
              </IonCardContent>
            </IonCard>

            {user?.role === 'ADMIN' && (
              <>
                <IonCard color="tertiary">
                  <IonCardHeader>
                    <IonCardTitle>⏰ Send Expense Reminders</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText color="light">
                      <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                        Remind family members to log their daily expenses
                      </p>
                    </IonText>
                    
                    <IonButton
                      expand="block"
                      color="light"
                      onClick={handleSendToAll}
                      disabled={loading}
                    >
                      <IonIcon icon={mail} slot="start" />
                      Send to All Members
                    </IonButton>

                    <IonButton
                      expand="block"
                      fill="outline"
                      color="light"
                      onClick={() => setShowReminderModal(true)}
                      disabled={loading}
                      style={{ marginTop: '10px' }}
                    >
                      <IonIcon icon={mailOutline} slot="start" />
                      Select & Send
                    </IonButton>
                  </IonCardContent>
                </IonCard>

                <IonCard color="light">
                  <IonCardContent>
                    <IonText>
                      <p style={{ fontSize: '14px' }}>
                        <strong>Admin Privileges:</strong> As an admin, you can remove family
                        members, send reminders, and manage family settings.
                      </p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </>
            )}
          </>
        )}
      </div>

      {/* Select Members Modal */}
      <IonModal isOpen={showReminderModal} onDidDismiss={() => setShowReminderModal(false)}>
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonTitle>Send Reminders</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowReminderModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonModalContent className="ion-padding">
          <IonText>
            <p>Select family members to send expense reminder emails:</p>
          </IonText>

          {family && (
            <IonList>
              {family.users.map((member) => (
                <IonItem key={member.id}>
                  <IonCheckbox
                    slot="start"
                    checked={selectedMembers.includes(member.id)}
                    onIonChange={() => toggleMemberSelection(member.id)}
                  />
                  <IonLabel>
                    <h3>{member.name}</h3>
                    <p>{member.email}</p>
                  </IonLabel>
                  <IonBadge
                    slot="end"
                    color={member.role === 'ADMIN' ? 'primary' : 'medium'}
                  >
                    {member.role}
                  </IonBadge>
                </IonItem>
              ))}
            </IonList>
          )}

          <IonButton
            expand="block"
            color="tertiary"
            style={{ marginTop: '20px' }}
            onClick={handleSendBulk}
            disabled={loading || selectedMembers.length === 0}
          >
            <IonIcon icon={mail} slot="start" />
            Send to {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            color="medium"
            onClick={() => {
              if (selectedMembers.length === family?.users.length) {
                setSelectedMembers([]);
              } else {
                setSelectedMembers(family?.users.map((m) => m.id) || []);
              }
            }}
            style={{ marginTop: '10px' }}
          >
            {selectedMembers.length === family?.users.length ? 'Deselect All' : 'Select All'}
          </IonButton>
        </IonModalContent>
      </IonModal>

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Remove Member"
        message="Are you sure you want to remove this member from the family?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Remove',
            role: 'destructive',
            handler: handleDeleteMember,
          },
        ]}
      />

      <IonLoading isOpen={loading} message="Please wait..." />
    </Layout>
  );
};

export default Family;

