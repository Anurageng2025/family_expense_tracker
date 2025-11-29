import React, { useEffect, useState } from 'react';
import {
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonText,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLoading,
  IonAlert,
  useIonToast,
} from '@ionic/react';
import { add, trash, create, eye } from 'ionicons/icons';
import Layout from '../../components/Layout';
import { incomeApi } from '../../services/api';

const INCOME_CATEGORIES = ['Salary', 'Business', 'Investment', 'Gift', 'Other'];

interface Income {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const Incomes: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await incomeApi.getMyIncomes();
      if (response.data.success) {
        setIncomes(response.data.data);
      }
    } catch (error: any) {
      present({
        message: 'Failed to load incomes',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchIncomes().finally(() => {
      event.detail.complete();
    });
  };

  const handleOpenModal = (income?: Income) => {
    if (income) {
      setEditingIncome(income);
      setFormData({
        amount: income.amount.toString(),
        category: income.category,
        date: new Date(income.date).toISOString().split('T')[0],
        notes: income.notes || '',
      });
    } else {
      setEditingIncome(null);
      setFormData({
        amount: '',
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      present({
        message: 'Please enter a valid amount',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes || undefined,
      };

      if (editingIncome) {
        await incomeApi.update(editingIncome.id, payload);
        present({
          message: 'Income updated successfully',
          duration: 2000,
          color: 'success',
        });
      } else {
        await incomeApi.create(payload);
        present({
          message: 'Income added successfully',
          duration: 2000,
          color: 'success',
        });
      }

      setShowModal(false);
      fetchIncomes();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to save income',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (income: Income) => {
    setViewingIncome(income);
    setShowViewModal(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingIncomeId(id);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!deletingIncomeId) return;

    try {
      setLoading(true);
      await incomeApi.delete(deletingIncomeId);
      present({
        message: 'Income deleted successfully',
        duration: 2000,
        color: 'success',
      });
      fetchIncomes();
    } catch (error: any) {
      present({
        message: 'Failed to delete income',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setDeletingIncomeId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout title="Incomes">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>My Income Records</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {incomes.length === 0 ? (
              <IonText color="medium">
                <p>No income records yet. Add your first income!</p>
              </IonText>
            ) : (
              <IonList>
                {incomes.map((income) => (
                  <IonItemSliding key={income.id}>
                    <IonItem button onClick={() => handleView(income)}>
                      <IonLabel>
                        <h2 style={{ fontWeight: 'bold', color: '#2dd36f' }}>
                          {formatCurrency(income.amount)}
                        </h2>
                        <p><strong>{income.category}</strong> • {formatDate(income.date)}</p>
                        {income.notes && (
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            {income.notes.length > 50 
                              ? income.notes.substring(0, 50) + '...' 
                              : income.notes}
                          </p>
                        )}
                      </IonLabel>
                      <IonIcon icon={eye} slot="end" color="medium" />
                    </IonItem>

                    <IonItemOptions side="start">
                      <IonItemOption
                        color="tertiary"
                        onClick={() => handleView(income)}
                      >
                        <IonIcon slot="icon-only" icon={eye} />
                      </IonItemOption>
                    </IonItemOptions>

                    <IonItemOptions side="end">
                      <IonItemOption
                        color="primary"
                        onClick={() => handleOpenModal(income)}
                      >
                        <IonIcon slot="icon-only" icon={create} />
                      </IonItemOption>
                      <IonItemOption
                        color="danger"
                        onClick={() => confirmDelete(income.id)}
                      >
                        <IonIcon slot="icon-only" icon={trash} />
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </div>

      {/* Add Button */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => handleOpenModal()}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>

      {/* View Modal */}
      <IonModal isOpen={showViewModal} onDidDismiss={() => setShowViewModal(false)}>
        <IonHeader>
          <IonToolbar color="success">
            <IonTitle>Income Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowViewModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {viewingIncome && (
            <>
              <IonCard>
                <IonCardContent>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IonText color="success">
                      <h1 style={{ fontSize: '36px', margin: '10px 0' }}>
                        {formatCurrency(viewingIncome.amount)}
                      </h1>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Category</h3>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {viewingIncome.category}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Date</h3>
                      <p style={{ fontSize: '16px' }}>
                        {formatDate(viewingIncome.date)}
                      </p>
                    </IonLabel>
                  </IonItem>

                  {viewingIncome.notes && (
                    <IonItem lines="none">
                      <IonLabel>
                        <h3>Notes</h3>
                        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                          {viewingIncome.notes}
                        </p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonCardContent>
              </IonCard>

              <IonButton
                expand="block"
                color="primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenModal(viewingIncome);
                }}
              >
                <IonIcon icon={create} slot="start" />
                Edit Income
              </IonButton>

              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                onClick={() => {
                  setShowViewModal(false);
                  confirmDelete(viewingIncome.id);
                }}
              >
                <IonIcon icon={trash} slot="start" />
                Delete Income
              </IonButton>
            </>
          )}
        </IonContent>
      </IonModal>

      {/* Add/Edit Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{editingIncome ? 'Edit Income' : 'Add Income'}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel position="stacked">Amount</IonLabel>
            <IonInput
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onIonChange={(e) =>
                setFormData({ ...formData, amount: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Category</IonLabel>
            <IonSelect
              value={formData.category}
              onIonChange={(e) =>
                setFormData({ ...formData, category: e.detail.value })
              }
            >
              {INCOME_CATEGORIES.map((cat) => (
                <IonSelectOption key={cat} value={cat}>
                  {cat}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Date</IonLabel>
            <IonInput
              type="date"
              value={formData.date}
              onIonChange={(e) =>
                setFormData({ ...formData, date: e.detail.value! })
              }
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Notes (Optional)</IonLabel>
            <IonInput
              type="text"
              placeholder="Add notes"
              value={formData.notes}
              onIonChange={(e) =>
                setFormData({ ...formData, notes: e.detail.value! })
              }
            />
          </IonItem>

          <IonButton expand="block" style={{ marginTop: '20px' }} onClick={handleSave}>
            {editingIncome ? 'Update' : 'Add'} Income
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Delete Confirmation Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Income"
        message="Are you sure you want to delete this income record? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setDeletingIncomeId(null);
            },
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: handleDelete,
          },
        ]}
      />

      <IonLoading isOpen={loading} message="Please wait..." />
    </Layout>
  );
};

export default Incomes;

