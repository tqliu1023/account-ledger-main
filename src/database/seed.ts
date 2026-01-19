import { getDatabase } from './connection';

// Example seed data - replace with your own data as needed
export async function seedDatabase(): Promise<void> {
  const db = getDatabase();
  
  console.log('Seeding database...');
  
  try {
    // Example: Insert some sample data
    await db.run(
      'INSERT OR IGNORE INTO example_table (id, name) VALUES (?, ?)',
      ['example-1', 'Example Item']
    );
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}