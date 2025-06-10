const JupMCPClient = require('./client');

async function main() {
  // Initialize the client
  const client = new JupMCPClient('http://localhost:3000');

  try {
    // Example 1: Get a quote for swapping SOL to USDC
    console.log('Getting quote for SOL to USDC swap...');
    const quote = await client.getQuote('SOL', 'USDC', '1', 1);
    console.log('Quote:', quote);

    // Example 2: Get token information
    console.log('\nGetting token information for SOL...');
    const tokenInfo = await client.getTokenInfo('SOL');
    console.log('Token Info:', tokenInfo);

    // Example 3: Get token price
    console.log('\nGetting SOL/USDC price...');
    const price = await client.getTokenPrice('SOL', 'USDC');
    console.log('Price:', price);

    // Example 4: Create a recurring payment
    console.log('\nCreating recurring payment...');
    const recurringPayment = await client.createRecurringPayment(
      'SOL',
      'USDC',
      '1',
      'daily',
      'YOUR_SOLANA_PUBLIC_KEY'
    );
    console.log('Recurring Payment:', recurringPayment);

    // Example 5: Get recurring payments
    console.log('\nGetting recurring payments...');
    const payments = await client.getRecurringPayments('YOUR_SOLANA_PUBLIC_KEY');
    console.log('Recurring Payments:', payments);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main(); 