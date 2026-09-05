import { apiRequest } from "./auth";

export function fetchMedicines() {
  return apiRequest("/medicines");
}

export function fetchDeliveryPartners() {
  return apiRequest("/delivery-partners");
}

export function fetchOrders(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiRequest(`/orders${query}`);
}

export function fetchHomeOverview(userId) {
  return apiRequest(`/home?userId=${encodeURIComponent(userId)}`);
}

export function createOrder(payload) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createDeliveryPartner(payload) {
  return apiRequest("/delivery-partners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteDeliveryPartner(id) {
  return apiRequest(`/delivery-partners/${id}`, {
    method: "DELETE",
  });
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminDashboard() {
  return apiRequest("/admin/dashboard");
}

export function fetchAdminAnalytics(range = "weekly") {
  return apiRequest(`/admin/analytics?range=${encodeURIComponent(range)}`);
}

export function fetchAdminAlerts() {
  return apiRequest("/admin/alerts");
}

export function fetchAdminInsights() {
  return apiRequest("/admin/insights");
}

export function fetchAdminReport(params) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/admin/report?${query}`);
}

export function fetchVendors(vendorType) {
  const query = vendorType ? `?vendorType=${encodeURIComponent(vendorType)}` : "";
  return apiRequest(`/admin/vendors${query}`);
}

export function fetchProcurementOrders(source) {
  const query = source ? `?source=${encodeURIComponent(source)}` : "";
  return apiRequest(`/admin/procurement-orders${query}`);
}

export function createProcurementOrder(payload) {
  return apiRequest("/admin/procurement-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function applyBulkDiscount(payload) {
  return apiRequest("/admin/discounts/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserProfile(userId, payload) {
  return apiRequest(`/users/${encodeURIComponent(userId)}/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchPredictionSymptoms() {
  return apiRequest("/prediction/symptoms");
}

export function predictDisease(symptoms) {
  return apiRequest("/prediction/disease", {
    method: "POST",
    body: JSON.stringify({ symptoms }),
  });
}
