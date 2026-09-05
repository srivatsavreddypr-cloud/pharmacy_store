import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const {
  MYSQL_HOST = "localhost",
  MYSQL_PORT = "3306",
  MYSQL_USER = "root",
  MYSQL_PASSWORD = "sri@12122007", //enter your mysql password here
  MYSQL_DATABASE = "pharmacy_app",
} = process.env;

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

await ensureDatabaseExists();

export const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
      name VARCHAR(120) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      profile_photo LONGTEXT NULL,
      business_name VARCHAR(160) NULL,
      business_address VARCHAR(255) NULL,
      verification_document VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  const [profilePhotoColumns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_photo'`,
    [MYSQL_DATABASE]
  );
  if (profilePhotoColumns.length === 0) {
    await pool.query("ALTER TABLE users ADD COLUMN profile_photo LONGTEXT NULL");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_otps (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      purpose ENUM('login', 'password_reset') NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_auth_otps_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(160) NOT NULL,
      category VARCHAR(120) NOT NULL,
      description TEXT NULL,
      image_url VARCHAR(255) NULL,
      price DECIMAL(10,2) NOT NULL,
      discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_partners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      active_order_count INT NOT NULL DEFAULT 0,
      completed_order_count INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_partners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      vendor_type ENUM('seller', 'supplier') NOT NULL,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NULL,
      location VARCHAR(120) NULL,
      rating DECIMAL(3,2) NOT NULL DEFAULT 4.50,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS procurement_orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      vendor_id INT NOT NULL,
      vendor_type ENUM('seller', 'supplier') NOT NULL,
      source ENUM('seller-order', 'restock', 'emergency') NOT NULL,
      status ENUM('Pending', 'Approved', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
      urgency ENUM('low', 'medium', 'high') NULL,
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      notes VARCHAR(255) NULL,
      created_by_user_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_procurement_orders_vendor
        FOREIGN KEY (vendor_id) REFERENCES vendor_partners(id)
        ON DELETE RESTRICT,
      CONSTRAINT fk_procurement_orders_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS procurement_order_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      procurement_order_id INT NOT NULL,
      medicine_id INT NOT NULL,
      medicine_name VARCHAR(160) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_procurement_order_items_order
        FOREIGN KEY (procurement_order_id) REFERENCES procurement_orders(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_procurement_order_items_medicine
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        ON DELETE RESTRICT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS discount_campaigns (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(160) NOT NULL,
      discount_type ENUM('percentage', 'fixed') NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      min_quantity INT NULL,
      valid_until DATE NULL,
      promo_code VARCHAR(80) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS discount_campaign_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      campaign_id INT NOT NULL,
      medicine_id INT NOT NULL,
      original_price DECIMAL(10,2) NOT NULL,
      applied_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      discounted_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_discount_campaign_items_campaign
        FOREIGN KEY (campaign_id) REFERENCES discount_campaigns(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_discount_campaign_items_medicine
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        ON DELETE RESTRICT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      delivery_partner_id INT NULL,
      status ENUM('Processing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Processing',
      payment_method ENUM('cod', 'upi', 'card') NOT NULL,
      payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
      subtotal DECIMAL(10,2) NOT NULL,
      discount_total DECIMAL(10,2) NOT NULL DEFAULT 0,
      delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      address_label VARCHAR(80) NOT NULL,
      address_details VARCHAR(255) NOT NULL,
      notes VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_orders_delivery_partner
        FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id)
        ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL,
      medicine_id INT NOT NULL,
      medicine_name VARCHAR(160) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      quantity INT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_order_items_medicine
        FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        ON DELETE RESTRICT
    )
  `);

  const [medicineCountRows] = await pool.query("SELECT COUNT(*) AS count FROM medicines");
  if ((medicineCountRows[0]?.count || 0) === 0) {
    await pool.query(
      `INSERT INTO medicines (name, category, description, image_url, price, discount_percent, stock)
       VALUES
       ('Paracetamol 500mg', 'Pain Relief', 'Fast relief for fever and mild pain.', 'https://via.placeholder.com/150?text=Paracetamol', 25, 10, 120),
       ('Amoxicillin 250mg', 'Antibiotics', 'Prescription antibiotic for bacterial infections.', 'https://via.placeholder.com/150?text=Amoxicillin', 45, 5, 90),
       ('Vitamin C Tablets', 'Vitamins', 'Daily immunity support tablets.', 'https://via.placeholder.com/150?text=Vitamin+C', 120, 15, 160),
       ('Cough Syrup', 'Cough & Cold', 'Syrup for dry and wet cough relief.', 'https://via.placeholder.com/150?text=Cough+Syrup', 85, 8, 75),
       ('Ibuprofen 400mg', 'Pain Relief', 'Anti-inflammatory tablets for pain relief.', 'https://via.placeholder.com/150?text=Ibuprofen', 35, 0, 140),
       ('Insulin Pen', 'Diabetes Care', 'Insulin delivery pen for diabetes management.', 'https://via.placeholder.com/150?text=Insulin', 450, 12, 35)
      `
    );
  }

  const [partnerCountRows] = await pool.query("SELECT COUNT(*) AS count FROM delivery_partners");
  if ((partnerCountRows[0]?.count || 0) === 0) {
    await pool.query(
      `INSERT INTO delivery_partners (name, phone, active_order_count, completed_order_count)
       VALUES
       ('Ravi Kumar', '9876543210', 0, 5),
       ('Priya Sharma', '9876543211', 0, 3),
       ('Amit Patel', '9876543212', 0, 7)
      `
    );
  }

  const [vendorCountRows] = await pool.query("SELECT COUNT(*) AS count FROM vendor_partners");
  if ((vendorCountRows[0]?.count || 0) === 0) {
    await pool.query(
      `INSERT INTO vendor_partners (vendor_type, name, phone, location, rating)
       VALUES
       ('seller', 'MediSupply Co.', '9822001100', 'Mumbai', 4.50),
       ('seller', 'PharmaDistributors Ltd.', '9822001101', 'Delhi', 4.80),
       ('seller', 'HealthCare Wholesale', '9822001102', 'Bangalore', 4.30),
       ('seller', 'Global Pharma Solutions', '9822001103', 'Chennai', 4.70),
       ('supplier', 'Cipla', '9876543210', 'Mumbai', 4.60),
       ('supplier', 'GSK', '9876543211', 'Delhi', 4.70),
       ('supplier', 'Abbott', '9876543212', 'Bangalore', 4.50),
       ('supplier', 'Sun Pharma', '9876543213', 'Mumbai', 4.60),
       ('supplier', 'Pfizer', '9876543214', 'Chennai', 4.80)
      `
    );
  }
}
