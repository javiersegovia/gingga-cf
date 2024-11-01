import { AppLoadContext } from '@remix-run/cloudflare'
import { GeneralModules } from '../schema'
import { db } from '.'

const generalModules = [
  {
    name: 'Content Management System (CMS)',
    description:
      'System for creating, editing, and managing website content without technical expertise',
    additionalInfo:
      'Suitable for dynamic content platforms like blogs and news sites',
  },
  {
    name: 'Search Functionality',
    description:
      'Enables content, product, or data search using keywords and filters',
    additionalInfo:
      'Features include autocomplete, faceted search, and relevancy sorting',
  },
  {
    name: 'Reporting and Data Visualization',
    description:
      'Tools for generating reports and visualizing data through charts and dashboards',
    additionalInfo:
      'Facilitates data-driven decision making with real-time analytics',
  },
  {
    name: 'Social Media Integration',
    description:
      'Integrates social platforms for content sharing, authentication, and feed display',
    additionalInfo:
      'Enhances user engagement and expands reach through social networks',
  },
  {
    name: 'Localization and Internationalization',
    description:
      'Supports multiple languages and regional settings for global audience',
    additionalInfo:
      'Includes translation management and cultural context adaptation',
  },
  {
    name: 'E-commerce Functionality',
    description:
      'Enables online product/service sales with listings, carts, and checkout processes',
    additionalInfo:
      'Involves inventory management, order tracking, and payment gateway integration',
  },
  {
    name: 'Machine Learning and AI Integration',
    description:
      'Incorporates AI for recommendations, predictive analytics, and natural language processing',
    additionalInfo: 'Enhances user experience through intelligent features',
  },
  {
    name: 'Offline Access and Synchronization',
    description:
      'Allows feature access without internet and data syncing when online',
    additionalInfo:
      'Crucial for applications used in areas with unreliable connectivity',
  },
  {
    name: 'Real-time Collaboration',
    description:
      'Enables simultaneous multi-user work on shared content or data',
    additionalInfo:
      'Useful for team projects and collaborative editing platforms',
  },
  {
    name: 'Chat and Messaging',
    description:
      'Provides in-app communication channels like live chat, messaging, or forums',
    additionalInfo: 'Enhances user interaction and support capabilities',
  },
  {
    name: 'User Profile and Settings',
    description:
      'Allows management of personal information, preferences, and account settings',
    additionalInfo: 'Supports personalization and improved user experience',
  },
  {
    name: 'File Upload and Management',
    description:
      'Enables file/media upload, storage, and management within the application',
    additionalInfo:
      'Includes file permissions, storage limits, and format support handling',
  },
  {
    name: 'Customer Support Module',
    description:
      'Provides tools for customer service, including ticketing and knowledge bases',
    additionalInfo:
      'Improves user satisfaction through efficient issue resolution',
  },
  {
    name: 'Performance Optimization',
    description:
      'Focuses on improving application speed, responsiveness, and resource efficiency',
    additionalInfo:
      'Involves caching, code optimization, and database indexing techniques',
  },
  {
    name: 'SEO Optimization',
    description:
      'Enhances application visibility on search engines through content/metadata optimization',
    additionalInfo:
      'Critical for attracting organic traffic to public-facing websites',
  },
  {
    name: 'Beta Testing and Feedback Collection',
    description:
      'Implements user testing, feedback collection, and bug reporting during development',
    additionalInfo: 'Aids in refining the application before official release',
  },
  {
    name: 'Version Control and Deployment Pipeline',
    description:
      'Establishes code management systems and automates deployment processes',
    additionalInfo:
      'Increases development efficiency and reduces deployment errors',
  },
  {
    name: 'Logging and Monitoring',
    description:
      'Captures logs and monitors application performance for maintenance',
    additionalInfo:
      'Essential for ensuring reliability and quick issue resolution',
  },
  {
    name: 'Data Backup and Recovery',
    description: 'Implements strategies for data backup and restoration',
    additionalInfo:
      'Critical for maintaining data integrity and business continuity',
  },
  {
    name: 'Subscription Management',
    description:
      'Manages user subscriptions, billing cycles, and access levels for SaaS',
    additionalInfo: 'Supports revenue models based on recurring payments',
  },
  {
    name: 'A/B Testing Module',
    description:
      'Allows testing different feature/layout versions for effectiveness',
    additionalInfo:
      'Facilitates data-driven decision-making to improve user engagement',
  },
  {
    name: 'Authentication and Authorization',
    description: 'Manages user identity verification and access control',
    additionalInfo:
      'Includes features like multi-factor authentication and role-based access',
  },
  {
    name: 'API Integration',
    description:
      'Facilitates connection with external services and data sources via APIs',
    additionalInfo:
      'Enables extended functionality and data exchange with third-party systems',
  },
  {
    name: 'Payment Processing',
    description: 'Handles secure financial transactions within the application',
    additionalInfo:
      'Includes integration with payment gateways and handling of multiple currencies',
  },
  {
    name: 'Analytics and Tracking',
    description:
      'Collects and analyzes user behavior and application usage data',
    additionalInfo:
      'Provides insights for product improvement and marketing strategies',
  },
  {
    name: 'Push Notifications',
    description:
      "Sends targeted messages to users' devices to increase engagement",
    additionalInfo:
      'Supports various notification types and user preference management',
  },
  {
    name: 'Security and Compliance',
    description:
      'Implements measures to protect data and ensure regulatory compliance',
    additionalInfo:
      'Includes encryption, secure coding practices, and compliance with standards like GDPR',
  },
  {
    name: 'Web Notifications',
    description:
      'Implements in-browser notifications for real-time user alerts',
    additionalInfo:
      'Includes customizable notification types, user preferences, and browser compatibility handling',
  },
  {
    name: 'Workflow Automation',
    description:
      'Creates and manages automated processes within the application',
    additionalInfo:
      'Supports rule-based actions, task scheduling, and integration with external systems',
  },
  {
    name: 'Multi-tenancy',
    description:
      'Enables single instance of software to serve multiple client organizations',
    additionalInfo:
      'Involves data isolation, customization options, and efficient resource sharing',
  },
  {
    name: 'Audit Trail',
    description: 'Records and tracks all user activities and system changes',
    additionalInfo:
      'Crucial for compliance, security monitoring, and troubleshooting',
  },
  {
    name: 'Content Delivery Network (CDN) Integration',
    description: 'Integrates with CDN services for optimized content delivery',
    additionalInfo:
      'Improves load times, reduces bandwidth costs, and enhances global accessibility',
  },
  {
    name: 'Gamification',
    description: 'Incorporates game-like elements to increase user engagement',
    additionalInfo:
      'Includes features like points systems, badges, leaderboards, and challenges',
  },
  {
    name: 'Data Export and Import',
    description: 'Facilitates bulk data transfer in and out of the application',
    additionalInfo:
      'Supports various file formats, data mapping, and handles large dataset processing',
  },
]

export async function seedGeneralModules() {
  console.time('📦 Created general modules...')

  const generalModulesToCreate = generalModules.map((module) => ({
    name: module.name,
    description: module.description,
    additionalInfo: module.additionalInfo,
  }))

  await db.insert(GeneralModules).values(generalModulesToCreate)

  console.timeEnd('📦 Created general modules...')
}
