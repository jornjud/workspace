const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// ============ FIRESTORE REFERENCES ============
const db = admin.firestore();
const usersRef = db.collection('users');
const restaurantsRef = db.collection('restaurants');
const ordersRef = db.collection('orders');
const menuCategoriesRef = db.collection('menuCategories');
const menuItemsRef = db.collection('menuItems');

// ============ UTILITIES ============
const successResponse = (data) => ({ success: true, data });
const errorResponse = (message) => ({ success: false, error: message });

// ============ HEALTH CHECK ============
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
});

// ============ AUTH FUNCTIONS ============

// Create user profile
exports.createUser = functions.https.onCall(async (data, context) => {
  const { phone, role, name } = data;
  
  if (!phone || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone and role are required');
  }

  const userRecord = await admin.auth().createUser({
    phoneNumber: phone,
  });

  await usersRef.doc(userRecord.uid).set({
    phone,
    role,
    name: name || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return successResponse({ uid: userRecord.uid, phone, role });
});

// Get user profile
exports.getUser = functions.https.onCall(async (data, context) => {
  const { uid } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID is required');
  }

  const userDoc = await usersRef.doc(uid).get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  return successResponse(userDoc.data());
});

// ============ RESTAURANT FUNCTIONS ============

// Get all restaurants
exports.getRestaurants = functions.https.onCall(async (data, context) => {
  const { latitude, longitude, radius = 10 } = data;

  const snapshot = await restaurantsRef.where('isOpen', '==', true).get();
  const restaurants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return successResponse(restaurants);
});

// Get restaurant by ID
exports.getRestaurant = functions.https.onCall(async (data, context) => {
  const { restaurantId } = data;
  
  const restaurantDoc = await restaurantsRef.doc(restaurantId).get();
  
  if (!restaurantDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Restaurant not found');
  }

  // Get categories and menu items
  const categoriesSnapshot = await menuCategoriesRef.where('restaurantId', '==', restaurantId).get();
  const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const menuItemsSnapshot = await menuItemsRef.where('restaurantId', '==', restaurantId).get();
  const menuItems = menuItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return successResponse({
    id: restaurantDoc.id,
    ...restaurantDoc.data(),
    categories,
    menuItems,
  });
});

// ============ ORDER FUNCTIONS ============

// Create order
exports.createOrder = functions.https.onCall(async (data, context) => {
  const { 
    customerId, 
    restaurantId, 
    items, 
    deliveryAddress, 
    paymentMethod,
    note 
  } = data;

  if (!customerId || !restaurantId || !items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 15;
  const total = subtotal + deliveryFee;

  const orderData = {
    customerId,
    restaurantId,
    items,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'pending',
    deliveryAddress,
    note: note || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const orderRef = await ordersRef.add(orderData);
  
  return successResponse({ id: orderRef.id, ...orderData });
});

// Get order by ID
exports.getOrder = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  
  const orderDoc = await ordersRef.doc(orderId).get();
  
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found');
  }

  return successResponse({ id: orderDoc.id, ...orderDoc.data() });
});

// Get customer orders
exports.getCustomerOrders = functions.https.onCall(async (data, context) => {
  const { customerId } = data;
  
  const snapshot = await ordersRef
    .where('customerId', '==', customerId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return successResponse(orders);
});

// Update order status
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  const { orderId, status } = data;
  
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picking_up', 'on_the_way', 'arrived', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid status');
  }

  const updateData = {
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Add timestamp for specific statuses
  if (status === 'confirmed') updateData.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
  if (status === 'preparing') updateData.preparingAt = admin.firestore.FieldValue.serverTimestamp();
  if (status === 'ready') updateData.readyAt = admin.firestore.FieldValue.serverTimestamp();
  if (status === 'completed') updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
  if (status === 'cancelled') updateData.cancelledAt = admin.firestore.FieldValue.serverTimestamp();

  await ordersRef.doc(orderId).update(updateData);

  // Send push notification (placeholder)
  // await sendPushNotification(orderId, status);

  return successResponse({ orderId, status });
});

// ============ DRIVER FUNCTIONS ============

// Get available orders (for drivers)
exports.getAvailableOrders = functions.https.onCall(async (data, context) => {
  const snapshot = await ordersRef
    .where('status', '==', 'ready')
    .orderBy('createdAt', 'asc')
    .get();
  
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return successResponse(orders);
});

// Accept order (driver)
exports.acceptOrder = functions.https.onCall(async (data, context) => {
  const { orderId, driverId } = data;
  
  await ordersRef.doc(orderId).update({
    driverId,
    status: 'picking_up',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return successResponse({ orderId, driverId, status: 'picking_up' });
});

// ============ PAYMENT FUNCTIONS ============

// Create payment
exports.createPayment = functions.https.onCall(async (data, context) => {
  const { orderId, method } = data;
  
  const orderDoc = await ordersRef.doc(orderId).get();
  const orderData = orderDoc.data();

  const paymentRef = await db.collection('payments').add({
    orderId,
    amount: orderData.total,
    method,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return successResponse({ id: paymentRef.id, orderId, amount: orderData.total, method });
});

// Confirm payment
exports.confirmPayment = functions.https.onCall(async (data, context) => {
  const { paymentId } = data;
  
  await db.collection('payments').doc(paymentId).update({
    status: 'completed',
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return successResponse({ paymentId, status: 'completed' });
});

// ============ NOTIFICATION FUNCTIONS ============

// Send push notification (placeholder)
exports.sendNotification = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Only send notification if status changed
    if (newData.status === previousData.status) return;

    // TODO: Implement FCM notification
    console.log(`Order ${context.params.orderId} status changed: ${previousData.status} -> ${newData.status}`);
    
    return null;
  });

// ============ ANALYTICS FUNCTIONS ============

// Get daily stats
exports.getDailyStats = functions.https.onCall(async (data, context) => {
  const { date } = data;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const snapshot = await ordersRef
    .where('createdAt', '>=', startOfDay)
    .where('createdAt', '<=', endOfDay)
    .get();

  const orders = snapshot.docs.map(doc => doc.data());
  
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const orderCount = orders.length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return successResponse({
    date,
    totalRevenue,
    orderCount,
    completedCount,
    averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
  });
});
