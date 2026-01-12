/**
 * ============================================================================
 * SETTINGS DATABASE MODEL
 * ============================================================================
 * This file defines the MongoDB schema for app settings using Mongoose
 * 
 * Structure:
 * - Each shop has one settings document (identified by shop domain)
 * - Settings are organized into nested schemas for better organization
 * - All fields have default values to ensure data consistency
 * - Timestamps are automatically added (createdAt, updatedAt)
 * 
 * Database: MongoDB
 * ODM: Mongoose
 * ============================================================================
 */

import mongoose from 'mongoose'

/**
 * ============================================================================
 * COUNTDOWN SCHEMA
 * ============================================================================
 * Stores countdown/timer display settings
 * Fields:
 * - show_countdown: Enable/disable countdown display
 * - count_down_bg: Background color for countdown
 * - countdown_text_color: Text color for countdown
 * - countdown_chip_bg: Background color for countdown chips
 * - countdown_chip_text: Text color for countdown chips
 * - countdown_border_radius: Border radius in pixels
 * ============================================================================
 */
const CountdownSchema = new mongoose.Schema({
  show_countdown: { type: Boolean, default: false },
  count_down_bg: { type: String, default: '#5B9BD5' }, // Updated default to match frontend
  countdown_text_color: { type: String, default: '#ffffff' },
  countdown_chip_bg: { type: String, default: '#ffffff' },
  countdown_chip_text: { type: String, default: '#2c3e50' }, // Updated default to match frontend
  countdown_border_radius: { type: Number, default: 50 } // Updated default to match frontend
}, { _id: false }) // _id: false prevents creating subdocument IDs

/**
 * ============================================================================
 * CART DRAWER SCHEMA
 * ============================================================================
 * Stores cart drawer styling settings
 * Fields:
 * - body_color: Background color of cart drawer
 * - text_color: Text color in cart drawer
 * - border_radius: Border radius in pixels
 * ============================================================================
 */
const CartDrawerSchema = new mongoose.Schema({
  body_color: { type: String, default: '#f0e5e7' }, // Updated default to match frontend
  text_color: { type: String, default: '#000' }, // Updated default to match frontend
  border_radius: { type: Number, default: 10 }, // Updated default to match frontend
  button_color: { type: String, default: '#f0e5e7' },
  button_text_color: { type: String, default: '#000' },
  button_border_radius: { type: Number, default: 10 }
}, { _id: false })

/**
 * ============================================================================
 * ANNOUNCEMENT BAR SCHEMA
 * ============================================================================
 * Stores announcement bar settings
 * Fields:
 * - enabled: Enable/disable announcement bar
 * - content: Text content to display in announcement bar
 * ============================================================================
 */
const AnnouncementBarSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  content: { type: String, default: 'Free shipping order above 999, Get 10% Off order above 1999' },
  background_color: { type: String, default: '#f0e5e7' },
  text_color: { type: String, default: '#000' },
  border_radius: { type: Number, default: 10 }
}, { _id: false })

/**
 * ============================================================================
 * COLLECTION SCHEMA
 * ============================================================================
 * Stores collection selection settings
 * Fields:
 * - enabled: Enable/disable collection feature
 * - selectedCollection: Object containing selected collection details
 *   - title: Collection title
 *   - handle: Collection handle (URL-friendly identifier)
 * ============================================================================
 */
const CollectionSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  selectedCollection: {
    title: { type: String, default: '' },
    handle: { type: String, default: '' }
  }
}, { _id: false })

/**
 * ============================================================================
 * PRODUCT SCHEMA
 * ============================================================================
 * Stores product selection settings
 * Fields:
 * - enabled: Enable/disable product feature
 * - selectedProduct: Object containing selected product details
 *   - handle: Product handle (URL-friendly identifier)
 *   - title: Product title
 *   - id: Shopify product ID
 * ============================================================================
 */
const ProductSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  selectedProduct: {
    handle: { type: String, default: '' },
    title: { type: String, default: '' },
    id: { type: String, default: '' }
  }
}, { _id: false })

/**
 * ============================================================================
 * THIRD-PARTY INTEGRATION SCHEMA
 * ============================================================================
 * Stores third-party integration settings
 * Fields:
 * - enabled: Enable/disable third-party integration
 * - htmlContent: HTML code to inject (e.g., tracking scripts, widgets)
 * ============================================================================
 */
const ThirdPartyIntegrationSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  htmlContent: { type: String, default: '' }
}, { _id: false })

/**
 * ============================================================================
 * MAIN SETTINGS SCHEMA
 * ============================================================================
 * Main schema that combines all settings sub-schemas
 * 
 * Fields:
 * - shop: Shop domain (unique identifier, indexed for fast queries)
 * - countdown: Countdown settings
 * - cartDrawer: Cart drawer settings
 * - announcementBar: Announcement bar settings
 * - collection: Collection selection settings
 * - product: Product selection settings
 * - thirdPartyIntegration: Third-party integration settings
 * - createdAt: Automatically added timestamp (when document created)
 * - updatedAt: Automatically added timestamp (when document updated)
 * 
 * Indexes:
 * - shop: Unique index ensures one settings document per shop
 * ============================================================================
 */
const SettingsSchema = new mongoose.Schema(
  {
    // Shop domain - unique identifier for each shop's settings
    shop: {
      type: String,
      required: true,  // Must be provided
      index: true,     // Create index for faster queries
      unique: true     // Ensure only one settings document per shop
    },

    // Nested schemas for organized settings
    countdown: CountdownSchema,
    cartDrawer: CartDrawerSchema,
    announcementBar: AnnouncementBarSchema,
    collection: CollectionSchema,
    product: ProductSchema,
    thirdPartyIntegration: ThirdPartyIntegrationSchema
  },
  {
    // Enable automatic timestamps
    // Mongoose will automatically add createdAt and updatedAt fields
    timestamps: true
  }
)

// Export the model for use in API routes
// Model name 'Settings' will create collection 'settings' in MongoDB
// export default mongoose.model('Settings', SettingsSchema)
export default mongoose.models.Settings
  || mongoose.model('Settings', SettingsSchema)

