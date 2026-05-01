const API = 'http://localhost:5000/api';

async function testAll() {
  try {
    // 1. Auth Login
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotel.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    const token = loginData.token;
    console.log('✅ Login successful');

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Menu Fetch
    const menuRes = await fetch(`${API}/menu`);
    const menuData = await menuRes.json();
    console.log(`✅ Menu fetched, count: ${menuData.length}`);

    // 3. Create a table
    const tableRes = await fetch(`${API}/tables`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tableNumber: 99, capacity: 4 })
    });
    const tableData = await tableRes.json();
    if (!tableRes.ok) throw new Error(JSON.stringify(tableData));
    const tableId = tableData._id;
    console.log('✅ Table created');

    // 4. Create an order
    const orderRes = await fetch(`${API}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableId: tableId,
        items: [{ menuItem: menuData[0]._id, qty: 2 }],
        totalAmount: menuData[0].price * 2
      })
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(JSON.stringify(orderData));
    const orderId = orderData._id;
    console.log('✅ Order created');

    // 5. Update order status
    const statusRes = await fetch(`${API}/orders/${orderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'Preparing' })
    });
    if (!statusRes.ok) throw new Error(await statusRes.text());
    console.log('✅ Order status updated');

    // 6. Generate Bill
    const billRes = await fetch(`${API}/bills/generate/${orderId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    const billData = await billRes.json();
    if (!billRes.ok) throw new Error(JSON.stringify(billData));
    console.log('✅ Bill generated');

    // 7. Get Bills
    const billsListRes = await fetch(`${API}/bills`, { headers });
    const billsList = await billsListRes.json();
    console.log(`✅ Bills fetched, count: ${billsList.length}`);

    console.log('🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testAll();
