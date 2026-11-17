export type Role = 'ADMIN' | 'COORDINATOR' | 'EMPLOYEE';
export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Admin', COORDINATOR: 'Operations Coordinator', EMPLOYEE: 'Telecaller' };
export type Presence = 'AVAILABLE' | 'ON_CALL' | 'BREAK' | 'OFFLINE';
export interface User { _id: string; name: string; email: string; phone?: string; role: Role; status: 'ACTIVE' | 'INACTIVE'; presence: Presence; assignedCount?: number; teamSize?: number; teamLead?: { _id: string; name: string } | string | null; team?: User[]; createdAt?: string; performance?: EmployeeStats }
export interface Contact { _id: string; name: string; phone: string; email?: string; company?: string; city?: string; status: string; priority: number; assignedTo?: { _id: string; name: string } | null; callCount: number; lastCalledAt?: string; lastDisposition?: string; lastNote?: string; followUpAt?: string; extra?: Record<string, string> }
export interface CallLog { _id: string; contact: { _id: string; name: string; phone: string; company?: string; email?: string; city?: string }; employee: { _id: string; name: string; email?: string }; startTime: string; endTime?: string; duration: number; callStatus: string; disposition: string; notes?: string; followUpAt?: string }
export interface Page<T> { items: T[]; total: number; page: number; limit: number; pages: number }
export interface Disposition { key: string; label: string; outcome: 'COMPLETED' | 'RETRY' | 'FOLLOW_UP'; success: boolean }
export interface Settings { dispositions: Disposition[]; companyName: string }
export interface EmployeeStats { assigned: number; pending: number; followUps: number; completed: number; totalCalls: number; avgDuration: number; successRate: number; callsToday: number; talkTimeToday: number; dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; talk: number }[] }
export interface AdminStats {
  cards: { totalEmployees: number; activeEmployees: number; totalContacts: number; assignedContacts: number; pendingContacts: number; completedContacts: number; unassignedContacts?: number; totalCalls: number; completedCalls: number; todayCalls: number; avgDuration: number; successRate: number };
  dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; success: number }[]; monthly: { month: string; calls: number }[];
  performance: { employeeId: string; name: string; phone?: string; status: string; presence: Presence; assigned: number; called: number; pending: number; calls: number; successRate: number }[]; range: string;
}
export interface Notice { _id: string; title: string; message?: string; read: boolean; createdAt: string }

//--------- second change --------
// export type Role = 'ADMIN' | 'COORDINATOR' | 'EMPLOYEE';
// export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Admin', COORDINATOR: 'Operations Coordinator', EMPLOYEE: 'Telecaller' };
// export type Presence = 'AVAILABLE' | 'ON_CALL' | 'BREAK' | 'OFFLINE';
// export interface User { _id: string; name: string; email: string; phone?: string; role: Role; status: 'ACTIVE' | 'INACTIVE'; presence: Presence; assignedCount?: number; teamSize?: number; teamLead?: { _id: string; name: string } | string | null; team?: User[]; createdAt?: string; performance?: EmployeeStats }
// export interface Contact { _id: string; name: string; phone: string; email?: string; company?: string; city?: string; status: string; priority: number; assignedTo?: { _id: string; name: string } | null; callCount: number; lastCalledAt?: string; lastDisposition?: string; lastNote?: string; followUpAt?: string; extra?: Record<string, string> }
// export interface CallLog { _id: string; contact: { _id: string; name: string; phone: string; company?: string; email?: string; city?: string }; employee: { _id: string; name: string; email?: string }; startTime: string; endTime?: string; duration: number; callStatus: string; disposition: string; notes?: string; followUpAt?: string }
// export interface Page<T> { items: T[]; total: number; page: number; limit: number; pages: number }
// export interface Disposition { key: string; label: string; outcome: 'COMPLETED' | 'RETRY' | 'FOLLOW_UP'; success: boolean }
// export interface Settings { dispositions: Disposition[]; companyName: string }
// export interface EmployeeStats { assigned: number; pending: number; followUps: number; completed: number; totalCalls: number; avgDuration: number; successRate: number; callsToday: number; talkTimeToday: number; dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; talk: number }[] }
// export interface AdminStats {
//   cards: { totalEmployees: number; activeEmployees: number; totalContacts: number; assignedContacts: number; pendingContacts: number; completedContacts: number; totalCalls: number; completedCalls: number; todayCalls: number; avgDuration: number; successRate: number };
//   dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; success: number }[]; monthly: { month: string; calls: number }[];
//   performance: { employeeId: string; name: string; phone?: string; status: string; presence: Presence; assigned: number; called: number; pending: number; calls: number; successRate: number }[]; range: string;
// }
// export interface Notice { _id: string; title: string; message?: string; read: boolean; createdAt: string }

//----- 12.11.2026 ---------
// export type Role = 'ADMIN' | 'EMPLOYEE';
// export type Presence = 'AVAILABLE' | 'ON_CALL' | 'BREAK' | 'OFFLINE';
// export interface User { _id: string; name: string; email: string; phone?: string; role: Role; status: 'ACTIVE' | 'INACTIVE'; presence: Presence; assignedCount?: number; createdAt?: string; performance?: EmployeeStats }
// export interface Contact { _id: string; name: string; phone: string; email?: string; company?: string; city?: string; status: string; priority: number; assignedTo?: { _id: string; name: string } | null; callCount: number; lastCalledAt?: string; lastDisposition?: string; lastNote?: string; followUpAt?: string; extra?: Record<string, string> }
// export interface CallLog { _id: string; contact: { _id: string; name: string; phone: string; company?: string; email?: string; city?: string }; employee: { _id: string; name: string; email?: string }; startTime: string; endTime?: string; duration: number; callStatus: string; disposition: string; notes?: string; followUpAt?: string }
// export interface Page<T> { items: T[]; total: number; page: number; limit: number; pages: number }
// export interface Disposition { key: string; label: string; outcome: 'COMPLETED' | 'RETRY' | 'FOLLOW_UP'; success: boolean }
// export interface Settings { dispositions: Disposition[]; companyName: string }
// export interface EmployeeStats { assigned: number; pending: number; followUps: number; completed: number; totalCalls: number; avgDuration: number; successRate: number; callsToday: number; talkTimeToday: number; dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; talk: number }[] }
// export interface AdminStats {
//   cards: { totalEmployees: number; activeEmployees: number; totalContacts: number; assignedContacts: number; pendingContacts: number; completedContacts: number; totalCalls: number; completedCalls: number; todayCalls: number; avgDuration: number; successRate: number };
//   dispositions: { key: string; count: number }[]; daily: { date: string; calls: number; success: number }[]; monthly: { month: string; calls: number }[];
//   performance: { employeeId: string; name: string; status: string; presence: Presence; assigned: number; called: number; pending: number; calls: number; successRate: number }[]; range: string;
// }
// export interface Notice { _id: string; title: string; message?: string; read: boolean; createdAt: string }
