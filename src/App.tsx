import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { Loading } from './components/ui';
import { Role } from './types';

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Telecallers = lazy(() => import('./pages/admin/Telecallers'));
const Contacts = lazy(() => import('./pages/admin/Contacts'));
const Assignments = lazy(() => import('./pages/admin/Assignments'));
const CallLogs = lazy(() => import('./pages/admin/CallLogs'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Coordinators = lazy(() => import('./pages/admin/Coordinators'));
const TeamDashboard = lazy(() => import('./pages/coordinator/TeamDashboard'));
const MyTeam = lazy(() => import('./pages/coordinator/MyTeam'));
const Queue = lazy(() => import('./pages/employee/Queue'));
const MyContacts = lazy(() => import('./pages/employee/MyContacts'));
const History = lazy(() => import('./pages/employee/History'));
const Stats = lazy(() => import('./pages/employee/Stats'));

function Guard({ role, children }: { role?: Role | Role[]; children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !([] as Role[]).concat(role).includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
const Home = () => { const { user } = useAuth(); return user!.role === 'ADMIN' ? <AdminDashboard /> : user!.role === 'COORDINATOR' ? <TeamDashboard /> : <Queue />; };

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard><AppLayout /></Guard>}>
          <Route index element={<Home />} />
          <Route path="telecallers" element={<Guard role="ADMIN"><Telecallers /></Guard>} />
          <Route path="contacts" element={<Guard role={['ADMIN', 'COORDINATOR']}><Contacts /></Guard>} />
          <Route path="assignments" element={<Guard role={['ADMIN', 'COORDINATOR']}><Assignments /></Guard>} />
          <Route path="coordinators" element={<Guard role="ADMIN"><Coordinators /></Guard>} />
          <Route path="my-team" element={<Guard role="COORDINATOR"><MyTeam /></Guard>} />
          <Route path="call-logs" element={<Guard role={['ADMIN', 'COORDINATOR']}><CallLogs /></Guard>} />
          <Route path="reports" element={<Guard role="ADMIN"><Reports /></Guard>} />
          <Route path="my-contacts" element={<Guard role="EMPLOYEE"><MyContacts /></Guard>} />
          <Route path="follow-ups" element={<Guard role="EMPLOYEE"><MyContacts followUps /></Guard>} />
          <Route path="history" element={<Guard role="EMPLOYEE"><History /></Guard>} />
          <Route path="stats" element={<Guard role="EMPLOYEE"><Stats /></Guard>} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}


//------ second change -----------
// import { lazy, Suspense } from 'react';
// import { Navigate, Route, Routes } from 'react-router-dom';
// import { useAuth } from './contexts/AuthContext';
// import AppLayout from './layouts/AppLayout';
// import Login from './pages/Login';
// import Settings from './pages/Settings';
// import { Loading } from './components/ui';
// import { Role } from './types';

// const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
// const Telecallers = lazy(() => import('./pages/admin/Telecallers'));
// const Contacts = lazy(() => import('./pages/admin/Contacts'));
// const Assignments = lazy(() => import('./pages/admin/Assignments'));
// const CallLogs = lazy(() => import('./pages/admin/CallLogs'));
// const Reports = lazy(() => import('./pages/admin/Reports'));
// const Coordinators = lazy(() => import('./pages/admin/Coordinators'));
// const TeamDashboard = lazy(() => import('./pages/coordinator/TeamDashboard'));
// const MyTeam = lazy(() => import('./pages/coordinator/MyTeam'));
// const Queue = lazy(() => import('./pages/employee/Queue'));
// const MyContacts = lazy(() => import('./pages/employee/MyContacts'));
// const History = lazy(() => import('./pages/employee/History'));
// const Stats = lazy(() => import('./pages/employee/Stats'));

// function Guard({ role, children }: { role?: Role | Role[]; children: JSX.Element }) {
//   const { user, loading } = useAuth();
//   if (loading) return <Loading />;
//   if (!user) return <Navigate to="/login" replace />;
//   if (role && !([] as Role[]).concat(role).includes(user.role)) return <Navigate to="/" replace />;
//   return children;
// }
// const Home = () => { const { user } = useAuth(); return user!.role === 'ADMIN' ? <AdminDashboard /> : user!.role === 'COORDINATOR' ? <TeamDashboard /> : <Queue />; };

// export default function App() {
//   return (
//     <Suspense fallback={<Loading />}>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route element={<Guard><AppLayout /></Guard>}>
//           <Route index element={<Home />} />
//           <Route path="telecallers" element={<Guard role="ADMIN"><Telecallers /></Guard>} />
//           <Route path="contacts" element={<Guard role="ADMIN"><Contacts /></Guard>} />
//           <Route path="assignments" element={<Guard role="ADMIN"><Assignments /></Guard>} />
//           <Route path="coordinators" element={<Guard role="ADMIN"><Coordinators /></Guard>} />
//           <Route path="my-team" element={<Guard role="COORDINATOR"><MyTeam /></Guard>} />
//           <Route path="call-logs" element={<Guard role={['ADMIN', 'COORDINATOR']}><CallLogs /></Guard>} />
//           <Route path="reports" element={<Guard role="ADMIN"><Reports /></Guard>} />
//           <Route path="my-contacts" element={<Guard role="EMPLOYEE"><MyContacts /></Guard>} />
//           <Route path="follow-ups" element={<Guard role="EMPLOYEE"><MyContacts followUps /></Guard>} />
//           <Route path="history" element={<Guard role="EMPLOYEE"><History /></Guard>} />
//           <Route path="stats" element={<Guard role="EMPLOYEE"><Stats /></Guard>} />
//           <Route path="settings" element={<Settings />} />
//         </Route>
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Suspense>
//   );
// }

//------------- 12.11.2026 -------------
// import { lazy, Suspense } from 'react';
// import { Navigate, Route, Routes } from 'react-router-dom';
// import { useAuth } from './contexts/AuthContext';
// import AppLayout from './layouts/AppLayout';
// import Login from './pages/Login';
// import Settings from './pages/Settings';
// import { Loading } from './components/ui';
// import { Role } from './types';

// const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
// const Telecallers = lazy(() => import('./pages/admin/Telecallers'));
// const Contacts = lazy(() => import('./pages/admin/Contacts'));
// const Assignments = lazy(() => import('./pages/admin/Assignments'));
// const CallLogs = lazy(() => import('./pages/admin/CallLogs'));
// const Reports = lazy(() => import('./pages/admin/Reports'));
// const Queue = lazy(() => import('./pages/employee/Queue'));
// const MyContacts = lazy(() => import('./pages/employee/MyContacts'));
// const History = lazy(() => import('./pages/employee/History'));
// const Stats = lazy(() => import('./pages/employee/Stats'));

// function Guard({ role, children }: { role?: Role; children: JSX.Element }) {
//   const { user, loading } = useAuth();
//   if (loading) return <Loading />;
//   if (!user) return <Navigate to="/login" replace />;
//   if (role && user.role !== role) return <Navigate to="/" replace />;
//   return children;
// }
// const Home = () => { const { user } = useAuth(); return user!.role === 'ADMIN' ? <AdminDashboard /> : <Queue />; };

// export default function App() {
//   return (
//     <Suspense fallback={<Loading />}>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route element={<Guard><AppLayout /></Guard>}>
//           <Route index element={<Home />} />
//           <Route path="telecallers" element={<Guard role="ADMIN"><Telecallers /></Guard>} />
//           <Route path="contacts" element={<Guard role="ADMIN"><Contacts /></Guard>} />
//           <Route path="assignments" element={<Guard role="ADMIN"><Assignments /></Guard>} />
//           <Route path="call-logs" element={<Guard role="ADMIN"><CallLogs /></Guard>} />
//           <Route path="reports" element={<Guard role="ADMIN"><Reports /></Guard>} />
//           <Route path="my-contacts" element={<Guard role="EMPLOYEE"><MyContacts /></Guard>} />
//           <Route path="follow-ups" element={<Guard role="EMPLOYEE"><MyContacts followUps /></Guard>} />
//           <Route path="history" element={<Guard role="EMPLOYEE"><History /></Guard>} />
//           <Route path="stats" element={<Guard role="EMPLOYEE"><Stats /></Guard>} />
//           <Route path="settings" element={<Settings />} />
//         </Route>
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Suspense>
//   );
// }
