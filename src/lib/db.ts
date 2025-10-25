import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'us-phx-web1439.main-hosting.eu',
  user: 'u588575896_meetairoot',
  password: 'Meetai@1122333',
  database: 'u588575896_meetai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, 
});
