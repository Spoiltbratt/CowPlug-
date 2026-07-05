import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { User, UserInvestment, FarmerLivestock, AppNotification, MarketplaceAnimal } from '../types';
import { Invoice } from '../types_payments';
import { Order } from '../components/AdminOrderManagementCenterModal';
import { AdminNotification } from '../components/AdminNotificationCenterModal';

// Seeding utilities to auto-populate Firestore with realistic demo data
export async function seedUserIfMissing(user: User, defaultInvestments: UserInvestment[], defaultLivestock: FarmerLivestock[], defaultNotifications: AppNotification[]) {
  const userRef = doc(db, 'users', user.id);
  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.log(`[Firebase Sync] Seeding user profile for ${user.fullName}`);
      await setDoc(userRef, user);

      // Seed investments
      for (const inv of defaultInvestments) {
        const invRef = doc(db, 'user_investments', inv.id);
        await setDoc(invRef, { ...inv, customerId: user.id });
      }

      // Seed livestock if farmer
      if (user.role === 'farmer') {
        for (const live of defaultLivestock) {
          const liveRef = doc(db, 'farmer_livestock', live.id);
          await setDoc(liveRef, { ...live, userId: user.id });
        }
      }

      // Seed notifications
      for (const notif of defaultNotifications) {
        const notifRef = doc(db, 'notifications', notif.id);
        await setDoc(notifRef, { ...notif, userId: user.id });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
  }
}

// User Profile Actions
export async function dbUpdateUserProfile(userId: string, updates: Partial<User>) {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

// User Investment Actions
export async function dbAddUserInvestment(inv: UserInvestment, customerId: string) {
  const invRef = doc(db, 'user_investments', inv.id);
  try {
    await setDoc(invRef, { ...inv, customerId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `user_investments/${inv.id}`);
  }
}

export async function dbUpdateUserInvestment(id: string, updates: Partial<UserInvestment>) {
  const invRef = doc(db, 'user_investments', id);
  try {
    await updateDoc(invRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `user_investments/${id}`);
  }
}

// Farmer Livestock Actions
export async function dbAddFarmerLivestock(live: FarmerLivestock, userId: string) {
  const liveRef = doc(db, 'farmer_livestock', live.id);
  try {
    await setDoc(liveRef, { ...live, userId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `farmer_livestock/${live.id}`);
  }
}

export async function dbUpdateFarmerLivestock(id: string, updates: Partial<FarmerLivestock>) {
  const liveRef = doc(db, 'farmer_livestock', id);
  try {
    await updateDoc(liveRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `farmer_livestock/${id}`);
  }
}

export async function dbDeleteFarmerLivestock(id: string) {
  const liveRef = doc(db, 'farmer_livestock', id);
  try {
    await deleteDoc(liveRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `farmer_livestock/${id}`);
  }
}

// Notifications Actions
export async function dbAddNotification(notif: AppNotification, userId: string) {
  const notifRef = doc(db, 'notifications', notif.id);
  try {
    await setDoc(notifRef, { ...notif, userId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notifications/${notif.id}`);
  }
}

export async function dbMarkNotificationsRead(userId: string, notificationIds: string[]) {
  try {
    for (const id of notificationIds) {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/bulk`);
  }
}

// Invoice Actions
export async function dbAddInvoice(inv: Invoice, customerId: string) {
  const invRef = doc(db, 'invoices', inv.id);
  try {
    await setDoc(invRef, { ...inv, customerId });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `invoices/${inv.id}`);
  }
}

export async function dbUpdateInvoice(id: string, updates: Partial<Invoice>) {
  const invRef = doc(db, 'invoices', id);
  try {
    await updateDoc(invRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `invoices/${id}`);
  }
}

// Admin Order Actions
export async function dbAddAdminOrder(ord: Order) {
  const ordRef = doc(db, 'admin_orders', ord.id);
  try {
    await setDoc(ordRef, ord);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `admin_orders/${ord.id}`);
  }
}

export async function dbUpdateAdminOrder(id: string, updates: Partial<Order>) {
  const ordRef = doc(db, 'admin_orders', id);
  try {
    await updateDoc(ordRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `admin_orders/${id}`);
  }
}

// Admin Notification Actions
export async function dbAddAdminNotification(notif: AdminNotification) {
  const notifRef = doc(db, 'admin_notifications', notif.id);
  try {
    await setDoc(notifRef, notif);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `admin_notifications/${notif.id}`);
  }
}

export async function dbUpdateAdminNotification(id: string, updates: Partial<AdminNotification>) {
  const notifRef = doc(db, 'admin_notifications', id);
  try {
    await updateDoc(notifRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `admin_notifications/${id}`);
  }
}
