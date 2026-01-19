// Example test file - replace with your own tests
describe('Example Test Suite', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should demonstrate async testing', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});