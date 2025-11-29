import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Incomes from './pages/Income/Incomes';
import Expenses from './pages/Expense/Expenses';
import Family from './pages/Family/Family';
import Profile from './pages/Profile/Profile';
import MemberReports from './pages/Admin/MemberReports';

import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes */}
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
          </Route>
          <Route exact path="/register">
            {isAuthenticated ? <Redirect to="/dashboard" /> : <Register />}
          </Route>

          {/* Protected Routes */}
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute exact path="/incomes" component={Incomes} />
          <ProtectedRoute exact path="/expenses" component={Expenses} />
          <ProtectedRoute exact path="/family" component={Family} />
          <ProtectedRoute exact path="/member-reports" component={MemberReports} />
          <ProtectedRoute exact path="/profile" component={Profile} />

          {/* Default Route */}
          <Route exact path="/">
            <Redirect to={isAuthenticated ? '/dashboard' : '/login'} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

