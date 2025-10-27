// utils/logger.js
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where } from "firebase/firestore";

/**
 * Activity Logger Utility
 * Creates standardized log entries for all system activities
 */

// Log action types
export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  STATUS_CHANGE: 'status_change',
  TRANSFER: 'transfer',
  DEDUCT: 'deduct',
  ADD_STOCK: 'add_stock',
  BATCH_PROGRESS: 'batch_progress'
}

// Entity types being logged
export const LOG_ENTITIES = {
  BATCH: 'batch',
  STOCK: 'stock',
  FERMENTER: 'fermenter',
  PRODUCT: 'product',
  RECIPE: 'recipe',
  TAX: 'tax'
}

/**
 * Create a standardized log entry
 * @param {Object} params - Log parameters
 * @param {string} params.action - The action performed (from LOG_ACTIONS)
 * @param {string} params.entity - The entity type (from LOG_ENTITIES)
 * @param {string} params.entityId - The ID of the affected entity
 * @param {string} params.entityName - Human-readable name of the entity
 * @param {Object} params.changes - Object containing before/after values for updates
 * @param {string} params.description - Human-readable description of the action
 * @param {string} params.userId - ID of the user who performed the action
 * @param {Object} params.metadata - Additional context data
 */
export async function createLogEntry({
  action,
  entity,
  entityId,
  entityName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  try {
    const nuxtApp = useNuxtApp()
    const db = getFirestore(nuxtApp.$firebase)
    
    const logEntry = {
      action,
      entity,
      entityId,
      entityName,
      changes,
      description,
      userId,
      metadata,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    }

    const logsRef = collection(db, "logs")
    await addDoc(logsRef, logEntry)
    
    console.log('Log entry created:', logEntry)
    return logEntry
  } catch (error) {
    console.error('Failed to create log entry:', error)
    throw error
  }
}

/**
 * Get recent logs with optional filtering
 * @param {Object} filters - Filter options
 * @param {string} filters.entity - Filter by entity type
 * @param {string} filters.action - Filter by action type
 * @param {string} filters.entityId - Filter by specific entity ID
 * @param {number} filters.limit - Maximum number of logs to return (default: 100)
 */
export async function getLogs(filters = {}) {
  try {
    const nuxtApp = useNuxtApp()
    const db = getFirestore(nuxtApp.$firebase)
    
    let q = collection(db, "logs")
    
    // Apply filters
    if (filters.entity) {
      q = query(q, where('entity', '==', filters.entity))
    }
    if (filters.action) {
      q = query(q, where('action', '==', filters.action))
    }
    if (filters.entityId) {
      q = query(q, where('entityId', '==', filters.entityId))
    }
    
    // Order by timestamp descending and limit results
    q = query(q, orderBy('timestamp', 'desc'), limit(filters.limit || 100))
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return []
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Failed to retrieve logs:', error)
    throw error
  }
}

/**
 * Helper function to create a batch-specific log entry
 */
export async function logBatchActivity({
  action,
  batchId,
  batchName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.BATCH,
    entityId: batchId,
    entityName: batchName || batchId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Helper function to create a stock-specific log entry
 */
export async function logStockActivity({
  action,
  stockId,
  stockName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.STOCK,
    entityId: stockId,
    entityName: stockName || stockId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Helper function to create a fermenter-specific log entry
 */
export async function logFermenterActivity({
  action,
  fermenterId,
  fermenterName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.FERMENTER,
    entityId: fermenterId,
    entityName: fermenterName || fermenterId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Helper function to create a product-specific log entry
 */
export async function logProductActivity({
  action,
  productId,
  productName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.PRODUCT,
    entityId: productId,
    entityName: productName || productId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Helper function to create a recipe-specific log entry
 */
export async function logRecipeActivity({
  action,
  recipeId,
  recipeName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.RECIPE,
    entityId: recipeId,
    entityName: recipeName || recipeId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Helper function to create a tax-specific log entry
 */
export async function logTaxActivity({
  action,
  taxId,
  taxName,
  changes = null,
  description,
  userId = null,
  metadata = {}
}) {
  return createLogEntry({
    action,
    entity: LOG_ENTITIES.TAX,
    entityId: taxId,
    entityName: taxName || taxId,
    changes,
    description,
    userId,
    metadata
  })
}

/**
 * Format changes object for display
 * @param {Object} changes - Changes object with before/after values
 * @returns {string} - Formatted string describing the changes
 */
export function formatChanges(changes) {
  if (!changes) return ''
  
  const changesList = Object.entries(changes).map(([field, { before, after }]) => {
    return `${field}: "${before}" → "${after}"`
  })
  
  return changesList.join(', ')
}

/**
 * Get a human-readable action description
 * @param {string} action - Action type
 * @returns {string} - Human-readable action description
 */
export function getActionDescription(action) {
  const descriptions = {
    [LOG_ACTIONS.CREATE]: 'Created',
    [LOG_ACTIONS.UPDATE]: 'Updated',
    [LOG_ACTIONS.DELETE]: 'Deleted',
    [LOG_ACTIONS.STATUS_CHANGE]: 'Status Changed',
    [LOG_ACTIONS.TRANSFER]: 'Transferred',
    [LOG_ACTIONS.DEDUCT]: 'Deducted from Stock',
    [LOG_ACTIONS.ADD_STOCK]: 'Added to Stock',
    [LOG_ACTIONS.BATCH_PROGRESS]: 'Batch Progress Update'
  }
  
  return descriptions[action] || action
}

/**
 * Get entity type display name
 * @param {string} entity - Entity type
 * @returns {string} - Human-readable entity name
 */
export function getEntityDisplayName(entity) {
  const displayNames = {
    [LOG_ENTITIES.BATCH]: 'Batch',
    [LOG_ENTITIES.STOCK]: 'Stock',
    [LOG_ENTITIES.FERMENTER]: 'Fermenter',
    [LOG_ENTITIES.PRODUCT]: 'Product',
    [LOG_ENTITIES.RECIPE]: 'Recipe',
    [LOG_ENTITIES.TAX]: 'Tax Record'
  }
  
  return displayNames[entity] || entity
}