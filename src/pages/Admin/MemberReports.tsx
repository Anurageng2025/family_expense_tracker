import React, { useEffect, useState } from 'react';
import {
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonText,
  IonBadge,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent as IonModalContent,
  IonLoading,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonToast,
} from '@ionic/react';
import { person, cashOutline, cardOutline, eye } from 'ionicons/icons';
import Layout from '../../components/Layout';
import { incomeApi, expenseApi, familyApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
  };
}

interface MemberStats {
  member: Member;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

const MemberReports: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [allIncomes, setAllIncomes] = useState<Transaction[]>([]);
  const [allExpenses, setAllExpenses] = useState<Transaction[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [viewType, setViewType] = useState<'summary' | 'income' | 'expense'>('summary');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);

      const [membersRes, incomesRes, expensesRes] = await Promise.all([
        familyApi.getMembers(),
        incomeApi.getFamilyIncomes(),
        expenseApi.getFamilyExpenses(),
      ]);

      if (membersRes.data.success) {
        setMembers(membersRes.data.data);
      }

      if (incomesRes.data.success) {
        setAllIncomes(incomesRes.data.data);
      }

      if (expensesRes.data.success) {
        setAllExpenses(expensesRes.data.data);
      }
    } catch (error: any) {
      present({
        message: 'Failed to load member reports',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      present({
        message: 'Only admins can access member reports',
        duration: 3000,
        color: 'warning',
      });
    }
    fetchData();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchData().finally(() => {
      event.detail.complete();
    });
  };

  const calculateMemberStats = (): MemberStats[] => {
    return members.map((member) => {
      const memberIncomes = allIncomes.filter((i) => i.user?.id === member.id);
      const memberExpenses = allExpenses.filter((e) => e.user?.id === member.id);

      const totalIncome = memberIncomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = memberExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        member,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeCount: memberIncomes.length,
        expenseCount: memberExpenses.length,
      };
    });
  };

  const getFilteredTransactions = () => {
    if (selectedMember === 'all') {
      return viewType === 'income' ? allIncomes : allExpenses;
    }
    
    const transactions = viewType === 'income' ? allIncomes : allExpenses;
    return transactions.filter((t) => t.user?.id === selectedMember);
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

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const memberStats = calculateMemberStats();

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <Layout title="Member Reports">
        <div className="ion-padding">
          <IonCard color="warning">
            <IonCardContent>
              <IonText>
                <h2>Access Denied</h2>
                <p>Only family admins can view member reports.</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Member Reports (Admin)">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="ion-padding">
        {/* View Type Selector */}
        <IonSegment value={viewType} onIonChange={(e) => setViewType(e.detail.value as any)}>
          <IonSegmentButton value="summary">
            <IonLabel>Summary</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="income">
            <IonLabel>Incomes</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="expense">
            <IonLabel>Expenses</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Summary View */}
        {viewType === 'summary' && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Member Financial Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {memberStats.length === 0 ? (
                  <IonText color="medium">
                    <p>No members found</p>
                  </IonText>
                ) : (
                  <IonList>
                    {memberStats.map((stat) => (
                      <IonCard key={stat.member.id} style={{ margin: '10px 0' }}>
                        <IonCardContent>
                          <IonGrid>
                            <IonRow>
                              <IonCol size="12">
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                  <IonIcon icon={person} style={{ marginRight: '10px', fontSize: '24px' }} />
                                  <div>
                                    <h3 style={{ margin: 0 }}>{stat.member.name}</h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                      {stat.member.email}
                                    </p>
                                  </div>
                                  <IonBadge
                                    color={stat.member.role === 'ADMIN' ? 'primary' : 'medium'}
                                    style={{ marginLeft: 'auto' }}
                                  >
                                    {stat.member.role}
                                  </IonBadge>
                                </div>
                              </IonCol>
                            </IonRow>

                            <IonRow>
                              <IonCol size="6" sizeMd="3">
                                <IonText color="success">
                                  <p style={{ fontSize: '12px', margin: '5px 0' }}>Income</p>
                                  <h3 style={{ margin: 0 }}>{formatCurrency(stat.totalIncome)}</h3>
                                  <p style={{ fontSize: '10px', margin: '5px 0', color: '#666' }}>
                                    {stat.incomeCount} records
                                  </p>
                                </IonText>
                              </IonCol>

                              <IonCol size="6" sizeMd="3">
                                <IonText color="danger">
                                  <p style={{ fontSize: '12px', margin: '5px 0' }}>Expense</p>
                                  <h3 style={{ margin: 0 }}>{formatCurrency(stat.totalExpense)}</h3>
                                  <p style={{ fontSize: '10px', margin: '5px 0', color: '#666' }}>
                                    {stat.expenseCount} records
                                  </p>
                                </IonText>
                              </IonCol>

                              <IonCol size="12" sizeMd="6">
                                <IonText color={stat.balance >= 0 ? 'primary' : 'warning'}>
                                  <p style={{ fontSize: '12px', margin: '5px 0' }}>Balance</p>
                                  <h2 style={{ margin: 0 }}>{formatCurrency(stat.balance)}</h2>
                                </IonText>
                              </IonCol>
                            </IonRow>

                            <IonRow style={{ marginTop: '10px' }}>
                              <IonCol>
                                <IonButton
                                  expand="block"
                                  fill="outline"
                                  size="small"
                                  onClick={() => {
                                    setSelectedMember(stat.member.id);
                                    setViewType('income');
                                  }}
                                >
                                  View Details
                                </IonButton>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonCardContent>
                      </IonCard>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        {/* Income/Expense List View */}
        {(viewType === 'income' || viewType === 'expense') && (
          <>
            {/* Member Filter */}
            <IonCard>
              <IonCardContent>
                <IonLabel>Filter by Member:</IonLabel>
                <IonSegment
                  value={selectedMember}
                  onIonChange={(e) => setSelectedMember(e.detail.value as string)}
                  scrollable
                >
                  <IonSegmentButton value="all">
                    <IonLabel>All Members</IonLabel>
                  </IonSegmentButton>
                  {members.map((member) => (
                    <IonSegmentButton key={member.id} value={member.id}>
                      <IonLabel>{member.name.split(' ')[0]}</IonLabel>
                    </IonSegmentButton>
                  ))}
                </IonSegment>
              </IonCardContent>
            </IonCard>

            {/* Transactions List */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  {viewType === 'income' ? 'Income' : 'Expense'} Records
                  {selectedMember !== 'all' &&
                    ` - ${members.find((m) => m.id === selectedMember)?.name}`}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {getFilteredTransactions().length === 0 ? (
                  <IonText color="medium">
                    <p>No {viewType} records found</p>
                  </IonText>
                ) : (
                  <IonList>
                    {getFilteredTransactions().map((transaction) => (
                      <IonItem key={transaction.id} button onClick={() => viewTransactionDetails(transaction)}>
                        <IonIcon
                          icon={viewType === 'income' ? cashOutline : cardOutline}
                          slot="start"
                          color={viewType === 'income' ? 'success' : 'danger'}
                        />
                        <IonLabel>
                          <h2
                            style={{
                              fontWeight: 'bold',
                              color: viewType === 'income' ? '#2dd36f' : '#eb445a',
                            }}
                          >
                            {formatCurrency(transaction.amount)}
                          </h2>
                          <p>
                            <strong>{transaction.category}</strong> • {formatDate(transaction.date)}
                          </p>
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            By: {transaction.user?.name}
                          </p>
                        </IonLabel>
                        <IonIcon icon={eye} slot="end" color="medium" />
                      </IonItem>
                    ))}
                  </IonList>
                )}

                {/* Summary for filtered view */}
                {getFilteredTransactions().length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
                    <IonText>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Total Records:</strong> {getFilteredTransactions().length}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Total Amount:</strong>{' '}
                        <span style={{ color: viewType === 'income' ? '#2dd36f' : '#eb445a', fontWeight: 'bold' }}>
                          {formatCurrency(
                            getFilteredTransactions().reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </span>
                      </p>
                    </IonText>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)}>
        <IonHeader>
          <IonToolbar color={viewType === 'income' ? 'success' : 'danger'}>
            <IonTitle>{viewType === 'income' ? 'Income' : 'Expense'} Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowDetailsModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonModalContent className="ion-padding">
          {selectedTransaction && (
            <>
              <IonCard>
                <IonCardContent>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IonText color={viewType === 'income' ? 'success' : 'danger'}>
                      <h1 style={{ fontSize: '36px', margin: '10px 0' }}>
                        {formatCurrency(selectedTransaction.amount)}
                      </h1>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Member</h3>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {selectedTransaction.user?.name}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Category</h3>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {selectedTransaction.category}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem lines="none">
                    <IonLabel>
                      <h3>Date</h3>
                      <p style={{ fontSize: '16px' }}>{formatDate(selectedTransaction.date)}</p>
                    </IonLabel>
                  </IonItem>

                  {selectedTransaction.notes && (
                    <IonItem lines="none">
                      <IonLabel>
                        <h3>Notes</h3>
                        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                          {selectedTransaction.notes}
                        </p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonCardContent>
              </IonCard>
            </>
          )}
        </IonModalContent>
      </IonModal>

      <IonLoading isOpen={loading} message="Loading member reports..." />
    </Layout>
  );
};

export default MemberReports;

