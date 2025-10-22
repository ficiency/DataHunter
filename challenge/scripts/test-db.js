const db = require('../src/database/postgres');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Check connection
    console.log('Test 1: Checking connection...');
    const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connected at:', result.rows[0].current_time);
    console.log('📦 PostgreSQL:', result.rows[0].pg_version.split(',')[0]);
    console.log('');

    // Test 2: Check tables exist
    console.log('Test 2: Checking tables...');
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Test 3: Insert a test scan
    console.log('Test 3: Creating test scan...');
    const scan = await db.query(`
      INSERT INTO scans (user_id, target_name, status) 
      VALUES ($1, $2, $3) 
      RETURNING id, user_id, target_name, status, created_at
    `, ['test-user-123', 'John Doe', 'pending']);
    
    const scanId = scan.rows[0].id;
    console.log('✅ Test scan created:');
    console.log('   ID:', scanId);
    console.log('   Name:', scan.rows[0].target_name);
    console.log('   Status:', scan.rows[0].status);
    console.log('');

    // Test 4: Insert test findings
    console.log('Test 4: Creating test findings...');
    await db.query(`
      INSERT INTO findings (scan_id, website_url, data_type, found_value) 
      VALUES 
        ($1, $2, $3, $4),
        ($1, $5, $6, $7)
    `, [
      scanId, 
      'https://example.com/page1', 'name', 'John Doe',
      'https://example.com/page2', 'email', 'john@example.com'
    ]);
    console.log('✅ Test findings created (2 records)');
    console.log('');

    // Test 5: Query findings with JOIN
    console.log('Test 5: Querying findings with JOIN...');
    const findings = await db.query(`
      SELECT f.data_type, f.found_value, f.website_url, s.target_name
      FROM findings f
      JOIN scans s ON f.scan_id = s.id
      WHERE s.id = $1
    `, [scanId]);
    
    console.log('✅ Found', findings.rowCount, 'results:');
    findings.rows.forEach(f => {
      console.log(`   - ${f.data_type}: ${f.found_value}`);
      console.log(`     from: ${f.website_url}`);
    });
    console.log('');

    // Test 6: Update scan status
    console.log('Test 6: Updating scan status...');
    await db.query(`
      UPDATE scans 
      SET status = $1, completed_at = NOW() 
      WHERE id = $2
    `, ['completed', scanId]);
    console.log('✅ Scan status updated to completed');
    console.log('');

    // Test 7: Clean up test data
    console.log('Test 7: Cleaning up test data...');
    const deleted = await db.query('DELETE FROM scans WHERE user_id = $1', ['test-user-123']);
    console.log('✅ Deleted', deleted.rowCount, 'scan(s)');
    console.log('   (Findings were CASCADE deleted automatically)');
    console.log('');

    console.log('🎉 All tests passed! Database is ready.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.closePool();
    process.exit(0);
  }
}

testConnection();