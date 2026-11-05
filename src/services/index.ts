/**
 * Public entry point of the mobile service layer.
 *
 * Every function here is a direct port of the web app's `client/src/api/*`
 * modules, adapted to React Native (typed Supabase client, shared error
 * normalisation and network retries).
 */

/* Shared query / mutation helpers */
export {
  ServiceError,
  fetchOrNull,
  isNetworkError,
  isNotFoundError,
  isRetryableError,
  mutate,
  mutateVoid,
  query,
  runWithRetry,
  toServiceError,
} from './supabase/query';
export type { QueryOptions, RetryOptions, ServiceErrorShape } from './supabase/query';

/* Supabase client */
export { supabase, authStorage, secureStorage } from './supabase';

/* Narrowing helpers (database row → domain model) */
export { toDeliveryAddress, toDomainOrder, toDomainProfile } from './mappers';

/* Menu + categories */
export {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getAvailableMenuItems,
  getCategories,
  getCategoryById,
  getMenuItemById,
  getMenuItems,
  updateCategory,
  updateMenuItem,
  updateMenuItemStatus,
} from './menu.service';

/* Orders */
export {
  createOrder,
  getActiveOrderDeliver,
  getAllOrderByUserId,
  getAllOrders,
  getCustomerOrders,
  getDeliveryQueueByDeliveryId,
  getOrderByDeliverId,
  getOrderById,
  getOrderItemsDetails,
  getOrderWithItems,
  getOrders,
  getRecantOrdersDeliverd,
  takeOrderToDelivery,
  updateOrderStatus,
  withRequiredOrderItemFields,
} from './order.service';
export type {
  OrderItemDetails,
  OrderItemWithRequiredFields,
  OrderWithItems,
  OrderWithItemsList,
} from './order.service';

/* Profiles */
export {
  DELETE_PROFILE_UNAVAILABLE,
  getAllProfiles,
  getProfile,
  rateDelivery,
  updateProfile,
  updateProfileRole,
} from './profile.service';

/* Delivery requests + delivery dashboard */
export {
  createRequest,
  deleteRequestById,
  getActiveOrderDeliver as getActiveOrderForDelivery,
  getAllRequests,
  getRecantOrdersDeliverd as getRecentOrdersForDelivery,
  getRequestByEmail,
  getRequestById,
  updateRequestStatusById,
} from './delivery.service';

/* Authentication */
export {
  CREATE_USER_UNAVAILABLE,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  signupWithGoogle,
  updatePassword,
} from './auth.service';
export type { LoginInput, RegisterInput } from './auth.service';

/* Storage */
export { STORAGE_BUCKET, deleteImage, uploadFile } from './storage.service';
export type { RNFile } from './storage.service';

/* Reservations */
export {
  createReservation,
  getCustomerReservations,
  getReservationById,
  getReservations,
  updateReservationStatus,
} from './reservation.service';
