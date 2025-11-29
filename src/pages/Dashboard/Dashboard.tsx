import React, { useEffect, useState } from 'react';
import {
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonLoading,
  useIonToast,
} from '@ionic/react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Layout from '../../components/Layout';
import { dashboardApi } from '../../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [view, setView] = useState<'family' | 'personal'>('family');
  const [familyData, setFamilyData] = useState<any>(null);
  const [personalData, setPersonalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [familyRes, personalRes] = await Promise.all([
        dashboardApi.getFamilyDashboard(),
        dashboardApi.getMyDashboard(),
      ]);

      if (familyRes.data.success) {
        setFamilyData(familyRes.data.data);
      }

      if (personalRes.data.success) {
        setPersonalData(personalRes.data.data);
      }
    } catch (error: any) {
      present({
        message: 'Failed to load dashboard',
        duration: 2000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchData().finally(() => {
      event.detail.complete();
    });
  };    

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const data = view === 'family' ? familyData : personalData;

  // Prepare chart data
  const incomePieData = data
    ? {
        labels: Object.keys(data.incomeByCategory || {}),
        datasets: [
          {
            data: Object.values(data.incomeByCategory || {}),
            backgroundColor: [
              '#2dd36f',
              '#3dc2ff',
              '#5260ff',
              '#ffc409',
              '#eb445a',
              '#92949c',
            ],
          },
        ],
      }
    : null;

  const expensePieData = data
    ? {
        labels: Object.keys(data.expenseByCategory || {}),
        datasets: [
          {
            data: Object.values(data.expenseByCategory || {}),
            backgroundColor: [
              '#eb445a',
              '#ffc409',
              '#5260ff',
              '#3dc2ff',
              '#2dd36f',
              '#92949c',
            ],
          },
        ],
      }
    : null;

  const balanceBarData = data
    ? {
        labels: ['Income', 'Expense', 'Balance'],
        datasets: [
          {
            label: 'Amount',
            data: [data.totalIncome || 0, data.totalExpense || 0, data.balance || 0],
            backgroundColor: ['#2dd36f', '#eb445a', '#3880ff'],
          },
        ],
      }
    : null;

  return (
    <Layout title="Dashboard">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="ion-padding">
        <IonSegment value={view} onIonChange={(e) => setView(e.detail.value as any)}>
          <IonSegmentButton value="family">
            <IonLabel>Family</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="personal">
            <IonLabel>Personal</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {data && (
          <>
            {/* Summary Cards */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="4">
                  <IonCard color="success">
                    <IonCardContent>
                      <IonText>
                        <h3>Total Income</h3>
                        <h2>{formatCurrency(data.totalIncome || 0)}</h2>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonCard color="danger">
                    <IonCardContent>
                      <IonText>
                        <h3>Total Expense</h3>
                        <h2>{formatCurrency(data.totalExpense || 0)}</h2>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonCard color={data.balance >= 0 ? 'primary' : 'warning'}>
                    <IonCardContent>
                      <IonText>
                        <h3>Balance</h3>
                        <h2>{formatCurrency(data.balance || 0)}</h2>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Charts */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Overview</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {balanceBarData && <Bar data={balanceBarData} />}
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Income by Category</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {incomePieData && Object.keys(data.incomeByCategory || {}).length > 0 ? (
                        <Pie data={incomePieData} />
                      ) : (
                        <p>No income data available</p>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Expense by Category</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {expensePieData && Object.keys(data.expenseByCategory || {}).length > 0 ? (
                        <Pie data={expensePieData} />
                      ) : (
                        <p>No expense data available</p>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Family Member Stats */}
            {view === 'family' && familyData?.memberStats && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Member Breakdown</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {familyData.memberStats.map((member: any) => (
                    <div
                      key={member.userId}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                      }}
                    >
                      <strong>{member.userName}</strong>
                      <br />
                      <IonText color="success">
                        Income: {formatCurrency(member.income)}
                      </IonText>
                      {' | '}
                      <IonText color="danger">
                        Expense: {formatCurrency(member.expense)}
                      </IonText>
                      {' | '}
                      <IonText color={member.balance >= 0 ? 'primary' : 'warning'}>
                        Balance: {formatCurrency(member.balance)}
                      </IonText>
                    </div>
                  ))}
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </div>

      <IonLoading isOpen={loading} message="Loading dashboard..." />
    </Layout>
  );
};

export default Dashboard;

