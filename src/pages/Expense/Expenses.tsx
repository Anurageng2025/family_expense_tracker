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
import { expenseApi } from '../../services/api';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Healthcare', 'Entertainment', 'Other'];

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseApi.getMyExpenses();
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error: any) {
      present({
        message: 'Failed to load expenses',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchExpenses().finally(() => {
      event.detail.complete();
    });
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        date: new Date(expense.date).toISOString().split('T')[0],
        notes: expense.notes || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        amount: '',
        category: 'Food',
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

      if (editingExpense) {
        await expenseApi.update(editingExpense.id, payload);
        present({
          message: 'Expense updated successfully',
          duration: 2000,
          color: 'success',
        });
      } else {
        await expenseApi.create(payload);
        present({
          message: 'Expense added successfully',
          duration: 2000,
          color: 'success',
        });
      }

      setShowModal(false);
      fetchExpenses();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to save expense',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (expense: Expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingExpenseId(id);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!deletingExpenseId) return;

    try {
      setLoading(true);
      await expenseApi.delete(deletingExpenseId);
      present({
        message: 'Expense deleted successfully',
        duration: 2000,
        color: 'success',
      });
      fetchExpenses();
    } catch (error: any) {
      present({
        message: 'Failed to delete expense',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setDeletingExpenseId(null);
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
    <Layout title="Expenses">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>My Expense Records</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {expenses.length === 0 ? (
              <IonText color="medium">
                <p>No expense records yet. Add your first expense!</p>
              </IonText>
            ) : (
              <IonList>
                {expenses.map((expense) => (
                  <IonItemSliding key={expense.id}>
                    <IonItem button onClick={() => handleView(expense)}>
                      <IonLabel>
                        <h2 style={{ fontWeight: 'bold', color: '#eb445a' }}>
                          {formatCurrency(expense.amount)}
                        </h2>
                        <p><strong>{expense.category}</strong> • {formatDate(expense.date)}</p>
                        {expense.notes && (
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            {expense.notes.length > 50 
                              ? expense.notes.substring(0, 50) + '...' 
                              : expense.notes}
                          </p>
                        )}
                      </IonLabel>
                      <IonIcon icon={eye} slot="end" color="medium" />
                    </IonItem>

                    <IonItemOptions side="start">
                      <IonItemOption
                        color="tertiary"
                        onClick={() => handleView(expense)}
                      >
                        <IonIcon slot="icon-only" icon={eye} />
                      </IonItemOption>
                    </IonItemOptions>

                    <IonItemOptions side="end">
                      <IonItemOption
                        color="primary"
                        onClick={() => handleOpenModal(expense)}
                      >
                        <IonIcon slot="icon-only" icon={create} />
                      </IonItemOption>
                      <IonItemOption
                        color="danger"
                        onClick={() => confirmDelete(expense.id)}
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
          <IonToolbar color="danger">
            <IonTitle>Expense Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowViewModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {viewingExpense && (
            <>
              <IonCard>
                <IonCardContent>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IonText color="danger">
                      <h1 style={{ fontSize: '36px', margin: '10px 0' }}>
                        {formatCurrency(viewingExpense.amount)}
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
                        {viewingExpense.category}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Date</h3>
                      <p style={{ fontSize: '16px' }}>
                        {formatDate(viewingExpense.date)}
                      </p>
                    </IonLabel>
                  </IonItem>

                  {viewingExpense.notes && (
                    <IonItem lines="none">
                      <IonLabel>
                        <h3>Notes</h3>
                        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                          {viewingExpense.notes}
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
                  handleOpenModal(viewingExpense);
                }}
              >
                <IonIcon icon={create} slot="start" />
                Edit Expense
              </IonButton>

              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                onClick={() => {
                  setShowViewModal(false);
                  confirmDelete(viewingExpense.id);
                }}
              >
                <IonIcon icon={trash} slot="start" />
                Delete Expense
              </IonButton>
            </>
          )}
        </IonContent>
      </IonModal>

      {/* Add/Edit Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</IonTitle>
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
              {EXPENSE_CATEGORIES.map((cat) => (
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
            {editingExpense ? 'Update' : 'Add'} Expense
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Delete Confirmation Alert */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setDeletingExpenseId(null);
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

export default Expenses;

